document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const switchToRegisterLink = document.getElementById('switch-to-register');
    const switchToLoginLink = document.getElementById('switch-to-login');

    /**
     * Toggles visibility between the Login and Register forms.
     */
    function toggleForm(isLogin) {
        if (isLogin) {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            signupForm.style.display = 'block';
            loginForm.style.display = 'none';
        }
    }

    switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForm(false);
    });

    switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForm(true);
    });

    // --- ROLE SELECTION & DYNAMIC SOCIETY FIELD ---
    // We inject the Society Name field into the signup form dynamically
    const signupRoleGroup = signupForm.querySelector('.role-toggle-group');
    const societyFieldHtml = `
        <div id="society-name-group" class="form-group" style="display: none; margin-top: 15px;">
            <label for="signupSocietyName">Society Name</label>
            <input type="text" id="signupSocietyName" placeholder="e.g., Coding Club or Music Society">
        </div>
    `;
    signupRoleGroup.insertAdjacentHTML('afterend', societyFieldHtml);
    const societyGroup = document.getElementById('society-name-group');
    const societyInput = document.getElementById('signupSocietyName');

    document.querySelectorAll('.role-toggle-group').forEach(group => {
        group.addEventListener('click', (event) => {
            if (event.target.classList.contains('role-button')) {
                const selectedRole = event.target.dataset.role;
                const form = event.target.closest('form');
                const hiddenSelect = form.querySelector('.role-select');
                
                // Update visuals
                group.querySelectorAll('.role-button').forEach(btn => {
                    btn.classList.remove('selected-role');
                });
                event.target.classList.add('selected-role');
                hiddenSelect.value = selectedRole;

                // Show/Hide Society Name field only for Signup form
                if (form.id === 'signup-form') {
                    if (selectedRole === 'Society') {
                        societyGroup.style.display = 'block';
                        societyInput.setAttribute('required', 'true');
                    } else {
                        societyGroup.style.display = 'none';
                        societyInput.removeAttribute('required');
                        societyInput.value = ''; // Clear if they switch away
                    }
                }
            }
        });
    });

    // --- LOGIN SUBMISSION LOGIC ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data._id);
                if (data.societyId) {
                    localStorage.setItem('societyId', data.societyId);
                }
                if (data.role === 'Admin') {
                    window.location.href = '../admin/admin-dashboard.html';
                } else {
                    window.location.href = '../society/society-dashboard.html';
                }
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            // Only show alert if login was not successful and not redirected
            console.error("Login Error:", err);
            // Only show alert if not already redirected
            if (!window.location.href.includes('admin-dashboard.html') && !window.location.href.includes('society-dashboard.html')) {
                alert("Connection error. Is the server running?");
            }
        }
    });

    // --- SIGNUP SUBMISSION LOGIC ---
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: signupForm.querySelector('input[placeholder*="Full Name"]').value,
            email: signupForm.querySelector('input[type="email"]').value,
            password: signupForm.querySelector('input[type="password"]').value,
            role: signupForm.querySelector('.role-select').value,
            societyName: societyInput.value // Captures society name if manager
        };

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (response.ok) {
    // If your backend sends societyId back after signup
    if (data.societyId) {
        localStorage.setItem('societyId', data.societyId);
    }
    alert("Registration successful!");
     toggleForm(true);
    // ... redirect or toggle form ...
}

           else {
                alert(data.message || "Signup failed");
            }
        } catch (err) {
            console.error("Signup Error:", err);
            alert("Connection error during registration.");
        }
    });

    // Initial setup
    toggleForm(true); 
});