const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
 
const app = express();


// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Route to serve home.html for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/home.html'));
});
// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// MongoDB Config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// User Schema
const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    uid: { type: String, required: true, unique: true },
    totalBalance: { type: Number, default: 0 }, // The user's total balance
    holdings: [
        {
            name: { type: String },
            symbol: { type: String },
            amount: { type: Number },
            value: { type: Number }
        }
    ] // The user's holdings list
});



const User = mongoose.model('User', UserSchema);

// Deposit Method Schema
const DepositMethodSchema = new mongoose.Schema({
    method: { type: String, required: true },
    details: { type: String, required: true }
});
const DepositMethod = mongoose.model('DepositMethod', DepositMethodSchema);

// Route to fetch all deposit methods
app.get('/admin/deposit', authenticateJWT, async (req, res) => {
    try {
        const depositMethods = await DepositMethod.find();
        res.json(depositMethods);
    } catch (error) {
        console.error('Error fetching deposit methods:', error);
        res.status(500).json({ message: 'Error fetching deposit methods' });
    }
});


app.post('/admin/deposit', authenticateJWT, async (req, res) => {
    const { method, details } = req.body;
    try {
        let depositMethod = await DepositMethod.findOne({ method });
        if (depositMethod) {
            depositMethod.details = details;
            await depositMethod.save();
            res.json({ message: `${method} details updated successfully` });
        } else {
            depositMethod = new DepositMethod({ method, details });
            await depositMethod.save();
            res.json({ message: `${method} details added successfully` });
        }
    } catch (error) {
        console.error('Error saving deposit method:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Route to fetch a specific deposit method
app.get('/deposit/:method', authenticateJWT, async (req, res) => {
    const { method } = req.params;
    try {
        const depositMethod = await DepositMethod.findOne({ method });
        if (!depositMethod) {
            return res.status(404).json({ message: 'Deposit method not found' });
        }
        res.json(depositMethod);
    } catch (error) {
        console.error('Error fetching deposit method:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// User sign up and login routes...

// User sign up
app.post('/signup', async (req, res) => {
    const { fullName, email, username, password, phone } = req.body;

    try {
        // Convert email and username to lowercase for case-insensitive storage
        const lowerEmail = email.toLowerCase();
        const lowerUsername = username.toLowerCase();

        // Check if the user already exists with the same email or username
        const existingUser = await User.findOne({ 
            $or: [{ email: lowerEmail }, { username: lowerUsername }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a shortened UID
        const uid = uuidv4().slice(0, 8);

        // Create new user with lowercase email and username, and shortened UID
        const user = new User({ 
            fullName, 
            email: lowerEmail, 
            username: lowerUsername, 
            password: hashedPassword, 
            phone,
            uid, // Save shortened UID
            balance: 0, // empty by default but later can be credited $100 for a new users by the company
            holdings: [] // Default rmpty holdings
        });
        
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



 
// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    console.log("Received login request:", req.body);

    try {
        // Convert username/email to lowercase for case-insensitive comparison
        const user = await User.findOne({ 
            $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }] 
        });
        
        console.log("User found in database:", user);

        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password mismatch");
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: 'Server error' });
    }
});


//Backend to get user details

app.get('/user', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user); // Log the data here for debugging

        res.json({
            username: user.username,  // Added username to the response
            uid: user.uid
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


//route to fetch holding by UID

// Fetch Holdings for a User by UID
app.get('/admin/user-holdings/:uid', authenticateJWT, async (req, res) => {
    const { uid } = req.params;  // Get the UID from the URL params

    try {
        // Find the user by their UID
        const user = await User.findOne({ uid: uid });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If the user exists, return the holdings data
        res.json({
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            holdings: user.holdings  // Directly return the user's holdings array
        });

    } catch (error) {
        console.error('Error fetching user holdings:', error);
        res.status(500).json({ message: 'Server error occurred' });
    }
});





//route to add new holding

app.post('/admin/add-holding', authenticateJWT, async (req, res) => {
    const { uid, name, symbol, amount, value } = req.body;
    try {
        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.holdings.push({ name, symbol, amount, value });
        await user.save();
        res.json({ message: 'Holding added successfully', holdings: user.holdings });
    } catch (error) {
        console.error('Error adding holding:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Update user's total balance
app.put('/admin/user-balance/:uid', async (req, res) => {
    const { uid } = req.params;
    const { totalBalance } = req.body;

    try {
        const user = await User.findOneAndUpdate({ uid }, { totalBalance }, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: "Total balance updated successfully", totalBalance });
    } catch (error) {
        console.error("Error updating total balance:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// Backend route to get user portfolio (add this to server.js)
app.get('/portfolio', authenticateJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming holdings are stored in the User model as an array
        res.json({
            totalBalance: user.totalBalance,  // Example: total balance field
            holdings: user.holdings           // Example: holdings array
        });
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 