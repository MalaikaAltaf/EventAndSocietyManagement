document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');

    // --- SIGNUP ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: signupForm['signup-name'].value,
                email: signupForm['signup-email'].value,
                password: signupForm['signup-password'].value,
                role: signupForm['signup-role'].value,
                department: signupForm['signup-dept'].value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    displayMessage('signup-message', `Registration successful! User: ${result.name} (${result.role})`, true); 
                    setAuthData(result.token, result.role); // Save token/role
                    redirectToDashboard(result.role); // Redirect
                } else {
                    displayMessage('signup-message', `Registration failed: ${result.message}`, false);
                }
            } catch (error) {
                displayMessage('signup-message', 'Error connecting to server.', false);
            }
        });
    }

    // --- LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                email: loginForm['login-email'].value,
                password: loginForm['login-password'].value,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    displayMessage('login-message', `Logged in successfully as ${result.role}!`, true);
                    setAuthData(result.token, result.role);
                    redirectToDashboard(result.role);
                } else {
                    displayMessage('login-message', `Login failed: ${result.message}`, false);
                }
            } catch (error) {
                displayMessage('login-message', 'Error connecting to server.', false);
            }
        });
    }
});
