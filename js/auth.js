// Admin Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    const correctPassword = '150924';
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    
    // Check if admin is already logged in
    checkAdminAuthStatus();

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

    // Handle admin login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = passwordInput.value;
            
            // Admin giriş kontrolü: sadece "150924" şifresi
            if (password === correctPassword) {
                // Admin oturumunu localStorage'a kaydet
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUsername', 'admin');
                localStorage.setItem('adminLoginTime', new Date().toISOString());
                
                // Admin paneline yönlendir
                window.location.href = 'admin.html';
            } else {
                // Hata mesajını göster
                errorMessage.classList.remove('hidden');
                errorMessage.textContent = 'Yanlış şifre! Lütfen tekrar deneyin.';
                
                // Şifre alanını temizle
                passwordInput.value = '';
                
                // Şifre alanına odaklan
                passwordInput.focus();
                
                // Hata mesajını 3 saniye sonra gizle
                setTimeout(() => {
                    errorMessage.classList.add('hidden');
                }, 3000);
            }
        });
    }
});

// Check if admin is authenticated
function checkAdminAuthStatus() {
    const currentPage = window.location.pathname;
    const isAdminAuthenticated = localStorage.getItem('adminLoggedIn') === 'true';
    
    // If on login page and already authenticated as admin, redirect to admin panel
    if (currentPage.endsWith('index.html') || currentPage.endsWith('/')) {
        if (isAdminAuthenticated) {
            window.location.href = 'admin.html';
        }
    }
}

// Function to log out admin
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminLoginTime');
    
    // Redirect to login page
    window.location.href = 'index.html';
}
