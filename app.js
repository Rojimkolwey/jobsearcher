// ========================================
// Configuration
// ========================================

const CONFIG = {
    // n8n webhook URLs - YOU WILL REPLACE THESE with your actual n8n webhook URLs
    webhooks: {
        createCampaign: 'http://localhost:5678/webhook/create-campaign',
        getApplications: 'http://localhost:5678/webhook/get-applications',
        getCampaigns: 'http://localhost:5678/webhook/get-campaigns',
        getStats: 'http://localhost:5678/webhook/get-stats',
        uploadResume: 'http://localhost:5678/webhook/upload-resume',
        findJobs: 'http://localhost:5678/webhook/find-jobs'
    }
};

// ========================================
// Utility Functions
// ========================================

/**
 * Make a request to n8n webhook
 * @param {string} url - The webhook URL
 * @param {object} data - Data to send
 * @param {string} method - HTTP method (GET, POST, etc.)
 */
async function callWebhook(url, data = {}, method = 'POST') {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Only add body for POST/PUT requests
        if (method === 'POST' || method === 'PUT') {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Webhook call failed:', error);
        showNotification('Error: ' + error.message, 'error');
        throw error;
    }
}

/**
 * Show notification to user
 * @param {string} message - The message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Show loading state on button
 * @param {HTMLElement} button - The button element
 * @param {boolean} loading - Whether to show loading state
 */
function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.textContent = 'Loading...';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}

// ========================================
// Campaign Functions
// ========================================

/**
 * Create a new job application campaign
 */
async function createNewCampaign() {
    // This would normally open a modal/form, but for demo we'll use prompts
    const campaignName = prompt('Enter campaign name (e.g., "Frontend Positions"):');
    if (!campaignName) return;
    
    const jobTitle = prompt('Enter job title to search for:');
    if (!jobTitle) return;
    
    const platforms = prompt('Enter platforms (comma separated, e.g., "Greenhouse,LinkedIn"):');
    if (!platforms) return;
    
    const data = {
        campaignName: campaignName,
        jobTitle: jobTitle,
        platforms: platforms.split(',').map(p => p.trim()),
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    try {
        showNotification('Creating campaign...', 'info');
        const result = await callWebhook(CONFIG.webhooks.createCampaign, data);
        showNotification('Campaign created successfully!', 'success');
        
        // Refresh campaigns list
        loadCampaigns();
    } catch (error) {
        console.error('Failed to create campaign:', error);
    }
}

/**
 * Load all campaigns from n8n
 */
async function loadCampaigns() {
    try {
        const campaigns = await callWebhook(CONFIG.webhooks.getCampaigns, {}, 'GET');
        
        // Update the campaigns section in the UI
        displayCampaigns(campaigns);
    } catch (error) {
        console.error('Failed to load campaigns:', error);
    }
}

/**
 * Display campaigns in the UI
 * @param {Array} campaigns - Array of campaign objects
 */
function displayCampaigns(campaigns) {
    const campaignsList = document.querySelector('.campaigns-list');
    if (!campaignsList) return;
    
    // Clear existing campaigns
    campaignsList.innerHTML = '';
    
    // Add each campaign
    campaigns.forEach(campaign => {
        const campaignCard = createCampaignCard(campaign);
        campaignsList.appendChild(campaignCard);
    });
}

/**
 * Create a campaign card element
 * @param {Object} campaign - Campaign data
 * @returns {HTMLElement} - Campaign card element
 */
function createCampaignCard(campaign) {
    const card = document.createElement('div');
    card.className = 'campaign-card';
    
    const statusClass = campaign.status === 'active' ? 'active' : 'paused';
    const progressPercent = campaign.progress || 0;
    
    card.innerHTML = `
        <div class="campaign-header">
            <h4>${campaign.name}</h4>
            <span class="campaign-status ${statusClass}">${campaign.status}</span>
        </div>
        <div class="campaign-stats">
            <div class="campaign-stat">
                <span class="stat-number">${campaign.applied || 0}</span>
                <span class="stat-text">Applied</span>
            </div>
            <div class="campaign-stat">
                <span class="stat-number">${campaign.responses || 0}</span>
                <span class="stat-text">Responses</span>
            </div>
            <div class="campaign-stat">
                <span class="stat-number">${campaign.interviews || 0}</span>
                <span class="stat-text">Interviews</span>
            </div>
        </div>
        <div class="campaign-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <span class="progress-text">${progressPercent}% Complete</span>
        </div>
    `;
    
    return card;
}

// ========================================
// Application Functions
// ========================================

/**
 * Load recent applications from n8n
 */
async function loadApplications() {
    try {
        const applications = await callWebhook(CONFIG.webhooks.getApplications, {}, 'GET');
        
        // Update the applications section in the UI
        displayApplications(applications);
    } catch (error) {
        console.error('Failed to load applications:', error);
    }
}

/**
 * Display applications in the UI
 * @param {Array} applications - Array of application objects
 */
function displayApplications(applications) {
    const applicationsList = document.querySelector('.applications-list');
    if (!applicationsList) return;
    
    // Clear existing applications
    applicationsList.innerHTML = '';
    
    // Add each application
    applications.forEach(app => {
        const appItem = createApplicationItem(app);
        applicationsList.appendChild(appItem);
    });
}

/**
 * Create an application item element
 * @param {Object} app - Application data
 * @returns {HTMLElement} - Application item element
 */
function createApplicationItem(app) {
    const item = document.createElement('div');
    item.className = 'application-item';
    
    // Get company initial
    const initial = app.company ? app.company.charAt(0).toUpperCase() : '?';
    
    // Random gradient for company logo
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
    
    item.innerHTML = `
        <div class="company-logo" style="background: ${randomGradient};">${initial}</div>
        <div class="application-info">
            <h4>${app.jobTitle}</h4>
            <p class="company">${app.company} • ${app.location}</p>
            <p class="date">Applied ${formatDate(app.appliedDate)}</p>
        </div>
        <span class="status-badge ${app.status.toLowerCase()}">${app.status}</span>
    `;
    
    return item;
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
}

// ========================================
// Stats Functions
// ========================================

/**
 * Load and update dashboard stats
 */
async function loadStats() {
    try {
        const stats = await callWebhook(CONFIG.webhooks.getStats, {}, 'GET');
        
        // Update stats in UI
        updateStats(stats);
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

/**
 * Update stats cards in the UI
 * @param {Object} stats - Stats data
 */
function updateStats(stats) {
    // Update total applications
    const totalApps = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (totalApps) totalApps.textContent = stats.totalApplications || 0;
    
    // Update active campaigns
    const activeCampaigns = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (activeCampaigns) activeCampaigns.textContent = stats.activeCampaigns || 0;
    
    // Update response rate
    const responseRate = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (responseRate) responseRate.textContent = `${stats.responseRate || 0}%`;
    
    // Update interviews
    const interviews = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (interviews) interviews.textContent = stats.interviews || 0;
}

// ========================================
// Other Action Functions
// ========================================

/**
 * Handle resume upload
 */
async function handleResumeUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result.split(',')[1];
            
            try {
                showNotification('Uploading resume...', 'info');
                
                const result = await callWebhook(CONFIG.webhooks.uploadResume, {
                    filename: file.name,
                    fileData: base64,
                    fileType: file.type
                });
                
                showNotification('Resume uploaded successfully!', 'success');
            } catch (error) {
                console.error('Failed to upload resume:', error);
            }
        };
        
        reader.readAsDataURL(file);
    };
    
    input.click();
}

