// campaignpopup.js - Enhanced Multi-step campaign modal functionality

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('campaignModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('campaignForm');
    
    let currentStep = 1;
    const totalSteps = 3;
    let campaignDraft = {}; // Store form data as user progresses
    
    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        resetForm();
    }
    
    // Reset form to initial state
    function resetForm() {
        currentStep = 1;
        campaignDraft = {};
        updateStepDisplay();
        form.reset();
        clearErrors();
    }
    
    // Clear all error states
    function clearErrors() {
        const errorInputs = document.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));
    }
    
    // Save current step data
    function saveStepData(step) {
        const currentFormStep = document.getElementById(`step${step}`);
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
        
        console.log('Draft saved:', campaignDraft);
    }
    
    // Update step display with smooth animation
    function updateStepDisplay() {
        // Update step indicators
        const steps = document.querySelectorAll('.step');
        const formSteps = document.querySelectorAll('.form-step');
        
        steps.forEach((step, index) => {
            if (index < currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update form step visibility with fade effect
        formSteps.forEach((step, index) => {
            if (index === currentStep - 1) {
                step.style.display = 'block';
                setTimeout(() => step.classList.add('active'), 10);
            } else {
                step.classList.remove('active');
                setTimeout(() => step.style.display = 'none', 300);
            }
        });
        
        // Update button visibility and text
        prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        submitBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';
        
        // Update next button text based on step
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
        
        // Scroll to top of modal
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }
    
    // Validate current step with detailed error messages
    function validateStep(step) {
        const currentFormStep = document.getElementById(`step${step}`);
        const requiredInputs = currentFormStep.querySelectorAll('input[required], select[required]');
        
        let isValid = true;
        let errors = [];
        
        // Clear previous errors
        clearErrors();
        
        // Validate required fields
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
        
        // Step 1 specific validation
        if (step === 1) {
            const campaignName = document.getElementById('campaignName').value.trim();
            const jobTitle = document.getElementById('jobTitle').value.trim();
            
            if (!campaignName) {
                errors.push('Campaign Name is required');
            }
            if (!jobTitle) {
                errors.push('Job Title is required');
            }
        }
        
        // Step 2 specific validation
        if (step === 2) {
            const platformCheckboxes = currentFormStep.querySelectorAll('input[name="platforms"]:checked');
            if (platformCheckboxes.length === 0) {
                isValid = false;
                showNotification('Please select at least one platform', 'error');
                // Highlight the platform section
                const platformGrid = currentFormStep.querySelector('.platform-grid');
                if (platformGrid) {
                    platformGrid.style.border = '2px solid #EF4444';
                    setTimeout(() => {
                        platformGrid.style.border = '';
                    }, 2000);
                }
                return false;
            }
        }
        
        // Step 3 specific validation
        if (step === 3) {
            const minSalary = document.getElementById('minSalary').value;
            const maxSalary = document.getElementById('maxSalary').value;
            
            if (minSalary && maxSalary && parseInt(minSalary) > parseInt(maxSalary)) {
                isValid = false;
                showNotification('Minimum salary cannot be greater than maximum salary', 'error');
                document.getElementById('minSalary').classList.add('error');
                document.getElementById('maxSalary').classList.add('error');
                return false;
            }
        }
        
        if (!isValid && errors.length > 0) {
            showNotification(`Please fill in: ${errors.join(', ')}`, 'error');
        }
        
        return isValid;
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotif = document.querySelector('.notification');
        if (existingNotif) {
            existingNotif.remove();
        }
        
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
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    // Get campaign summary for display
    function getCampaignSummary() {
        const formData = new FormData(form);
        return {
            campaignName: formData.get('campaignName') || 'Unnamed Campaign',
            jobTitle: formData.get('jobTitle') || 'Not specified',
            location: formData.get('location') || 'Any location',
            experienceLevel: formData.get('experienceLevel') || 'Any level',
            platforms: formData.getAll('platforms'),
            employmentType: formData.getAll('employmentType'),
            minSalary: formData.get('minSalary') ? `$${parseInt(formData.get('minSalary')).toLocaleString()}` : 'Not specified',
            maxSalary: formData.get('maxSalary') ? `$${parseInt(formData.get('maxSalary')).toLocaleString()}` : 'Not specified',
            keywords: formData.get('keywords') || 'None',
            notes: formData.get('notes') || 'None'
        };
    }
    
    // Event Listeners
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal();
        }
    });
    
    // Next button with animation
    nextBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
            saveStepData(currentStep);
            currentStep++;
            updateStepDisplay();
            
            // Show success feedback
            if (currentStep === 2) {
                showNotification('Basic info saved! Now choose your platforms.', 'success');
            } else if (currentStep === 3) {
                showNotification('Platforms selected! Almost done...', 'success');
            }
        }
    });
    
    // Previous button
    prevBtn.addEventListener('click', function() {
        saveStepData(currentStep); // Save current data before going back
        currentStep--;
        updateStepDisplay();
    });
    
    // Form submission with confirmation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateStep(currentStep)) {
            return;
        }
        
        // Collect final form data
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
        
        // Store in localStorage for persistence
        const existingCampaigns = JSON.parse(localStorage.getItem('jobCampaigns') || '[]');
        existingCampaigns.push(campaignData);
        localStorage.setItem('jobCampaigns', JSON.stringify(existingCampaigns));
        
        // Show success notification
        showNotification(`Campaign "${campaignData.campaignName}" created successfully! 🎉`, 'success');
        
        // Close modal after brief delay
        setTimeout(() => {
            closeModal();
            
            // Optional: Trigger a custom event that the main app can listen to
            window.dispatchEvent(new CustomEvent('campaignCreated', { detail: campaignData }));
        }, 1500);
    });
    
    // Add visual feedback for platform selection
    const platformCheckboxes = document.querySelectorAll('input[name="platforms"]');
    platformCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const selectedCount = document.querySelectorAll('input[name="platforms"]:checked').length;
            const platformLabel = document.querySelector('.platform-grid').previousElementSibling;
            if (selectedCount > 0 && platformLabel) {
                platformLabel.style.color = 'var(--success-color)';
            }
        });
    });
    
    // Add visual feedback for employment type selection
    const employmentCheckboxes = document.querySelectorAll('input[name="employmentType"]');
    employmentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Just for visual feedback, no validation needed
        });
    });
    
    // Initialize
    updateStepDisplay();
    
    // Listen for campaign display requests
    window.addEventListener('campaignCreated', function(e) {
        console.log('New campaign created:', e.detail);
        // You can update the UI here to show the new campaign
    });
});
