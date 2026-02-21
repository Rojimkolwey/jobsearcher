// app.js - Main application JavaScript with modal trigger

document.addEventListener('DOMContentLoaded', function() {
    console.log('App.js loaded');
    
    // ==================== MODAL TRIGGER ====================
    const newCampaignBtn = document.getElementById('newCampaignBtn');
    const campaignModal = document.getElementById('campaignModal');
    
    console.log('New Campaign Button:', newCampaignBtn);
    console.log('Campaign Modal:', campaignModal);
    
    // Open campaign modal when button is clicked
    if (newCampaignBtn && campaignModal) {
        console.log('Setting up modal trigger...');
        newCampaignBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('New Campaign button clicked!');
            campaignModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    } else {
        console.error('Modal elements not found!');
    }
    
    // ==================== CAMPAIGN MODAL FUNCTIONALITY ====================
    const modal = document.getElementById('campaignModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('campaignForm');
    
    let currentStep = 1;
    const totalSteps = 3;
    let campaignDraft = {};
    
    // Close modal function
    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            resetForm();
        }
    }
    
    // Reset form
    function resetForm() {
        currentStep = 1;
        campaignDraft = {};
        if (form) form.reset();
        updateStepDisplay();
        clearErrors();
    }
    
    // Clear errors
    function clearErrors() {
        const errorInputs = document.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));
    }
    
    // Save step data
    function saveStepData(step) {
        const currentFormStep = document.getElementById(`step${step}`);
        if (!currentFormStep) return;
        
        const inputs = currentFormStep.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!campaignDraft[input.name]) {
                    campaignDraft[input.name] = [];
                }
                if (input.checked && !campaignDraft[input.name].includes(input.value)) {
                    campaignDraft[input.name].push(input.value);
                }
            } else {
                campaignDraft[input.name] = input.value;
            }
        });
    }
    
    // Update step display
    function updateStepDisplay() {
        const steps = document.querySelectorAll('.step');
        const formSteps = document.querySelectorAll('.form-step');
        
        steps.forEach((step, index) => {
            if (index < currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        formSteps.forEach((step, index) => {
            if (index === currentStep - 1) {
                step.style.display = 'block';
                setTimeout(() => step.classList.add('active'), 10);
            } else {
                step.classList.remove('active');
                setTimeout(() => step.style.display = 'none', 300);
            }
        });
        
        if (prevBtn) prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        if (nextBtn) nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        if (submitBtn) submitBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';
        
        // Update next button text
        if (nextBtn) {
            if (currentStep === 1) {
                nextBtn.innerHTML = `
                    Next
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                `;
            } else if (currentStep === 2) {
                nextBtn.innerHTML = `
                    Continue to Preferences
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                `;
            }
        }
    }
    
    // Validate step
    function validateStep(step) {
        const currentFormStep = document.getElementById(`step${step}`);
        if (!currentFormStep) return true;
        
        const requiredInputs = currentFormStep.querySelectorAll('input[required], select[required]');
        let isValid = true;
        let errors = [];
        
        clearErrors();
        
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                const label = currentFormStep.querySelector(`label[for="${input.id}"]`);
                if (label) {
                    errors.push(label.textContent.split('*')[0].trim());
                }
            }
        });
        
        // Step 2: Platform validation
        if (step === 2) {
            const platformCheckboxes = currentFormStep.querySelectorAll('input[name="platforms"]:checked');
            if (platformCheckboxes.length === 0) {
                showNotification('Please select at least one platform', 'error');
                return false;
            }
        }
        
        // Step 3: Salary validation
        if (step === 3) {
            const minSalary = document.getElementById('minSalary');
            const maxSalary = document.getElementById('maxSalary');
            if (minSalary && maxSalary && minSalary.value && maxSalary.value) {
                if (parseInt(minSalary.value) > parseInt(maxSalary.value)) {
                    showNotification('Minimum salary cannot be greater than maximum salary', 'error');
                    minSalary.classList.add('error');
                    maxSalary.classList.add('error');
                    return false;
                }
            }
        }
        
        if (!isValid && errors.length > 0) {
            showNotification(`Please fill in: ${errors.join(', ')}`, 'error');
        }
        
        return isValid;
    }
    
    // Show notification
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
    
    // Event listeners for modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (validateStep(currentStep)) {
                saveStepData(currentStep);
                currentStep++;
                updateStepDisplay();
                
                if (currentStep === 2) {
                    showNotification('Basic info saved! Now choose your platforms.', 'success');
                } else if (currentStep === 3) {
                    showNotification('Platforms selected! Almost done...', 'success');
                }
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            saveStepData(currentStep);
            currentStep--;
            updateStepDisplay();
        });
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateStep(currentStep)) {
                return;
            }
            
            const formData = new FormData(form);
            const campaignData = {
                id: 'campaign_' + Date.now(),
                campaignName: formData.get('campaignName'),
                jobTitle: formData.get('jobTitle'),
                location: formData.get('location') || 'Any',
                experienceLevel: formData.get('experienceLevel') || 'Any',
                platforms: formData.getAll('platforms'),
                employmentType: formData.getAll('employmentType').length > 0 ? formData.getAll('employmentType') : ['Full-time'],
                minSalary: formData.get('minSalary') || null,
                maxSalary: formData.get('maxSalary') || null,
                keywords: formData.get('keywords') ? formData.get('keywords').split(',').map(k => k.trim()) : [],
                notes: formData.get('notes') || '',
                status: 'active',
                createdAt: new Date().toISOString(),
                applicationsCount: 0
            };
            
            console.log('Campaign created:', campaignData);
            
            // Store in localStorage
            const existingCampaigns = JSON.parse(localStorage.getItem('jobCampaigns') || '[]');
            existingCampaigns.push(campaignData);
            localStorage.setItem('jobCampaigns', JSON.stringify(existingCampaigns));
            
            showNotification(`Campaign "${campaignData.campaignName}" created successfully! 🎉`, 'success');
            
            setTimeout(() => {
                closeModal();
                window.dispatchEvent(new CustomEvent('campaignCreated', { detail: campaignData }));
            }, 1500);
        });
    }
    
    // Initialize step display
    updateStepDisplay();
    
    // ==================== YOUR OTHER APP FUNCTIONALITY ====================
    // Add your existing application code here (filters, search, etc.)
    
});