// Data management for the admin panel
// Using localStorage for data persistence

// Initialize default data if not exists
function initializeData() {
    if (!localStorage.getItem('teams')) {
        localStorage.setItem('teams', JSON.stringify([
            { id: 1, name: 'Ahmet Yılmaz', role: 'Takım Lideri', field: 'Backend', isActive: true, notes: 'Yeni API geliştirmesinde çalışıyor.' },
            { id: 2, name: 'Ayşe Demir', role: 'Kıdemli Geliştirici', field: 'iOS', isActive: true, notes: '' },
            { id: 3, name: 'Mehmet Kaya', role: 'Geliştirici', field: 'Android', isActive: true, notes: '' }
        ]));
    }

    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify([
            { id: 1, name: 'API Geliştirmesi', description: 'Yeni kullanıcı yönetimi API geliştirmesi', assignedTo: 'Ahmet Yılmaz', dueDate: '2025-08-01', status: 'Yapılıyor' },
            { id: 2, name: 'iOS Güncellemesi', description: 'iOS uygulaması için yeni özellikler', assignedTo: 'Ayşe Demir', dueDate: '2025-08-15', status: 'Bekliyor' },
            { id: 3, name: 'Belgelendirme', description: 'Kod dökümantasyonunun güncellenmesi', assignedTo: 'Mehmet Kaya', dueDate: '2025-07-25', status: 'Bitti' }
        ]));
    }

    if (!localStorage.getItem('dailyLogs')) {
        localStorage.setItem('dailyLogs', JSON.stringify([
            { id: 1, user: 'Ahmet Yılmaz', date: '2025-07-18', content: 'Auth sistemi için çalışmalara başladım.' },
            { id: 2, user: 'Ayşe Demir', date: '2025-07-18', content: 'iOS ana ekran tasarımını tamamladım.' },
            { id: 3, user: 'Mehmet Kaya', date: '2025-07-17', content: 'Test coverage %90\'a çıkartıldı.' }
        ]));
    }

    if (!localStorage.getItem('announcements')) {
        localStorage.setItem('announcements', JSON.stringify([
            { id: 1, title: 'Yeni Proje Başlangıcı', content: 'Önümüzdeki ay yeni bir projeye başlıyoruz. Detaylar yakında paylaşılacak.', date: '2025-07-15' },
            { id: 2, title: 'Toplantı Duyurusu', content: 'Cuma günü saat 14:00\'te tüm ekibin katılımıyla sprint planlama toplantısı yapılacaktır.', date: '2025-07-17' }
        ]));
    }
}

// Initialize data on script load
initializeData();

// Teams Management
function getTeams() {
    return JSON.parse(localStorage.getItem('teams')) || [];
}

function getTeamMember(id) {
    const teams = getTeams();
    return teams.find(member => member.id === id);
}

function addTeamMember(memberData) {
    const teams = getTeams();
    
    // Generate new ID
    const maxId = teams.length > 0 ? Math.max(...teams.map(m => m.id)) : 0;
    memberData.id = maxId + 1;
    
    teams.push(memberData);
    localStorage.setItem('teams', JSON.stringify(teams));
    return memberData;
}

function updateTeamMember(id, updatedData) {
    let teams = getTeams();
    const index = teams.findIndex(member => member.id === id);
    
    if (index !== -1) {
        teams[index] = { ...teams[index], ...updatedData };
        localStorage.setItem('teams', JSON.stringify(teams));
        return teams[index];
    }
    
    return null;
}

function deleteTeamMember(id) {
    let teams = getTeams();
    const filteredTeams = teams.filter(member => member.id !== id);
    
    localStorage.setItem('teams', JSON.stringify(filteredTeams));
    return filteredTeams.length < teams.length;
}

function toggleTeamMemberStatus(id) {
    let teams = getTeams();
    const index = teams.findIndex(member => member.id === id);
    
    if (index !== -1) {
        teams[index].isActive = !teams[index].isActive;
        localStorage.setItem('teams', JSON.stringify(teams));
        return teams[index];
    }
    
    return null;
}

// Tasks Management
function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function getTask(id) {
    const tasks = getTasks();
    return tasks.find(task => task.id === id);
}

function addTask(taskData) {
    const tasks = getTasks();
    
    // Generate new ID
    const maxId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) : 0;
    taskData.id = maxId + 1;
    
    tasks.push(taskData);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    return taskData;
}

function updateTask(id, updatedData) {
    let tasks = getTasks();
    const index = tasks.findIndex(task => task.id === id);
    
    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedData };
        localStorage.setItem('tasks', JSON.stringify(tasks));
        return tasks[index];
    }
    
    return null;
}

function deleteTask(id) {
    let tasks = getTasks();
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    return filteredTasks.length < tasks.length;
}

function getTasksByStatus(status) {
    const tasks = getTasks();
    return status ? tasks.filter(task => task.status === status) : tasks;
}

// Daily Logs Management
function getDailyLogs() {
    return JSON.parse(localStorage.getItem('dailyLogs')) || [];
}

function addDailyLog(logData) {
    const logs = getDailyLogs();
    
    // Generate new ID
    const maxId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) : 0;
    logData.id = maxId + 1;
    
    logs.push(logData);
    localStorage.setItem('dailyLogs', JSON.stringify(logs));
    return logData;
}

function getDailyLogsByDate(date) {
    const logs = getDailyLogs();
    return date ? logs.filter(log => log.date === date) : logs;
}

// Announcements Management
function getAnnouncements() {
    return JSON.parse(localStorage.getItem('announcements')) || [];
}

function getAnnouncement(id) {
    const announcements = getAnnouncements();
    return announcements.find(a => a.id === id);
}

function addAnnouncement(announcementData) {
    const announcements = getAnnouncements();
    
    // Generate new ID
    const maxId = announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) : 0;
    announcementData.id = maxId + 1;
    
    announcements.push(announcementData);
    localStorage.setItem('announcements', JSON.stringify(announcements));
    return announcementData;
}

function updateAnnouncement(id, updatedData) {
    let announcements = getAnnouncements();
    const index = announcements.findIndex(a => a.id === id);
    
    if (index !== -1) {
        announcements[index] = { ...announcements[index], ...updatedData };
        localStorage.setItem('announcements', JSON.stringify(announcements));
        return announcements[index];
    }
    
    return null;
}

function deleteAnnouncement(id) {
    let announcements = getAnnouncements();
    const filteredAnnouncements = announcements.filter(a => a.id !== id);
    
    localStorage.setItem('announcements', JSON.stringify(filteredAnnouncements));
    return filteredAnnouncements.length < announcements.length;
}
