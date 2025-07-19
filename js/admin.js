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
    const debugBtn = document.getElementById('debugBtn');
    
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
    addMemberBtn.addEventListener('click', () => {
        console.log('Add Member button clicked - calling openMemberModal(null)');
        openMemberModal(null);
    });
    copyEmailsBtn.addEventListener('click', copyAllEmails);
    debugBtn.addEventListener('click', debugLocalStorage);
    
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

    // Diğer sekmelerde localStorage değişikliği olursa üyeleri güncelle
    window.addEventListener('storage', function(e) {
        if (e.key === 'teamMembers' || e.key === 'dataUpdated') {
            loadTeamData();
        }
    });

    // Aynı sekmede localStorage güncellendiğinde (ör: başka bir fonksiyon setItem çağırdıysa) düzenli kontrol
    setInterval(function() {
        const lastUpdate = localStorage.getItem('dataUpdated');
        if (lastUpdate && lastUpdate !== window.lastKnownUpdate) {
            window.lastKnownUpdate = lastUpdate;
            loadTeamData();
        }
    }, 3000);
    
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
        console.log('openMemberModal called with memberId:', memberId);
        
        // Explicitly set editingMemberId to null for new members
        editingMemberId = memberId;
        
        console.log('editingMemberId set to:', editingMemberId);
        
        if (memberId) {
            // Edit mode
            console.log('Opening modal in EDIT mode');
            const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
            const member = members.find(m => m.id === memberId);
            
            if (member) {
                document.getElementById('memberModalTitle').textContent = 'Ekip Üyesini Düzenle';
                // Handle both old format (name only) and new format (firstName/lastName)
                if (member.firstName && member.lastName) {
                    document.getElementById('memberFirstName').value = member.firstName;
                    document.getElementById('memberLastName').value = member.lastName;
                } else if (member.name) {
                    // Split existing name for backward compatibility
                    const nameParts = member.name.split(' ');
                    document.getElementById('memberFirstName').value = nameParts[0] || '';
                    document.getElementById('memberLastName').value = nameParts.slice(1).join(' ') || '';
                }
                document.getElementById('memberRole').value = member.role;
                document.getElementById('memberArea').value = member.area;
                document.getElementById('memberEmail').value = member.email;
            }
        } else {
            // Add mode
            console.log('Opening modal in ADD mode');
            document.getElementById('memberModalTitle').textContent = 'Ekip Üyesi Ekle';
            
            // Clear all form fields explicitly
            document.getElementById('memberFirstName').value = '';
            document.getElementById('memberLastName').value = '';
            document.getElementById('memberRole').value = '';
            document.getElementById('memberArea').value = '';
            document.getElementById('memberEmail').value = '';
        }
        
        memberModal.classList.remove('hidden');
        memberModal.classList.add('flex');
    }
    
    function closeMemberModal() {
        console.log('closeMemberModal called, resetting editingMemberId');
        memberModal.classList.add('hidden');
        memberModal.classList.remove('flex');
        memberForm.reset();
        
        // Explicitly reset editingMemberId
        editingMemberId = null;
        console.log('editingMemberId reset to:', editingMemberId);
    }
    
    function addOrUpdateMember() {
        console.log('=== addOrUpdateMember called ===');
        console.log('Current editingMemberId:', editingMemberId);
        console.log('editingMemberId type:', typeof editingMemberId);
        console.log('editingMemberId === null:', editingMemberId === null);
        console.log('editingMemberId === "null":', editingMemberId === 'null');
        console.log('Boolean(editingMemberId):', Boolean(editingMemberId));
        
        // Safeguard: Check modal title to determine actual mode
        const modalTitle = document.getElementById('memberModalTitle');
        const modalTitleText = modalTitle ? modalTitle.textContent : '';
        console.log('Modal title:', modalTitleText);
        
        // If modal title indicates add mode but editingMemberId is set, force reset it
        if (modalTitleText === 'Ekip Üyesi Ekle' && editingMemberId) {
            console.log('SAFEGUARD: Modal is in add mode but editingMemberId is set. Forcing reset.');
            editingMemberId = null;
        }
        
        // Get form elements
        const firstNameEl = document.getElementById('memberFirstName');
        const lastNameEl = document.getElementById('memberLastName');
        const roleEl = document.getElementById('memberRole');
        const areaEl = document.getElementById('memberArea');
        const emailEl = document.getElementById('memberEmail');
        
        // Check if elements exist
        if (!firstNameEl || !lastNameEl || !roleEl || !areaEl || !emailEl) {
            console.error('Form elements not found!');
            alert('Form hatası: Gerekli alanlar bulunamadı!');
            return;
        }
        
        // Get values
        const firstName = firstNameEl.value.trim();
        const lastName = lastNameEl.value.trim();
        const role = roleEl.value.trim();
        const area = areaEl.value;
        const email = emailEl.value.trim();
        
        console.log('Form values:', { firstName, lastName, role, area, email });
        
        // Validate required fields
        if (!firstName || !lastName || !role || !area || !email) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Lütfen geçerli bir e-posta adresi girin!');
            return;
        }
        
        const fullName = `${firstName} ${lastName}`;
        
        try {
            // Get existing members
            const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
            console.log('Existing members:', members);
            
            // Check for duplicate email (except when editing the same member)
            const duplicateEmail = members.find(m => m.email === email && m.id !== editingMemberId);
            if (duplicateEmail) {
                alert('Bu e-posta adresi zaten kullanılıyor!');
                return;
            }
            
            // Determine if this is an edit or add operation
            const isEditMode = editingMemberId && 
                              editingMemberId !== null && 
                              editingMemberId !== 'null' && 
                              editingMemberId !== undefined && 
                              editingMemberId !== 'undefined' &&
                              typeof editingMemberId === 'string' &&
                              editingMemberId.trim() !== '';
            
            console.log('=== Operation Mode Determination ===');
            console.log('isEditMode:', isEditMode);
            console.log('Will perform:', isEditMode ? 'UPDATE' : 'ADD');
            
            if (isEditMode) {
                // Update existing member
                console.log('=== EDIT MODE: Updating member with ID:', editingMemberId);
                const memberIndex = members.findIndex(m => m.id === editingMemberId);
                console.log('Member index found:', memberIndex);
                
                if (memberIndex !== -1) {
                    members[memberIndex] = {
                        ...members[memberIndex],
                        name: fullName,
                        firstName,
                        lastName,
                        role,
                        area,
                        email,
                        updatedAt: new Date().toISOString()
                    };
                    console.log('Member updated successfully:', members[memberIndex]);
                } else {
                    console.error('=== EDIT ERROR ===');
                    console.error('Member to edit not found! editingMemberId:', editingMemberId);
                    console.error('Available member IDs:', members.map(m => m.id));
                    alert('Düzenlenecek üye bulunamadı!');
                    return;
                }
            } else {
                // Add new member
                console.log('=== ADD MODE: Adding new member ===');
                const newMember = {
                    id: Date.now().toString(),
                    name: fullName,
                    firstName,
                    lastName,
                    role,
                    area,
                    email,
                    createdAt: new Date().toISOString(),
                    assignedTasks: 0
                };
                members.push(newMember);
                console.log('New member added successfully:', newMember);
            }
            
            // Save to localStorage with error handling
            try {
                localStorage.setItem('teamMembers', JSON.stringify(members));
                console.log('Members saved to localStorage successfully');
                
                // Verify the save was successful
                const savedMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
                console.log('Verification - members in localStorage:', savedMembers);
                
                if (savedMembers.length !== members.length) {
                    throw new Error('Save verification failed - member count mismatch');
                }
            } catch (saveError) {
                console.error('Error saving to localStorage:', saveError);
                alert('Veri kaydetme hatası! Lütfen tekrar deneyin.');
                return;
            }
            
            // Clear form
            firstNameEl.value = '';
            lastNameEl.value = '';
            roleEl.value = '';
            areaEl.value = '';
            emailEl.value = '';
            
            // Close modal
            closeMemberModal();
            
            // Clear editing state
            const wasEditing = editingMemberId !== null;
            editingMemberId = null;
            
            // Show success message
            showNotification(`Ekip üyesi başarıyla ${wasEditing ? 'düzenlendi' : 'eklendi'}!`, 'success');
            
            // Switch to team tab if not already there
            if (document.getElementById('teamTab') && !document.getElementById('teamTab').classList.contains('active')) {
                switchTab('team');
            }
            
            // Force immediate refresh with multiple attempts
            refreshTeamDataWithRetry();
            
            // Broadcast data update
            broadcastDataUpdate();
            
        } catch (error) {
            console.error('Error in addOrUpdateMember:', error);
            alert('Bir hata oluştu! Lütfen tekrar deneyin.');
        }
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
    
    // Debug localStorage function
    function debugLocalStorage() {
        const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
        
        alert(`localStorage Debug:\n\nTeam Members (${members.length}):\n${JSON.stringify(members, null, 2)}\n\nAssigned Tasks (${assignedTasks.length}):\n${JSON.stringify(assignedTasks, null, 2)}`);
        
        console.log('DEBUG - Team Members:', members);
        console.log('DEBUG - Assigned Tasks:', assignedTasks);
        
        // Force refresh
        loadTeamData();
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
    
    // Refresh team data with retry mechanism
    function refreshTeamDataWithRetry(retryCount = 0) {
        const maxRetries = 3;
        const retryDelay = 50;
        
        console.log(`refreshTeamDataWithRetry attempt ${retryCount + 1}`);
        
        // Immediate refresh
        loadTeamData();
        filterMembers();
        
        // Verify the refresh worked by checking if DOM was updated
        setTimeout(() => {
            const tbody = document.getElementById('membersTableBody');
            const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
            
            if (tbody && members.length > 0) {
                const tableRows = tbody.querySelectorAll('tr');
                console.log(`Table rows found: ${tableRows.length}, Members in storage: ${members.length}`);
                
                // If table is empty but we have members, retry
                if (tableRows.length === 0 && retryCount < maxRetries) {
                    console.log('Table not updated, retrying...');
                    setTimeout(() => {
                        refreshTeamDataWithRetry(retryCount + 1);
                    }, retryDelay * (retryCount + 1));
                } else {
                    console.log('Team data refresh completed successfully');
                }
            } else if (members.length === 0) {
                console.log('No members to display');
            }
        }, 10);
    }
    
    // Load team data function
    function loadTeamData() {
        const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        const assignedTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
        
        console.log('loadTeamData called, members:', members);
        console.log('loadTeamData called, assignedTasks:', assignedTasks);
        
        updateTeamStats(members, assignedTasks);
        displayTeamMembers(members);
        displayAssignedTasks(assignedTasks);
    }
    
    function updateTeamStats(members, assignedTasks) {
        const totalMembers = members.length;
        const developers = members.filter(m => ['iOS', 'Android', 'Backend', 'Frontend', 'DevOps'].includes(m.area)).length;
        const designers = members.filter(m => m.area === 'Tasarım').length;
        const totalAssignedTasks = assignedTasks.length;
        
        console.log('Updating stats:', { totalMembers, developers, designers, totalAssignedTasks });
        
        // Safely update elements if they exist
        const totalMembersEl = document.getElementById('totalMembers');
        const totalDevelopersEl = document.getElementById('totalDevelopers');
        const totalDesignersEl = document.getElementById('totalDesigners');
        const totalAssignedTasksEl = document.getElementById('totalAssignedTasks');
        
        if (totalMembersEl) totalMembersEl.textContent = totalMembers;
        if (totalDevelopersEl) totalDevelopersEl.textContent = developers;
        if (totalDesignersEl) totalDesignersEl.textContent = designers;
        if (totalAssignedTasksEl) totalAssignedTasksEl.textContent = totalAssignedTasks;
        
        console.log('Stats updated successfully');
    }
    
    function displayTeamMembers(members) {
        console.log('displayTeamMembers called with:', members);
        const tbody = document.getElementById('membersTableBody');
        const noMembersMessage = document.getElementById('noMembersMessage');
        
        console.log('tbody element:', tbody);
        console.log('noMembersMessage element:', noMembersMessage);
        
        // Check if elements exist
        if (!tbody) {
            console.error('membersTableBody element not found!');
            return;
        }
        
        if (!noMembersMessage) {
            console.error('noMembersMessage element not found!');
        }
        
        // Ensure members is an array
        if (!Array.isArray(members)) {
            console.error('Members is not an array:', members);
            members = [];
        }
        
        if (members.length === 0) {
            console.log('No members found, showing no members message');
            tbody.innerHTML = '';
            if (noMembersMessage) {
                noMembersMessage.classList.remove('hidden');
            }
            return;
        }
        
        console.log('Members found, hiding no members message and displaying table');
        if (noMembersMessage) {
            noMembersMessage.classList.add('hidden');
        }
        
        tbody.innerHTML = members.map(member => {
            // Handle member name - use name field or combine firstName/lastName
            const displayName = member.name || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'İsimsiz Üye';
            const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'İÜ';
            
            return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span class="text-sm font-medium text-blue-800">${initials}</span>
                            </div>
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${escapeHtml(displayName)}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${escapeHtml(member.role || 'Belirtilmemiş')}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAreaClass(member.area)}">
                        ${escapeHtml(member.area || 'Belirtilmemiş')}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${escapeHtml(member.email || 'Belirtilmemiş')}</div>
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
        `;
        }).join('');
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
