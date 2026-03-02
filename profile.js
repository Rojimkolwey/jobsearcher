// profile.js - User Profile Management

console.log('Profile.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page ready');
    
    // Get form elements
    const form = document.getElementById('profileForm');
    const saveBtn = document.getElementById('saveProfileBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const resumeUpload = document.getElementById('resumeUpload');
    const resumeUploadBox = document.getElementById('resumeUploadBox');
    const resumePreview = document.getElementById('resumePreview');
    const removeResumeBtn = document.getElementById('removeResume');
    
    // Profile completion tracking
    const progressCircle = document.getElementById('progressCircle');
    const profilePercentage = document.getElementById('profilePercentage');
    
    let uploadedResume = null;
    
    // Load existing profile data
    loadProfile();
    
    // Calculate initial profile completion
    updateProfileCompletion();
    
    // ==================== RESUME UPLOAD ====================
    
    // Click to upload
    resumeUploadBox.addEventListener('click', function(e) {
        if (!e.target.closest('.uploaded-file')) {
            resumeUpload.click();
        }
    });
    
    // Drag and drop
    resumeUploadBox.addEventListener('dragover', function(e) {
        e.preventDefault();
        resumeUploadBox.classList.add('dragover');
    });
    
    resumeUploadBox.addEventListener('dragleave', function() {
        resumeUploadBox.classList.remove('dragover');
    });
    
    resumeUploadBox.addEventListener('drop', function(e) {
        e.preventDefault();
        resumeUploadBox.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleResumeUpload(files[0]);
        }
    });
    
    // File input change
    resumeUpload.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleResumeUpload(e.target.files[0]);
        }
    });
    
    // Remove resume
    if (removeResumeBtn) {
        removeResumeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeResume();
        });
    }
    
    function handleResumeUpload(file) {
        // Validate file type
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            showNotification('Please upload a PDF, DOC, or DOCX file', 'error');
            return;
        }
        
        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('File size must be less than 5MB', 'error');
            return;
        }
        
        // Read file as base64
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedResume = {
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                uploadedAt: new Date().toISOString()
            };
            
            displayResumePreview(uploadedResume);
            showNotification('Resume uploaded successfully!', 'success');
            updateProfileCompletion();
        };
        reader.readAsDataURL(file);
    }
    
    function displayResumePreview(resume) {
        document.getElementById('resumeFileName').textContent = resume.name;
        document.getElementById('resumeFileSize').textContent = formatFileSize(resume.size);
        
        document.querySelector('.upload-content').style.display = 'none';
        resumePreview.style.display = 'flex';
    }
    
    function removeResume() {
        uploadedResume = null;
        document.querySelector('.upload-content').style.display = 'flex';
        resumePreview.style.display = 'none';
        resumeUpload.value = '';
        showNotification('Resume removed', 'info');
        updateProfileCompletion();
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    // ==================== FORM SUBMISSION ====================
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });
    
    saveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        saveProfile();
    });
    
    function saveProfile() {
        const formData = new FormData(form);
        
        // Create profile object
        const profile = {
            // Personal Info
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            location: formData.get('location'),
            
            // Professional Links
            linkedInUrl: formData.get('linkedInUrl'),
            githubUrl: formData.get('githubUrl'),
            portfolioUrl: formData.get('portfolioUrl'),
            
            // Resume
            resume: uploadedResume,
            coverLetter: formData.get('coverLetter'),
            
            // Skills & Experience
            yearsExperience: formData.get('yearsExperience'),
            currentTitle: formData.get('currentTitle'),
            skills: formData.get('skills'),
            bio: formData.get('bio'),
            
            // Salary
            minSalary: formData.get('minSalary'),
            maxSalary: formData.get('maxSalary'),
            
            // Preferences
            workType: formData.getAll('workType'),
            employmentType: formData.getAll('employmentType'),
            
            // Metadata
            updatedAt: new Date().toISOString(),
            completionPercentage: calculateCompletion(formData)
        };
        
        // Validate required fields
        if (!profile.firstName || !profile.lastName || !profile.email || !profile.phone) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Validate salary range
        if (profile.minSalary && profile.maxSalary && parseInt(profile.minSalary) > parseInt(profile.maxSalary)) {
            showNotification('Minimum salary cannot exceed maximum salary', 'error');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profile));
        
        console.log('Profile saved:', profile);
        showNotification('Profile saved successfully! 🎉', 'success');
        
        // Update completion
        updateProfileCompletion();
        
        // Dispatch event for other parts of the app
        window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profile }));
    }
    
    // ==================== LOAD PROFILE ====================
    
    function loadProfile() {
        const saved = localStorage.getItem('userProfile');
        if (!saved) return;
        
        try {
            const profile = JSON.parse(saved);
            
            // Fill in form fields
            document.getElementById('firstName').value = profile.firstName || '';
            document.getElementById('lastName').value = profile.lastName || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('phone').value = profile.phone || '';
            document.getElementById('location').value = profile.location || '';
            
            document.getElementById('linkedInUrl').value = profile.linkedInUrl || '';
            document.getElementById('githubUrl').value = profile.githubUrl || '';
            document.getElementById('portfolioUrl').value = profile.portfolioUrl || '';
            
            document.getElementById('coverLetter').value = profile.coverLetter || '';
            
            document.getElementById('yearsExperience').value = profile.yearsExperience || '';
            document.getElementById('currentTitle').value = profile.currentTitle || '';
            document.getElementById('skills').value = profile.skills || '';
            document.getElementById('bio').value = profile.bio || '';
            
            document.getElementById('minSalary').value = profile.minSalary || '';
            document.getElementById('maxSalary').value = profile.maxSalary || '';
            
            // Resume
            if (profile.resume) {
                uploadedResume = profile.resume;
                displayResumePreview(profile.resume);
            }
            
            // Checkboxes
            if (profile.workType) {
                profile.workType.forEach(type => {
                    const checkbox = document.querySelector(`input[name="workType"][value="${type}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (profile.employmentType) {
                profile.employmentType.forEach(type => {
                    const checkbox = document.querySelector(`input[name="employmentType"][value="${type}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            console.log('Profile loaded');
            showNotification('Profile loaded', 'info');
            
        } catch (e) {
            console.error('Error loading profile:', e);
        }
    }
    
    // ==================== CANCEL/RESET ====================
    
    cancelBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset the form? Unsaved changes will be lost.')) {
            form.reset();
            removeResume();
            loadProfile();
            showNotification('Form reset', 'info');
        }
    });
    
    // ==================== PROFILE COMPLETION ====================
    
    function updateProfileCompletion() {
        const formData = new FormData(form);
        const percentage = calculateCompletion(formData);
        
        // Update progress circle
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (percentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        profilePercentage.textContent = percentage + '%';
        
        // Update badges
        updateCompletionBadges(formData);
    }
    
    function calculateCompletion(formData) {
        let completed = 0;
        const total = 10;
        
        // Basic Info (4 points)
        if (formData.get('firstName')) completed++;
        if (formData.get('lastName')) completed++;
        if (formData.get('email')) completed++;
        if (formData.get('phone')) completed++;
        
        // Resume (2 points)
        if (uploadedResume) completed += 2;
        
        // Skills (2 points)
        if (formData.get('skills')) completed++;
        if (formData.get('yearsExperience')) completed++;
        
        // Salary (1 point)
        if (formData.get('minSalary') && formData.get('maxSalary')) completed++;
        
        // Links (1 point)
        if (formData.get('linkedInUrl')) completed++;
        
        return Math.round((completed / total) * 100);
    }
    
    function updateCompletionBadges(formData) {
        // Basic Info
        const basicComplete = formData.get('firstName') && formData.get('lastName') && 
                             formData.get('email') && formData.get('phone');
        updateBadge('basicInfoBadge', basicComplete ? 'Complete' : 'Incomplete');
        
        // Resume
        updateBadge('resumeBadge', uploadedResume ? 'Uploaded' : 'Missing');
        
        // Skills
        const skillsComplete = formData.get('skills') && formData.get('yearsExperience');
        updateBadge('skillsBadge', skillsComplete ? 'Complete' : 'Incomplete');
        
        // Links
        const hasLinks = formData.get('linkedInUrl') || formData.get('githubUrl') || formData.get('portfolioUrl');
        updateBadge('linksBadge', hasLinks ? 'Added' : 'Optional');
    }
    
    function updateBadge(badgeId, status) {
        const badge = document.getElementById(badgeId);
        badge.textContent = status;
        badge.className = 'strength-badge';
        
        if (status === 'Complete' || status === 'Uploaded' || status === 'Added') {
            badge.classList.add('badge-success');
        } else if (status === 'Missing' || status === 'Incomplete') {
            badge.classList.add('badge-warning');
        } else {
            badge.classList.add('badge-info');
        }
    }
    
    // ==================== REAL-TIME VALIDATION ====================
    
    // Update completion as user types
    form.addEventListener('input', function() {
        updateProfileCompletion();
    });
    
    // Validate salary range in real-time
    document.getElementById('minSalary').addEventListener('input', validateSalaryRange);
    document.getElementById('maxSalary').addEventListener('input', validateSalaryRange);
    
    function validateSalaryRange() {
        const minSalary = parseInt(document.getElementById('minSalary').value);
        const maxSalary = parseInt(document.getElementById('maxSalary').value);
        
        if (minSalary && maxSalary && minSalary > maxSalary) {
            document.getElementById('maxSalary').classList.add('error');
            document.getElementById('minSalary').classList.add('error');
        } else {
            document.getElementById('maxSalary').classList.remove('error');
            document.getElementById('minSalary').classList.remove('error');
        }
    }
    
    // ==================== NOTIFICATIONS ====================
    
    function showNotification(message, type = 'info') {
        const existingNotif = document.querySelector('.notification');
        if (existingNotif) existingNotif.remove();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' : 
                      type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' : 
                      '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'}
                </svg>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    console.log('Profile page initialized');
});
