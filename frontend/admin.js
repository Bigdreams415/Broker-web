// admin.js

document.addEventListener('DOMContentLoaded', () => {
    const depositForm = document.getElementById('deposit-form');
    const depositList = document.getElementById('deposit-list');
    const responseMessage = document.getElementById('response-message');

    // Function to fetch deposit methods
    async function fetchDepositMethods() {
        const token = localStorage.getItem('authToken'); // Get the JWT token

        try {
            const response = await fetch('http://localhost:3000/admin/deposit', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Include token for authentication
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch deposit methods');
            }

            const data = await response.json();
            updateDepositList(data); // Call function to update the deposit list
        } catch (error) {
            console.error('Error fetching deposit methods:', error);
        }
    }

    // Initial fetch of deposit methods on load
    fetchDepositMethods();

    console.log('Fetching deposit methods...');


    // Form submission
    depositForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const method = document.getElementById('method').value;
        const details = document.getElementById('details').value;
        const token = localStorage.getItem('authToken'); // Get the JWT token

        try {
            const response = await fetch('http://localhost:3000/admin/deposit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include token for authentication
                },
                body: JSON.stringify({ method, details })
            });

            const result = await response.json();
            responseMessage.classList.remove('hidden');
            responseMessage.textContent = result.message;

            if (response.ok) {
                depositForm.reset(); // Reset the form after successful submission
                fetchDepositMethods(); // Refresh the list of deposit methods
            } else {
                console.error('Error saving deposit method:', result.message);
            }
        } catch (error) {
            console.error('Server error:', error);
            responseMessage.textContent = 'Server error occurred.';
        }
    });

    // Update the list of deposit methods
    function updateDepositList(depositMethods) {
        depositList.innerHTML = ''; // Clear current list
        depositMethods.forEach(method => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>${method.method}</strong>
                <p>${method.details}</p> <!-- Display the details directly -->
            `;
            depositList.appendChild(listItem);
        });
    }
});


//Tab Switching functionality
document.addEventListener('DOMContentLoaded', () => {
    const manageDepositsLink = document.getElementById('manage-deposits');
    const manageHoldingsLink = document.getElementById('manage-holdings');
    const depositFormSection = document.getElementById('deposit-form-section');
    const manageHoldingsSection = document.getElementById('manage-holdings-section');

    // Function to show the deposits section and hide holdings
    function showDepositsSection() {
        depositFormSection.style.display = 'block';
        manageHoldingsSection.style.display = 'none';
        manageDepositsLink.classList.add('active');
        manageHoldingsLink.classList.remove('active');
    }

    // Function to show the holdings section and hide deposits
    function showHoldingsSection() {
        depositFormSection.style.display = 'none';
        manageHoldingsSection.style.display = 'block';
        manageHoldingsLink.classList.add('active');
        manageDepositsLink.classList.remove('active');
    }

    // Event listeners for toggling between sections
    manageDepositsLink.addEventListener('click', (event) => {
        event.preventDefault();
        showDepositsSection();
    });

    manageHoldingsLink.addEventListener('click', (event) => {
        event.preventDefault();
        showHoldingsSection();
    });

    // Initial state: show the deposits section
    showDepositsSection();
});

// Fetch Holdings and Display
document.getElementById('search-btn').addEventListener('click', async () => {
    const uid = document.getElementById('uid-search').value;
    console.log("Fetching holdings for UID:", uid);

    try {
        const response = await fetch(`http://localhost:3000/admin/user-holdings/${uid}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        console.log('Data from backend:', data);

        const holdingsList = document.getElementById('holdings-list');
        holdingsList.innerHTML = ""; // Clear previous content

        if (data.holdings && data.holdings.length === 0) {
            holdingsList.innerHTML = "<p>No holdings found for this user.</p>";
        } else {
            data.holdings.forEach(holding => {
                const holdingElement = document.createElement('div');
                holdingElement.textContent = `${holding.name} (${holding.symbol}): ${holding.amount} units worth $${holding.value}`;
                holdingsList.appendChild(holdingElement);
            });
        }

        // Update total balance display as sum of amounts
        const totalAmount = data.holdings.reduce((total, holding) => total + holding.amount, 0);
        document.getElementById('total-balance').value = totalAmount;

    } catch (error) {
        console.error("Error fetching holdings:", error);
    }
});

// Add New Holding and Update Total Amount
document.getElementById('add-holding-btn').addEventListener('click', async () => {
    const uid = document.getElementById('uid-search').value;
    const name = document.getElementById('holding-name').value;
    const symbol = document.getElementById('holding-symbol').value;
    const amount = parseFloat(document.getElementById('holding-amount').value);
    const value = parseFloat(document.getElementById('holding-value').value);

    try {
        // Add new holding
        const response = await fetch('http://localhost:3000/admin/add-holding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ uid, name, symbol, amount, value })
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        console.log("Holding added successfully");

        // Fetch updated holdings to recalculate total amount
        const updatedHoldingsResponse = await fetch(`http://localhost:3000/admin/user-holdings/${uid}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        const updatedData = await updatedHoldingsResponse.json();

        // Calculate the new total amount
        const totalAmount = updatedData.holdings.reduce((total, holding) => total + holding.amount, 0);

        // Update total amount in the database
        await fetch(`http://localhost:3000/admin/user-balance/${uid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ totalBalance: totalAmount })
        });

        console.log("Total amount updated:", totalAmount);

        // Update display of total amount on the page
        document.getElementById('total-balance').value = totalAmount;

    } catch (error) {
        console.error("Error updating holdings or balance:", error);
    }
});


// Event listener for updating total balance from input
document.getElementById('update-balance-btn').addEventListener('click', async () => {
    const uid = document.getElementById('uid-search').value;
    const totalBalance = parseFloat(document.getElementById('total-balance').value);

    if (!uid || isNaN(totalBalance)) {
        console.error("UID or Total Balance input is invalid");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/admin/user-balance/${uid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ totalBalance })
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        console.log("Total balance updated successfully:", totalBalance);

    } catch (error) {
        console.error("Error updating total balance:", error);
    }
});
