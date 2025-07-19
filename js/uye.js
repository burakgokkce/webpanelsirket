// Üye paneli - sadece okuma modu
document.addEventListener('DOMContentLoaded', function() {
    // Giriş kontrolü
    if (localStorage.getItem('memberLoggedIn') !== 'true') {
        window.location.href = 'uye-giris.html';
        return;
    }

    // Kullanıcı adını göster
    const memberName = localStorage.getItem('memberUsername') || 'Üye';
    document.getElementById('memberName').textContent = `👋 Hoş geldin ${memberName}`;

    // Çıkış butonu
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
            localStorage.removeItem('memberLoggedIn');
            localStorage.removeItem('memberUsername');
            localStorage.removeItem('memberLoginTime');
            window.location.href = 'uye-giris.html';
        }
    });

    // Verileri yükle
    loadData();
    
    // Gerçek zamanlı güncelleme için localStorage değişikliklerini dinle
    window.addEventListener('storage', function(e) {
        if (e.key === 'announcements' || e.key === 'tasks' || e.key === 'logs' || e.key === 'dataUpdated') {
            loadData();
        }
    });
    
    // Her 5 saniyede bir verileri kontrol et (aynı sekme için)
    setInterval(function() {
        const lastUpdate = localStorage.getItem('dataUpdated');
        if (lastUpdate && lastUpdate !== window.lastKnownUpdate) {
            window.lastKnownUpdate = lastUpdate;
            loadData();
        }
    }, 5000);
});

function loadData() {
    // LocalStorage'dan verileri oku (sadece okuma modu)
    const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const logs = JSON.parse(localStorage.getItem('logs') || '[]');

    // İstatistikleri güncelle
    document.getElementById('totalAnnouncements').textContent = announcements.length;
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('totalLogs').textContent = logs.length;

    // Duyuruları göster
    displayAnnouncements(announcements);
    
    // Görevleri göster
    displayTasks(tasks);
    
    // Günlük kayıtları göster
    displayLogs(logs);
}

function displayAnnouncements(announcements) {
    const container = document.getElementById('announcementsList');
    
    if (announcements.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-bullhorn text-4xl mb-4 opacity-50"></i>
                <p>Henüz duyuru bulunmuyor.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = announcements.map(announcement => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(announcement.title)}</h3>
                    <p class="text-gray-600 text-sm mb-3">${escapeHtml(announcement.content)}</p>
                    <div class="flex items-center text-xs text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>
                        <span>${formatDate(announcement.date)}</span>
                        <span class="mx-2">•</span>
                        <i class="fas fa-user mr-1"></i>
                        <span>${escapeHtml(announcement.author || 'Admin')}</span>
                    </div>
                </div>
                <div class="ml-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(announcement.priority)}">
                        ${getPriorityText(announcement.priority)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function displayTasks(tasks) {
    const container = document.getElementById('tasksList');
    
    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-tasks text-4xl mb-4 opacity-50"></i>
                <p>Henüz görev bulunmuyor.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(task.title)}</h3>
                    <p class="text-gray-600 text-sm mb-3">${escapeHtml(task.description)}</p>
                    <div class="flex items-center text-xs text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>
                        <span>${formatDate(task.date)}</span>
                        ${task.dueDate ? `
                            <span class="mx-2">•</span>
                            <i class="fas fa-clock mr-1"></i>
                            <span>Bitiş: ${formatDate(task.dueDate)}</span>
                        ` : ''}
                    </div>
                </div>
                <div class="ml-4 flex flex-col items-end space-y-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(task.status)}">
                        ${getStatusText(task.status)}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}">
                        ${getPriorityText(task.priority)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function displayLogs(logs) {
    const container = document.getElementById('logsList');
    
    if (logs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-calendar-day text-4xl mb-4 opacity-50"></i>
                <p>Henüz günlük kayıt bulunmuyor.</p>
            </div>
        `;
        return;
    }

    // Son 10 kaydı göster
    const recentLogs = logs.slice(-10).reverse();
    
    container.innerHTML = recentLogs.map(log => `
        <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(log.title)}</h3>
                    <p class="text-gray-600 text-sm mb-3">${escapeHtml(log.content)}</p>
                    <div class="flex items-center text-xs text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>
                        <span>${formatDate(log.date)}</span>
                        <span class="mx-2">•</span>
                        <i class="fas fa-user mr-1"></i>
                        <span>${escapeHtml(log.author || 'Admin')}</span>
                    </div>
                </div>
                <div class="ml-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryClass(log.category)}">
                        ${getCategoryText(log.category)}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Yardımcı fonksiyonlar
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text ? text.replace(/[&<>"']/g, function(m) { return map[m]; }) : '';
}

function formatDate(dateString) {
    if (!dateString) return 'Tarih belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getPriorityClass(priority) {
    switch(priority) {
        case 'high': return 'bg-red-100 text-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getPriorityText(priority) {
    switch(priority) {
        case 'high': return 'Yüksek';
        case 'medium': return 'Orta';
        case 'low': return 'Düşük';
        default: return 'Normal';
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'completed': return 'bg-green-100 text-green-800';
        case 'in-progress': return 'bg-blue-100 text-blue-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'completed': return 'Tamamlandı';
        case 'in-progress': return 'Devam Ediyor';
        case 'pending': return 'Bekliyor';
        default: return 'Bilinmiyor';
    }
}

function getCategoryClass(category) {
    switch(category) {
        case 'meeting': return 'bg-blue-100 text-blue-800';
        case 'task': return 'bg-green-100 text-green-800';
        case 'note': return 'bg-purple-100 text-purple-800';
        case 'reminder': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function getCategoryText(category) {
    switch(category) {
        case 'meeting': return 'Toplantı';
        case 'task': return 'Görev';
        case 'note': return 'Not';
        case 'reminder': return 'Hatırlatma';
        default: return 'Genel';
    }
}
