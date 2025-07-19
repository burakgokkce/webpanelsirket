// Üye giriş doğrulama
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('memberLoginForm');
    const errorMessage = document.getElementById('errorMessage');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Yetkili kullanıcı listesi
    const authorizedUsers = [
        'bayremyeleç', 'fatmanurakcebe', 'fatmanurbozoğlu', 'büşraöner',
        'mervesude', 'mervearslan', 'ahmetyeniçeri', 'erenalpyılmaz',
        'burakgokce', 'oğuzhankatlanoğlu', 'kübratankişi', 'betülkarasu',
        'denizbitmezituğbaişleyen', 'ebrunurkamalı', 'mustafanalbant', 'pelinceylan'
    ];

    // Şifre görünürlük toggle
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePassword.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });

    // Form gönderimi
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        
        // Giriş bilgileri kontrolü
        // Kullanıcı adı listede var mı ve şifre doğru mu kontrol et
        const expectedPassword = username + '150924';
        
        if (authorizedUsers.includes(username) && password === expectedPassword) {
            // Başarılı giriş
            localStorage.setItem('memberLoggedIn', 'true');
            localStorage.setItem('memberUsername', username);
            localStorage.setItem('memberLoginTime', new Date().toISOString());
            
            // Üye paneline yönlendir
            window.location.href = 'uye-panel.html';
        } else {
            // Hatalı giriş
            errorMessage.classList.remove('hidden');
            errorMessage.textContent = 'Kullanıcı adı veya şifre hatalı!';
            
            // Formu temizle
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
            
            // Hata mesajını 3 saniye sonra gizle
            setTimeout(() => {
                errorMessage.classList.add('hidden');
            }, 3000);
        }
    });

    // Sayfa yüklendiğinde zaten giriş yapılmış mı kontrol et
    if (localStorage.getItem('memberLoggedIn') === 'true') {
        window.location.href = 'uye-panel.html';
    }
});
