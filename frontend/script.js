function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.append(script);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await loadScript("https://cdn.jsdelivr.net/npm/sweetalert2@11");

        // Signup form
        const signupForm = document.getElementById("signupForm");
        if (signupForm) {
            signupForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                // Form data collection
                const fullName = document.getElementById("fullName").value.trim();
                const email = document.getElementById("signupEmail").value.trim().toLowerCase();
                const username = document.getElementById("signupUsername").value.trim().toLowerCase();
                const password = document.getElementById("signupPassword").value;
                const confirmPassword = document.getElementById("confirmPassword").value;
                const phone = document.getElementById("phone").value.trim();

                // Check if passwords match
                if (password !== confirmPassword) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Passwords do not match!',
                        text: 'Please ensure both passwords are the same.',
                    });
                    return;
                }

                // Form data object
                const formData = {
                    fullName,
                    email,
                    username,
                    password,
                    phone,
                };

                try {
                    // Send data to backend
                    const response = await fetch("http://localhost:3000/signup", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    });

                    const result = await response.json();
                    if (response.ok) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Account created successfully!',
                            showConfirmButton: false,
                            timer: 7000
                        });
                        signupForm.reset();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Sign-Up Failed',
                            text: result.message || "An error occurred during sign-up.",
                        });
                    }
                } catch (error) {
                    console.error("Error:", error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Server Error',
                        text: 'Failed to connect to the server. Please try again later.',
                    });
                }
            });
        }

    // User login

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            // Get form data
            const loginInput = document.getElementById("loginEmail").value.trim().toLowerCase();
            const loginPassword = document.getElementById("loginPassword").value;

            // Create login data object
            const loginData = {
                username: loginInput,   
                password: loginPassword
            };

            // console.log("Login Data:", loginData);   

            try {
                // Send login data to backend
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(loginData),
                });

                const result = await response.json();

                if (response.ok) {
                    // Successful login
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: 'Redirecting...',
                        showConfirmButton: false,
                        timer: 2000
                    });

                    // Store token or proceed as needed
                    localStorage.setItem("authToken", result.token);
                    setTimeout(() => {
                        window.location.href = "welcome.html"; // Redirect after successful login
                    }, 2000);
                } else {
                    // Login failed
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: result.message || "Invalid credentials. Please try again.",
                    });
                }
            } catch (error) {
                console.error("Error:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: 'Failed to connect to the server. Please try again later.',
                });
            }
        });
    }


    } catch (error) {
        console.error(error);
        alert("Failed to load SweetAlert2");
    }
});
