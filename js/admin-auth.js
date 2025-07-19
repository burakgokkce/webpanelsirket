// Admin yetkilendirme kontrolü
document.addEventListener('DOMContentLoaded', function() {
    // Admin giriş kontrolü
    function checkAdminAuth() {
        const adminLoggedIn = localStorage.getItem('adminLoggedIn');
        const adminUsername = localStorage.getItem('adminUsername');
        
        // Eğer admin girişi yapılmamışsa veya kullanıcı admin değilse
        if (adminLoggedIn !== 'true' || adminUsername !== 'admin') {
            // Üye giriş sayfasına yönlendir
            window.location.href = 'uye-giris.html';
            return false;
        }
        return true;
    }
    
    // Sayfa yüklendiğinde admin kontrolü yap
    if (!checkAdminAuth()) {
        return;
    }
    
    // Admin çıkış butonu
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function() {
            if (confirm('Admin panelinden çıkış yapmak istediğinizden emin misiniz?')) {
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminUsername');
                localStorage.removeItem('adminLoginTime');
                window.location.href = 'index.html';
            }
        });
    }
});
