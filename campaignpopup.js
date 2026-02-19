// campaignpopup.js - Multi-step campaign modal functionality

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
    
    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        resetForm();
    }
    
    // Reset form to initial state
    function resetForm() {
        currentStep = 1;
        updateStepDisplay();
        form.reset();
    }
    
    // Update step display
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
        
        // Update form step visibility
        formSteps.forEach((step, index) => {
            if (index === currentStep - 1) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update button visibility
        prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'flex';
        submitBtn.style.display = currentStep === totalSteps ? 'flex' : 'none';
    }
    
    // Validate current step
    function validateStep(step) {
        const currentFormStep = document.getElementById(`step${step}`);
        const requiredInputs = currentFormStep.querySelectorAll('input[required], select[required]');
        
        let isValid = true;
        requiredInputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        // Additional validation for step 2 (at least one platform must be selected)
        if (step === 2) {
            const platformCheckboxes = currentFormStep.querySelectorAll('input[name="platforms"]:checked');
            if (platformCheckboxes.length === 0) {
                alert('Please select at least one platform');
                return false;
            }
        }
        
        if (!isValid) {
            alert('Please fill in all required fields');
        }
        
        return isValid;
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
    
    // Next button
    nextBtn.addEventListener('click', function() {
        if (validateStep(currentStep)) {
            currentStep++;
            updateStepDisplay();
        }
    });
    
    // Previous button
    prevBtn.addEventListener('click', function() {
        currentStep--;
        updateStepDisplay();
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateStep(currentStep)) {
            return;
        }
        
        // Collect form data
        const formData = new FormData(form);
        const campaignData = {
            campaignName: formData.get('campaignName'),
            jobTitle: formData.get('jobTitle'),
            location: formData.get('location'),
            experienceLevel: formData.get('experienceLevel'),
            platforms: formData.getAll('platforms'),
            employmentType: formData.getAll('employmentType'),
            minSalary: formData.get('minSalary'),
            maxSalary: formData.get('maxSalary'),
            keywords: formData.get('keywords'),
            notes: formData.get('notes'),
            createdAt: new Date().toISOString()
        };
        
        console.log('Campaign created:', campaignData);
        
        // Here you would typically send this data to your backend
        // For now, we'll just show a success message and close the modal
        
        alert(`Campaign "${campaignData.campaignName}" created successfully!`);
        closeModal();
        
        // Optional: Refresh the applications list or add the new campaign to the UI
    });
    
    // Initialize
    updateStepDisplay();
});
