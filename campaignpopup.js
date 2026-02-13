// ========================================
// Campaign Modal JavaScript
// ======================================== //

let currentStep = 1;
const totalSteps = 3;

// ========================================
// Step Navigation
// ========================================

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update step indicators
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 === step) {
            stepEl.classList.add('active');
        } else if (index + 1 < step) {
            stepEl.classList.add('completed');
        }
    });
    
    // Update buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (step === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    } else if (step === totalSteps) {
        prevBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        prevBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }
    
    currentStep = step;
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

// ========================================
// Validation
// ========================================

function validateCurrentStep() {
    const currentStepEl = document.getElementById(`step${currentStep}`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#EF4444';
            isValid = false;
            
            // Reset border color on input
            field.addEventListener('input', function() {
                this.style.borderColor = '';
            }, { once: true });
        }
    });
    
    // Special validation for platforms
    if (currentStep === 2) {
        const platformChecked = document.querySelectorAll('input[name="platforms"]:checked').length > 0;
        if (!platformChecked) {
            alert('Please select at least one platform');
            isValid = false;
        }
    }
    
    if (!isValid) {
        const firstInvalid = currentStepEl.querySelector('[required][value=""]');
        if (firstInvalid) {
            firstInvalid.focus();
        }
    }
    
    return isValid;
}

// ========================================
// Form Submission
// ========================================

function handleSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    const formData = new FormData(document.getElementById('campaignForm'));
    
    // Collect all form data
    const campaignData = {
        campaignName: formData.get('campaignName'),
        jobTitle: formData.get('jobTitle'),
        location: formData.get('location') || '',
        experienceLevel: formData.get('experienceLevel') || '',
        platforms: formData.getAll('platforms'),
        employmentTypes: formData.getAll('employmentType'),
        minSalary: formData.get('minSalary') || null,
        maxSalary: formData.get('maxSalary') || null,
        keywords: formData.get('keywords') ? formData.get('keywords').split(',').map(k => k.trim()) : [],
        notes: formData.get('notes') || '',
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    console.log('Campaign Data:', campaignData);
    
    // Show success message
    showSuccessMessage(campaignData);
    
    // TODO: Send to n8n webhook when ready
    // await fetch('http://localhost:5678/webhook/create-campaign', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(campaignData)
    // });
}

function showSuccessMessage(data) {
    const modal = document.getElementById('campaignModal');
    const modalContainer = modal.querySelector('.modal-container');
    
    modalContainer.innerHTML = `
        <div class="success-container">
            <div class="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <h2>Campaign Created!</h2>
            <p class="success-message">Your campaign "<strong>${data.campaignName}</strong>" has been created successfully.</p>
            <div class="success-details">
                <div class="detail-row">
                    <span class="detail-label">Job Title:</span>
                    <span class="detail-value">${data.jobTitle}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Platforms:</span>
                    <span class="detail-value">${data.platforms.join(', ')}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">${data.location || 'Any'}</span>
                </div>
            </div>
            <div class="info-box" style="margin-top: 1.5rem;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <div>
                    Your campaign is now active and will start searching for matching jobs. 
                    You'll be notified when applications are submitted.
                </div>
            </div>
            <button class="btn-primary" onclick="closeModal()" style="margin-top: 2rem; width: 100%;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Done
            </button>
        </div>
    `;
    
    // Add success container styles
    const style = document.createElement('style');
    style.textContent = `
        .success-container {
            padding: 3rem 2rem;
            text-align: center;
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: #D1FAE5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: #10B981;
            animation: scaleIn 0.5s ease;
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0);
            }
            to {
                transform: scale(1);
            }
        }
        
        .success-container h2 {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }
        
        .success-message {
            font-size: 1rem;
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
        }
        
        .success-details {
            background: var(--bg-tertiary);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            text-align: left;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border);
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            font-weight: 500;
        }
        
        .detail-value {
            font-size: 0.875rem;
            color: var(--text-primary);
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
}

function closeModal() {
    // If integrating with main app, you'd close the modal here
    // For standalone demo, we'll just reset
    window.location.reload();
}

// ========================================
// Event Listeners
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Navigation buttons
    document.getElementById('nextBtn').addEventListener('click', nextStep);
    document.getElementById('prevBtn').addEventListener('click', prevStep);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Form submission
    document.getElementById('campaignForm').addEventListener('submit', handleSubmit);
    
    // Close on overlay click
    document.querySelector('.modal-overlay').addEventListener('click', closeModal);
    
    // Prevent modal close on container click
    document.querySelector('.modal-container').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Initialize first step
    showStep(1);
});
