// app.js - Fixed version with guaranteed step navigation

console.log('=== APP.JS LOADING ===');

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM READY ===');
    
    // Wait a bit for modal HTML to be fully parsed
    setTimeout(initializeApp, 100);
});

function initializeApp() {
    console.log('=== INITIALIZING APP ===');
    
    // ==================== GET ALL ELEMENTS ====================
    const newCampaignBtn = document.getElementById('newCampaignBtn');
    const campaignModal = document.getElementById('campaignModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('campaignForm');
    
    console.log('Elements found:');
    console.log('✓ newCampaignBtn:', !!newCampaignBtn);
    console.log('✓ campaignModal:', !!campaignModal);
    console.log('✓ closeModalBtn:', !!closeModalBtn);
    console.log('✓ cancelBtn:', !!cancelBtn);
    console.log('✓ nextBtn:', !!nextBtn);
    console.log('✓ prevBtn:', !!prevBtn);
    console.log('✓ submitBtn:', !!submitBtn);
    console.log('✓ form:', !!form);
    
    // ==================== STATE ====================
    let currentStep = 1;
    const totalSteps = 3;
    let campaignDraft = {};
    
    // ==================== OPEN MODAL ====================
    if (newCampaignBtn && campaignModal) {
        console.log('Setting up New Campaign button...');
        newCampaignBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('>>> Opening modal...');
            campaignModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateStepDisplay();
        });
    }
    
    // ==================== CLOSE MODAL ====================
    function closeModal() {
        console.log('>>> Closing modal...');
        if (campaignModal) {
            campaignModal.classList.remove('active');
            document.body.style.overflow = '';
            resetForm();
        }
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (campaignModal) {
        campaignModal.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal();
            }
        });
    }
    
    // ==================== RESET FORM ====================
    function resetForm() {
        console.log('>>> Resetting form...');
        currentStep = 1;
        campaignDraft = {};
        if (form) form.reset();
        clearErrors();
        updateStepDisplay();
    }
    
    // ==================== CLEAR ERRORS ====================
    function clearErrors() {
        const errorInputs = document.querySelectorAll('.error');
        errorInputs.forEach(input => input.classList.remove('error'));
    }
    
    // ==================== UPDATE STEP DISPLAY ====================
    function updateStepDisplay() {
        console.log('>>> Updating display to step:', currentStep);
        
        // Update step indicators
        const steps = document.querySelectorAll('.step');
        console.log('Step indicators found:', steps.length);
        
        steps.forEach((step, index) => {
            if (index < currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update form steps
        const formSteps = document.querySelectorAll('.form-step');
        console.log('Form steps found:', formSteps.length);
        
        formSteps.forEach((step, index) => {
            const stepNum = index + 1;
            if (stepNum === currentStep) {
                console.log(`  -> Showing step ${stepNum}`);
                step.style.display = 'block';
                step.classList.add('active');
            } else {
                console.log(`  -> Hiding step ${stepNum}`);
                step.classList.remove('active');
                step.style.display = 'none';
            }
        });
        
        // Update buttons
        if (prevBtn) {
            prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        }
        
        if (nextBtn) {
            nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        }
        
        if (submitBtn) {
            submitBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';
        }
        
        console.log('Step display updated successfully');
    }
    
    // ==================== VALIDATE STEP ====================
    function validateStep(step) {
        console.log('>>> Validating step:', step);
        
        const currentFormStep = document.getElementById(`step${step}`);
        if (!currentFormStep) {
            console.error('ERROR: Step element not found:', `step${step}`);
            return false;
        }
        
        const requiredInputs = currentFormStep.querySelectorAll('input[required]');
        console.log('Required inputs found:', requiredInputs.length);
        
        let isValid = true;
        let errors = [];
        
        clearErrors();
        
        requiredInputs.forEach(input => {
            const value = input.value.trim();
            console.log(`  Checking ${input.name}: "${value}"`);
            
            if (!value) {
                isValid = false;
                input.classList.add('error');
                errors.push(input.name);
            }
        });
        
        // Step 2: Check platforms
        if (step === 2) {
            const platformChecked = currentFormStep.querySelectorAll('input[name="platforms"]:checked');
            console.log('Platforms selected:', platformChecked.length);
            
            if (platformChecked.length === 0) {
                isValid = false;
                showNotification('Please select at least one platform', 'error');
                return false;
            }
        }
        
        // Step 3: Check salary range
        if (step === 3) {
            const minSalary = document.getElementById('minSalary');
            const maxSalary = document.getElementById('maxSalary');
            
            if (minSalary && maxSalary && minSalary.value && maxSalary.value) {
                if (parseInt(minSalary.value) > parseInt(maxSalary.value)) {
                    isValid = false;
                    showNotification('Min salary cannot exceed max salary', 'error');
                    return false;
                }
            }
        }
        
        if (!isValid) {
            console.log('Validation FAILED. Missing:', errors);
            showNotification(`Please fill in: ${errors.join(', ')}`, 'error');
        } else {
            console.log('Validation PASSED ✓');
        }
        
        return isValid;
    }
    
    // ==================== SHOW NOTIFICATION ====================
    function showNotification(message, type = 'info') {
        console.log(`Notification [${type}]:`, message);
        
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
    
    // ==================== NEXT BUTTON ====================
    if (nextBtn) {
        console.log('✓ Attaching Next button handler...');
        
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('\n>>> NEXT BUTTON CLICKED <<<');
            console.log('Current step:', currentStep);
            
            if (validateStep(currentStep)) {
                currentStep++;
                console.log('Moving to step:', currentStep);
                updateStepDisplay();
                
                if (currentStep === 2) {
                    showNotification('Basic info saved! Choose your platforms.', 'success');
                } else if (currentStep === 3) {
                    showNotification('Platforms selected! Almost done...', 'success');
                }
            }
        });
        
        console.log('✓ Next button handler attached!');
    } else {
        console.error('ERROR: Next button not found!');
    }
    
    // ==================== PREVIOUS BUTTON ====================
    if (prevBtn) {
        console.log('✓ Attaching Previous button handler...');
        
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('\n>>> PREVIOUS BUTTON CLICKED <<<');
            
            currentStep--;
            console.log('Moving back to step:', currentStep);
            updateStepDisplay();
        });
    }
    
    // ==================== SUBMIT BUTTON ====================
    if (submitBtn && form) {
        console.log('✓ Attaching Submit handler...');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('\n>>> FORM SUBMITTED <<<');
            
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
                employmentType: formData.getAll('employmentType'),
                minSalary: formData.get('minSalary') || null,
                maxSalary: formData.get('maxSalary') || null,
                keywords: formData.get('keywords') || '',
                notes: formData.get('notes') || '',
                status: 'active',
                createdAt: new Date().toISOString(),
                applicationsCount: 0
            };
            
            console.log('Campaign data:', campaignData);
            
            // Save to localStorage
            const campaigns = JSON.parse(localStorage.getItem('jobCampaigns') || '[]');
            campaigns.push(campaignData);
            localStorage.setItem('jobCampaigns', JSON.stringify(campaigns));
            
            showNotification(`Campaign "${campaignData.campaignName}" created! 🎉`, 'success');
            
            setTimeout(() => {
                closeModal();
                window.dispatchEvent(new CustomEvent('campaignCreated', { detail: campaignData }));
            }, 1500);
        });
    }
    
    console.log('=== APP INITIALIZED ===\n');
}


document.getElementById('campaignName').value