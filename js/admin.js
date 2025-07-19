// Admin panel yönetimi
document.addEventListener('DOMContentLoaded', function() {
    let currentContentType = '';
    let editingMemberId = null;
    
    // Modal elementleri
    const modal = document.getElementById('contentModal');
    const modalTitle = document.getElementById('modalTitle');
    const contentForm = document.getElementById('contentForm');
    const cancelModal = document.getElementById('cancelModal');
    
    // Team modals
    const memberModal = document.getElementById('memberModal');
    const memberForm = document.getElementById('memberForm');
    const cancelMemberModal = document.getElementById('cancelMemberModal');
    const assignTaskModal = document.getElementById('assignTaskModal');
    const assignTaskForm = document.getElementById('assignTaskForm');
    const cancelAssignTaskModal = document.getElementById('cancelAssignTaskModal');
    
    // Form alanları
    const priorityField = document.getElementById('priorityField');
    const statusField = document.getElementById('statusField');
    const categoryField = document.getElementById('categoryField');
    
    // Butonlar
    const addAnnouncementBtn = document.getElementById('addAnnouncementBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const addLogBtn = document.getElementById('addLogBtn');
    const assignTaskBtn = document.getElementById('assignTaskBtn');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const copyEmailsBtn = document.getElementById('copyEmailsBtn');
    
    // Tab butonları
    const dashboardTab = document.getElementById('dashboardTab');
    const teamTab = document.getElementById('teamTab');
    const dashboardContent = document.getElementById('dashboardContent');
    const teamContent = document.getElementById('teamContent');
    
    // Filters
    const areaFilter = document.getElementById('areaFilter');
    const searchMembers = document.getElementById('searchMembers');
    
    // Event listeners
    addAnnouncementBtn.addEventListener('click', () => openModal('announcement'));
    addTaskBtn.addEventListener('click', () => openModal('task'));
    addLogBtn.addEventListener('click', () => openModal('log'));
    assignTaskBtn.addEventListener('click', openAssignTaskModal);
    addMemberBtn.addEventListener('click', openMemberModal);
    copyEmailsBtn.addEventListener('click', copyAllEmails);
    
    // Tab navigation
    dashboardTab.addEventListener('click', () => switchTab('dashboard'));
    teamTab.addEventListener('click', () => switchTab('team'));
    
    // Filter events
    areaFilter.addEventListener('change', filterMembers);
    searchMembers.addEventListener('input', filterMembers);
    
    cancelModal.addEventListener('click', closeModal);
    cancelMemberModal.addEventListener('click', closeMemberModal);
    cancelAssignTaskModal.addEventListener('click', closeAssignTaskModal);
    
    // Modal dışına tıklanınca kapat
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    memberModal.addEventListener('click', function(e) {
        if (e.target === memberModal) {
            closeMemberModal();
        }
    });
    
    assignTaskModal.addEventListener('click', function(e) {
        if (e.target === assignTaskModal) {
            closeAssignTaskModal();
        }
    });
    
    // Form gönderimi
    contentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addContent();
    });
    
    memberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addOrUpdateMember();
    });
    
    assignTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        assignTask();
    });
    
    function openModal(type) {
        currentContentType = type;
        
        // Modal başlığını ayarla
        switch(type) {
            case 'announcement':
                modalTitle.textContent = 'Duyuru Ekle';
                priorityField.classList.remove('hidden');
                statusField.classList.add('hidden');
                categoryField.classList.add('hidden');
                break;
            case 'task':
                modalTitle.textContent = 'Görev Ekle';
                priorityField.classList.remove('hidden');
                statusField.classList.remove('hidden');
                categoryField.classList.add('hidden');
                break;
            case 'log':
                modalTitle.textContent = 'Günlük Kayıt Ekle';
                priorityField.classList.add('hidden');
                statusField.classList.add('hidden');
                categoryField.classList.remove('hidden');
                break;
        }
        
        // Formu temizle
        contentForm.reset();
        
        // Modal'ı göster
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    
    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        contentForm.reset();
    }
    
    function addContent() {
        const title = document.getElementById('contentTitle').value.trim();
        const description = document.getElementById('contentDescription').value.trim();
        const priority = document.getElementById('contentPriority').value;
        const status = document.getElementById('contentStatus').value;
        const category = document.getElementById('contentCategory').value;
        
        if (!title || !description) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }
        
        const newItem = {
            id: Date.now().toString(),
            title: title,
            content: description,
            description: description, // Görevler için
            date: new Date().toISOString(),
            author: 'Admin'
        };
        
        // İçerik tipine göre ek alanlar ekle
        switch(currentContentType) {
            case 'announcement':
                newItem.priority = priority;
                break;
            case 'task':
                newItem.priority = priority;
                newItem.status = status;
                break;
            case 'log':
                newItem.category = category;
                break;
        }
        
        // LocalStorage'a kaydet
        const storageKey = currentContentType === 'announcement' ? 'announcements' : 
                          currentContentType === 'task' ? 'tasks' : 'logs';
        
        const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingData.push(newItem);
        localStorage.setItem(storageKey, JSON.stringify(existingData));
        
        // Verileri güncelle ve modal'ı kapat
        loadAdminData();
        closeModal();
        
        // Başarı mesajı
        showNotification(`${getContentTypeName(currentContentType)} başarıyla eklendi!`, 'success');
        
        // Üye panellerini güncelle (gerçek zamanlı senkronizasyon için)
        broadcastDataUpdate();
    }
    
    function getContentTypeName(type) {
        switch(type) {
            case 'announcement': return 'Duyuru';
            case 'task': return 'Görev';
            case 'log': return 'Günlük kayıt';
            default: return 'İçerik';
        }
    }
    
    function showNotification(message, type = 'info') {
        // Basit notification sistemi
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 
            type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    function broadcastDataUpdate() {
        // LocalStorage değişikliğini diğer sekmelere bildir
        localStorage.setItem('dataUpdated', Date.now().toString());
    }
    
    function loadAdminData() {
        // LocalStorage'dan verileri oku
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const logs = JSON.parse(localStorage.getItem('logs') || '[]');
        
        // İstatistikleri güncelle
        document.getElementById('adminTotalAnnouncements').textContent = announcements.length;
        document.getElementById('adminTotalTasks').textContent = tasks.length;
        document.getElementById('adminTotalLogs').textContent = logs.length;
        
        // İçerikleri göster
        displayAdminAnnouncements(announcements);
        displayAdminTasks(tasks);
        displayAdminLogs(logs);
    }
    
    function displayAdminAnnouncements(announcements) {
        const container = document.getElementById('adminAnnouncementsList');
        
        if (announcements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-bullhorn text-4xl mb-4 opacity-50"></i>
                    <p>Henüz duyuru bulunmuyor.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = announcements.slice(-5).reverse().map(announcement => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(announcement.title)}</h3>
                        <p class="text-gray-600 text-sm mb-3">${escapeHtml(announcement.content)}</p>
                        <div class="flex items-center text-xs text-gray-500">
                            <i class="fas fa-calendar mr-1"></i>
                            <span>${formatDate(announcement.date)}</span>
                        </div>
                    </div>
                    <div class="ml-4 flex items-center space-x-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(announcement.priority)}">
                            ${getPriorityText(announcement.priority)}
                        </span>
                        <button onclick="deleteContent('announcements', '${announcement.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function displayAdminTasks(tasks) {
        const container = document.getElementById('adminTasksList');
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-tasks text-4xl mb-4 opacity-50"></i>
                    <p>Henüz görev bulunmuyor.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tasks.slice(-5).reverse().map(task => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(task.title)}</h3>
                        <p class="text-gray-600 text-sm mb-3">${escapeHtml(task.description)}</p>
                        <div class="flex items-center text-xs text-gray-500">
                            <i class="fas fa-calendar mr-1"></i>
                            <span>${formatDate(task.date)}</span>
                        </div>
                    </div>
                    <div class="ml-4 flex flex-col items-end space-y-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(task.status)}">
                            ${getStatusText(task.status)}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}">
                            ${getPriorityText(task.priority)}
                        </span>
                        <button onclick="deleteContent('tasks', '${task.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function displayAdminLogs(logs) {
        const container = document.getElementById('adminLogsList');
        
        if (logs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-calendar-day text-4xl mb-4 opacity-50"></i>
                    <p>Henüz günlük kayıt bulunmuyor.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = logs.slice(-5).reverse().map(log => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(log.title)}</h3>
                        <p class="text-gray-600 text-sm mb-3">${escapeHtml(log.content)}</p>
                        <div class="flex items-center text-xs text-gray-500">
                            <i class="fas fa-calendar mr-1"></i>
                            <span>${formatDate(log.date)}</span>
                        </div>
                    </div>
                    <div class="ml-4 flex items-center space-x-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryClass(log.category)}">
                            ${getCategoryText(log.category)}
                        </span>
                        <button onclick="deleteContent('logs', '${log.id}')" class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Global delete function
    window.deleteContent = function(type, id) {
        if (confirm('Bu içeriği silmek istediğinizden emin misiniz?')) {
            const existingData = JSON.parse(localStorage.getItem(type) || '[]');
            const filteredData = existingData.filter(item => item.id !== id);
            localStorage.setItem(type, JSON.stringify(filteredData));
            loadAdminData();
            broadcastDataUpdate();
            showNotification('İçerik başarıyla silindi!', 'success');
        }
    };
    
    // Sayfa yüklendiğinde verileri yükle
    loadAdminData();
    loadTeamData();
    
    // Tab switching functions
    function switchTab(tab) {
        if (tab === 'dashboard') {
            dashboardTab.classList.add('active', 'border-blue-500', 'text-blue-600');
            dashboardTab.classList.remove('border-transparent', 'text-gray-500');
            teamTab.classList.remove('active', 'border-blue-500', 'text-blue-600');
            teamTab.classList.add('border-transparent', 'text-gray-500');
            
            dashboardContent.classList.remove('hidden');
            teamContent.classList.add('hidden');
        } else {
            teamTab.classList.add('active', 'border-blue-500', 'text-blue-600');
            teamTab.classList.remove('border-transparent', 'text-gray-500');
            dashboardTab.classList.remove('active', 'border-blue-500', 'text-blue-600');
            dashboardTab.classList.add('border-transparent', 'text-gray-500');
            
            teamContent.classList.remove('hidden');
            dashboardContent.classList.add('hidden');
            
            loadTeamData();
        }
    }
    
    // Team member modal functions
    function openMemberModal(memberId = null) {
        editingMemberId = memberId;
        
        if (memberId) {
            // Edit mode
            const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
            const member = members.find(m => m.id === memberId);
            
            if (member) {
                document.getElementById('memberModalTitle').textContent = 'Ekip Üyesini Düzenle';
                document.getElementById('memberName').value = member.name;
                document.getElementById('memberRole').value = member.role;
                document.getElementById('memberArea').value = member.area;
                document.getElementById('memberEmail').value = member.email;
            }
        } else {
            // Add mode
            document.getElementById('memberModalTitle').textContent = 'Ekip Üyesi Ekle';
            memberForm.reset();
        }
        
        memberModal.classList.remove('hidden');
        memberModal.classList.add('flex');
    }
    
    function closeMemberModal() {
        memberModal.classList.add('hidden');
        memberModal.classList.remove('flex');
        memberForm.reset();
        editingMemberId = null;
    }
    
    function addOrUpdateMember() {
        const name = document.getElementById('memberName').value.trim();
        const role = document.getElementById('memberRole').value.trim();
        const area = document.getElementById('memberArea').value;
        const email = document.getElementById('memberEmail').value.trim();
        
        if (!name || !role || !area || !email) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }
        
        const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        
        if (editingMemberId) {
            // Update existing member
            const memberIndex = members.findIndex(m => m.id === editingMemberId);
            if (memberIndex !== -1) {
                members[memberIndex] = {
                    ...members[memberIndex],
                    name,
                    role,
                    area,
                    email,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Add new member
            const newMember = {
                id: Date.now().toString(),
                name,
                role,
                area,
                email,
                createdAt: new Date().toISOString(),
                assignedTasks: 0
            };
            members.push(newMember);
        }
        
        localStorage.setItem('teamMembers', JSON.stringify(members));
        loadTeamData();
        closeMemberModal();
        
        showNotification(`Ekip üyesi başarıyla ${editingMemberId ? 'düzenlendi' : 'eklendi'}!`, 'success');
        broadcastDataUpdate();
    }
    
    // Assign task modal functions
    function openAssignTaskModal() {
        const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        const memberSelect = document.getElementById('assignTaskMember');
        
        // Clear and populate member dropdown
        memberSelect.innerHTML = '<option value="">Üye Seçin</option>';
        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = `${member.name} (${member.area})`;
            memberSelect.appendChild(option);
        });
        
        assignTaskForm.reset();
        assignTaskModal.classList.remove('hidden');
        assignTaskModal.classList.add('flex');
    }
    
    function closeAssignTaskModal() {
        assignTaskModal.classList.add('hidden');
        assignTaskModal.classList.remove('flex');
        assignTaskForm.reset();
    }
    
    function assignTask() {
        const title = document.getElementById('assignTaskTitle').value.trim();
        const description = document.getElementById('assignTaskDescription').value.trim();
        const memberId = document.getElementById('assignTaskMember').value;
        const area = document.getElementById('assignTaskArea').value;
        const dueDate = document.getElementById('assignTaskDueDate').value;
        const priority = document.getElementById('assignTaskPriority').value;
        
        if (!title || !description || !memberId) {
            alert('Lütfen gerekli alanları doldurun!');
            return;
        }
        
        const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        const member = members.find(m => m.id === memberId);
        
        if (!member) {
            alert('Üye bulunamadı!');
            return;
        }
        
        const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
        
        const newTask = {
            id: Date.now().toString(),
            title,
            description,
            assignedTo: member.name,
            assignedToId: memberId,
            area: area || member.area,
            dueDate,
            priority,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: 'Admin'
        };
        
        assignedTasks.push(newTask);
        localStorage.setItem('assignedTasks', JSON.stringify(assignedTasks));
        
        // Update member's assigned task count
        const memberIndex = members.findIndex(m => m.id === memberId);
        if (memberIndex !== -1) {
            members[memberIndex].assignedTasks = (members[memberIndex].assignedTasks || 0) + 1;
            localStorage.setItem('teamMembers', JSON.stringify(members));
        }
        
        loadTeamData();
        closeAssignTaskModal();
        
        showNotification(`Görev ${member.name} adlı kişiye başarıyla atandı!`, 'success');
        broadcastDataUpdate();
    }
    
    // Copy all emails function
    function copyAllEmails() {
        const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        const emails = members.map(member => member.email).join(', ');
        
        if (emails) {
            navigator.clipboard.writeText(emails).then(() => {
                showNotification('Tüm e-posta adresleri panoya kopyalandı!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = emails;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showNotification('Tüm e-posta adresleri panoya kopyalandı!', 'success');
            });
        } else {
            showNotification('Kopyalanacak e-posta adresi bulunamadı!', 'error');
        }
    }
    
    // Filter members function
    function filterMembers() {
        const areaFilter = document.getElementById('areaFilter').value;
        const searchTerm = document.getElementById('searchMembers').value.toLowerCase();
        const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        
        let filteredMembers = members;
        
        if (areaFilter) {
            filteredMembers = filteredMembers.filter(member => member.area === areaFilter);
        }
        
        if (searchTerm) {
            filteredMembers = filteredMembers.filter(member => 
                member.name.toLowerCase().includes(searchTerm) ||
                member.role.toLowerCase().includes(searchTerm) ||
                member.email.toLowerCase().includes(searchTerm)
            );
        }
        
        displayTeamMembers(filteredMembers);
    }
    
    // Load team data function
    function loadTeamData() {
        const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
        
        updateTeamStats(members, assignedTasks);
        displayTeamMembers(members);
        displayAssignedTasks(assignedTasks);
    }
    
    function updateTeamStats(members, assignedTasks) {
        const totalMembers = members.length;
        const developers = members.filter(m => ['iOS', 'Android', 'Backend', 'Frontend', 'DevOps'].includes(m.area)).length;
        const designers = members.filter(m => m.area === 'Tasarım').length;
        const totalAssignedTasks = assignedTasks.length;
        
        document.getElementById('totalMembers').textContent = totalMembers;
        document.getElementById('totalDevelopers').textContent = developers;
        document.getElementById('totalDesigners').textContent = designers;
        document.getElementById('totalAssignedTasks').textContent = totalAssignedTasks;
    }
    
    function displayTeamMembers(members) {
        const tbody = document.getElementById('membersTableBody');
        const noMembersMessage = document.getElementById('noMembersMessage');
        
        if (members.length === 0) {
            tbody.innerHTML = '';
            noMembersMessage.classList.remove('hidden');
            return;
        }
        
        noMembersMessage.classList.add('hidden');
        
        tbody.innerHTML = members.map(member => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-blue-800">${member.name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${escapeHtml(member.name)}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${escapeHtml(member.role)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAreaClass(member.area)}">
                        ${escapeHtml(member.area)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${escapeHtml(member.email)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ${member.assignedTasks || 0} görev
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="editMember('${member.id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i> Düzenle
                    </button>
                    <button onclick="deleteMember('${member.id}')" class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i> Sil
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    function displayAssignedTasks(tasks) {
        const container = document.getElementById('assignedTasksList');
        
        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-user-check text-4xl mb-4 opacity-50"></i>
                    <p>Henüz atanmış görev bulunmuyor.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = tasks.slice(-10).reverse().map(task => `
            <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h3 class="font-medium text-gray-900 mb-2">${escapeHtml(task.title)}</h3>
                        <p class="text-gray-600 text-sm mb-3">${escapeHtml(task.description)}</p>
                        <div class="flex items-center text-xs text-gray-500 mb-2">
                            <i class="fas fa-user mr-1"></i>
                            <span>Atanan: ${escapeHtml(task.assignedTo)}</span>
                            <span class="mx-2">•</span>
                            <i class="fas fa-calendar mr-1"></i>
                            <span>${formatDate(task.createdAt)}</span>
                            ${task.dueDate ? `
                                <span class="mx-2">•</span>
                                <i class="fas fa-clock mr-1"></i>
                                <span>Bitiş: ${formatDate(task.dueDate)}</span>
                            ` : ''}
                        </div>
                        ${task.area ? `
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAreaClass(task.area)}">
                                ${escapeHtml(task.area)}
                            </span>
                        ` : ''}
                    </div>
                    <div class="ml-4 flex flex-col items-end space-y-2">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(task.status)}">
                            ${getStatusText(task.status)}
                        </span>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}">
                            ${getPriorityText(task.priority)}
                        </span>
                        <button onclick="deleteAssignedTask('${task.id}')" class="text-red-600 hover:text-red-800 text-xs">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Global functions for member management
    window.editMember = function(memberId) {
        openMemberModal(memberId);
    };
    
    window.deleteMember = function(memberId) {
        if (confirm('Bu ekip üyesini silmek istediğinizden emin misiniz?')) {
            const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
            const filteredMembers = members.filter(member => member.id !== memberId);
            localStorage.setItem('teamMembers', JSON.stringify(filteredMembers));
            
            // Also remove assigned tasks for this member
            const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
            const filteredTasks = assignedTasks.filter(task => task.assignedToId !== memberId);
            localStorage.setItem('assignedTasks', JSON.stringify(filteredTasks));
            
            loadTeamData();
            showNotification('Ekip üyesi başarıyla silindi!', 'success');
            broadcastDataUpdate();
        }
    };
    
    window.deleteAssignedTask = function(taskId) {
        if (confirm('Bu atanmış görevi silmek istediğinizden emin misiniz?')) {
            const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
            const task = assignedTasks.find(t => t.id === taskId);
            
            if (task) {
                // Update member's assigned task count
                const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
                const memberIndex = members.findIndex(m => m.id === task.assignedToId);
                if (memberIndex !== -1 && members[memberIndex].assignedTasks > 0) {
                    members[memberIndex].assignedTasks -= 1;
                    localStorage.setItem('teamMembers', JSON.stringify(members));
                }
            }
            
            const filteredTasks = assignedTasks.filter(task => task.id !== taskId);
            localStorage.setItem('assignedTasks', JSON.stringify(filteredTasks));
            
            loadTeamData();
            showNotification('Atanmış görev başarıyla silindi!', 'success');
            broadcastDataUpdate();
        }
    };
    
    function getAreaClass(area) {
        switch(area) {
            case 'iOS': return 'bg-blue-100 text-blue-800';
            case 'Android': return 'bg-green-100 text-green-800';
            case 'Backend': return 'bg-purple-100 text-purple-800';
            case 'Frontend': return 'bg-yellow-100 text-yellow-800';
            case 'Tasarım': return 'bg-pink-100 text-pink-800';
            case 'DevOps': return 'bg-indigo-100 text-indigo-800';
            case 'QA': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
});

// Yardımcı fonksiyonlar (uye.js'deki ile aynı)
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
