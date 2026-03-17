// frontend/assets/js/api.js

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Get and set global token from localStorage (better than a global JS variable)
const getAuthToken = () => localStorage.getItem('token');
const getAuthRole = () => localStorage.getItem('role');
const setAuthData = (token, role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
};
const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};

// Generic utility for displaying status messages
const displayMessage = (elementId, message, isSuccess = true) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.textContent = message;
    element.className = 'message ' + (isSuccess ? 'success' : 'error');
};

// Generic fetch wrapper for protected routes
const protectedFetch = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) {
        displayMessage('global-message', 'Authentication required. Please log in.', false);
        return { ok: false, status: 401, json: async () => ({ message: 'Not authenticated' }) };
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    options.headers = {
        ...defaultHeaders,
        ...options.headers,
    };

    return fetch(url, options);
};

// Function to redirect user based on role after login
const redirectToDashboard = (role) => {
    switch (role) {
        case 'Admin':
            window.location.href = '../admin/admin-dashboard.html';
            break;
        case 'Society':
            window.location.href = '../society/society-dashboard.html';
            break;
        case 'Student':
        default:
            window.location.href = '../student/student-home.html';
            break;
    }
};

const logout = () => {
    clearAuthData();
    // Redirect to the login/signup page
    window.location.href = 'login-signup.html';
};