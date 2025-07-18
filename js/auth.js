// Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    const correctPassword = 'yb150924';
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    
    // Check if user is already logged in
    checkAuthStatus();

    // Toggle password visibility
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' ? 
                '<i class="far fa-eye text-gray-400 hover:text-gray-600"></i>' : 
                '<i class="far fa-eye-slash text-gray-400 hover:text-gray-600"></i>';
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = passwordInput.value;
            
            if (password === correctPassword) {
                // Store auth in session storage
                sessionStorage.setItem('authenticated', 'true');
                sessionStorage.setItem('auth_timestamp', Date.now());
                
                // Redirect to dashboard
                window.location.href = 'pages/dashboard.html';
            } else {
                // Show error message
                errorMessage.classList.remove('hidden');
                
                // Clear password field
                passwordInput.value = '';
                
                // Focus on password field
                passwordInput.focus();
            }
        });
    }
});

// Check if user is authenticated
function checkAuthStatus() {
    const currentPage = window.location.pathname;
    const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
    
    // If on login page and already authenticated, redirect to dashboard
    if (currentPage.endsWith('index.html') || currentPage.endsWith('/')) {
        if (isAuthenticated) {
            window.location.href = 'pages/dashboard.html';
        }
    } 
    // If on any other page and not authenticated, redirect to login
    else if (!isAuthenticated) {
        // Extract the directory depth to ensure proper path to index.html
        const pathParts = currentPage.split('/');
        let pathPrefix = '';
        
        for (let i = 0; i < pathParts.length - 1; i++) {
            if (pathParts[i] === 'pages') {
                pathPrefix = '../';
                break;
            }
        }
        
        window.location.href = pathPrefix + 'index.html';
    }
}

// Function to log out
function logout() {
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('auth_timestamp');
    
    // Redirect to login page
    const pathParts = window.location.pathname.split('/');
    let pathPrefix = '';
    
    for (let i = 0; i < pathParts.length - 1; i++) {
        if (pathParts[i] === 'pages') {
            pathPrefix = '../';
            break;
        }
    }
    
    window.location.href = pathPrefix + 'index.html';
}
