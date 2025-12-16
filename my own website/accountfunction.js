// Simple database using localStorage
const USERS_KEY = 'users';

// Get users from localStorage
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Handle signup form submission
function handleSignup(event) {
    event.preventDefault();

    const fullname = document.querySelector('input[name="fullname"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;
    const confirmPassword = document.querySelector('input[name="confirm_password"]').value;

    // Validation
    if (!fullname || !email || !password || !confirmPassword) {
        alert('All fields are required.');
        return false;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return false;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return false;
    }

    const users = getUsers();
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        alert('Email already registered.');
        return false;
    }

    // Add new user
    users.push({ fullname, email, password });
    saveUsers(users);

    alert('Account created successfully! Please sign in.');
    window.location.href = 'signin.html';
    return false;
}

// Handle signin form submission
function handleSignin(event) {
    event.preventDefault();

    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;

    // Validation
    if (!email || !password) {
        alert('Email and password are required.');
        return false;
    }

    const users = getUsers();
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        alert('Sign in successful!');
        // Store current user session (simple)
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = ''; // just the main
    } else {
        alert('Invalid email or password.');
    }

    return false;
}

// Check if user is signed in (for main interface)
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'signin.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'signin.html';
}
