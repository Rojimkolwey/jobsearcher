// app.js - Simple single-page campaign form

console.log('App.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready');
    
    // Get elements
    const newCampaignBtn = document.getElementById('newCampaignBtn');
    const campaignModal = document.getElementById('campaignModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('campaignForm');
    
    console.log('Elements:', {
        newCampaignBtn: !!newCampaignBtn,
        campaignModal: !!campaignModal,
        form: !!form
    });
    
    // Open modal
    if (newCampaignBtn && campaignModal) {
        newCampaignBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Opening modal');
            campaignModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close modal
    function closeModal() {
        if (campaignModal) {
            campaignModal.classList.remove('active');
            document.body.style.overflow = '';
            if (form) form.reset();
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
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            // Get form data
            const formData = new FormData(form);
            
            // Validate required fields
            const campaignName = formData.get('campaignName');
            const jobTitle = formData.get('jobTitle');
            const platforms = formData.getAll('platforms');
            
            if (!campaignName || !jobTitle) {
                showNotification('Please fill in Campaign Name and Job Title', 'error');
                return;
            }
            
            if (platforms.length === 0) {
                showNotification('Please select at least one platform', 'error');
                return;
            }
            
            // Create campaign object
            const campaignData = {
                id: 'campaign_' + Date.now(),
                campaignName: campaignName,
                jobTitle: jobTitle,
                location: formData.get('location') || 'Any',
                experienceLevel: formData.get('experienceLevel') || 'Any',
                platforms: platforms,
                employmentType: formData.getAll('employmentType'),
                minSalary: formData.get('minSalary') || null,
                maxSalary: formData.get('maxSalary') || null,
                keywords: formData.get('keywords') || '',
                notes: formData.get('notes') || '',
                status: 'active',
                createdAt: new Date().toISOString(),
                applicationsCount: 0
            };
            
            console.log('Campaign created:', campaignData);
            
            // Save to localStorage
            const campaigns = JSON.parse(localStorage.getItem('jobCampaigns') || '[]');
            campaigns.push(campaignData);
            localStorage.setItem('jobCampaigns', JSON.stringify(campaigns));
            
            // Send to n8n webhook
            fetch('https://simsain.app.n8n.cloud/webhook-test/create-campaign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(campaignData)
            })
            .then(response => {
                console.log('n8n webhook response:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('n8n webhook data:', data);
                showNotification(`Campaign "${campaignData.campaignName}" created and sent to automation! 🎉`, 'success');
            })
            .catch(error => {
                console.error('n8n webhook error:', error);
                // Still show success since it's saved locally
                showNotification(`Campaign "${campaignData.campaignName}" created successfully! 🎉`, 'success');
            });
            
            // Close modal after delay
            setTimeout(() => {
                closeModal();
                window.dispatchEvent(new CustomEvent('campaignCreated', { detail: campaignData }));
            }, 1500);
        });
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
    
    console.log('App initialized');
});
