// Updated applications.js - Consolidated modal handling

// Make sure the "New Campaign" button triggers the enhanced modal
document.addEventListener('DOMContentLoaded', function() {
    const newCampaignBtn = document.getElementById('newCampaignBtn');
    const campaignModal = document.getElementById('campaignModal');
    
    // Open campaign modal
    if (newCampaignBtn) {
        newCampaignBtn.addEventListener('click', function() {
            if (campaignModal) {
                campaignModal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent background scrolling
            }
        });
    }
    
    // The rest of the modal functionality will be handled by campaignpopup.js
    // Just make sure we don't have conflicting event listeners
});

// Your existing applications.js code below...
// (Keep all your existing functionality for viewing applications, filtering, etc.)