/**
 * Search for jobs
 */
async function searchJobs() {
    const jobTitle = prompt('What job title are you looking for?');
    if (!jobTitle) return;
    
    const location = prompt('Location (or "Remote"):');
    if (!location) return;
    
    try {
        showNotification('Searching for jobs...', 'info');
        
        const result = await callWebhook(CONFIG.webhooks.findJobs, {
            jobTitle: jobTitle,
            location: location,
            platforms: ['Greenhouse', 'LinkedIn', 'Indeed']
        });
        
        showNotification(`Found ${result.count || 0} jobs!`, 'success');
        
        // You could display results in a modal or redirect to a jobs page
        console.log('Jobs found:', result);
    } catch (error) {
        console.error('Failed to search jobs:', error);
    }
}

/**
 * Open settings page
 */
function openSettings() {
    showNotification('Settings page coming soon!', 'info');
    // In the future, this could open a modal or navigate to settings page
}

// ========================================
// Event Listeners
// ========================================

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('JobAutomate initialized!');
    
    // Attach event listeners to action buttons
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        const buttonText = button.querySelector('span').textContent.trim();
        
        button.addEventListener('click', async function() {
            switch(buttonText) {
                case 'New Campaign':
                    await createNewCampaign();
                    break;
                case 'Upload Resume':
                    await handleResumeUpload();
                    break;
                case 'Find Jobs':
                    await searchJobs();
                    break;
                case 'Settings':
                    openSettings();
                    break;
            }
        });
    });
    
    // Load initial data
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
});

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
    try {
        // Load all data in parallel
        await Promise.all([
            loadStats(),
            loadApplications(),
            loadCampaigns()
        ]);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// ========================================
// Add CSS animations
// ========================================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
