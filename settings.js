// settings.js - Settings Management

console.log('Settings.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Settings page ready');
    
    // Get elements
    const settingsForm = document.getElementById('settingsForm');
    const saveBtn = document.getElementById('saveSettingsBtn');
    const resetBtn = document.getElementById('resetSettingsBtn');
    const navItems = document.querySelectorAll('.settings-nav-item');
    const panels = document.querySelectorAll('.settings-panel');
    
    // Range slider
    const matchScoreSlider = document.getElementById('minMatchScore');
    const matchScoreValue = document.getElementById('matchScoreValue');
    
    // Load saved settings
    loadSettings();
    
    // Load account info from profile
    loadAccountInfo();
    
    // ==================== TAB NAVIGATION ====================
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
    
    function switchTab(tabName) {
        // Update nav
        navItems.forEach(item => {
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Update panels
        panels.forEach(panel => {
            if (panel.id === `${tabName}-panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }
    
    // ==================== RANGE SLIDER ====================
    
    if (matchScoreSlider) {
        matchScoreSlider.addEventListener('input', function() {
            matchScoreValue.textContent = this.value + '%';
        });
    }
    
    // ==================== SAVE SETTINGS ====================
    
    saveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
    
    function saveSettings() {
        const formData = new FormData(settingsForm);
        
        // Create settings object
        const settings = {
            // Automation
            autoApplyEnabled: formData.get('autoApplyEnabled') === 'on',
            minMatchScore: parseInt(formData.get('minMatchScore')),
            dailyLimit: formData.get('dailyLimit'),
            applySchedule: formData.get('applySchedule'),
            autoFollowUp: formData.get('autoFollowUp') === 'on',
            customizeCoverLetter: formData.get('customizeCoverLetter') === 'on',
            
            // Notifications
            notifyNewJobs: formData.get('notifyNewJobs') === 'on',
            notifyApplicationSent: formData.get('notifyApplicationSent') === 'on',
            notifyStatusUpdate: formData.get('notifyStatusUpdate') === 'on',
            notifyInterview: formData.get('notifyInterview') === 'on',
            notifyRejection: formData.get('notifyRejection') === 'on',
            dailySummary: formData.get('dailySummary') === 'on',
            weeklyReport: formData.get('weeklyReport') === 'on',
            
            // Integrations
            webhookUrl: formData.get('webhookUrl'),
            
            // Privacy
            saveHistory: formData.get('saveHistory') === 'on',
            analytics: formData.get('analytics') === 'on',
            
            // Advanced
            debugMode: formData.get('debugMode') === 'on',
            betaFeatures: formData.get('betaFeatures') === 'on',
            theme: formData.get('theme'),
            language: formData.get('language'),
            
            // Metadata
            lastUpdated: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        console.log('Settings saved:', settings);
        showNotification('Settings saved successfully! ✓', 'success');
        
        // Apply settings immediately
        applySettings(settings);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
    }
    
    // ==================== LOAD SETTINGS ====================
    
    function loadSettings() {
        const saved = localStorage.getItem('appSettings');
        if (!saved) {
            console.log('No saved settings, using defaults');
            return;
        }
        
        try {
            const settings = JSON.parse(saved);
            
            // Automation
            document.getElementById('autoApplyEnabled').checked = settings.autoApplyEnabled !== false;
            document.getElementById('minMatchScore').value = settings.minMatchScore || 80;
            matchScoreValue.textContent = (settings.minMatchScore || 80) + '%';
            document.getElementById('dailyLimit').value = settings.dailyLimit || '10';
            document.getElementById('applySchedule').value = settings.applySchedule || 'morning';
            document.getElementById('autoFollowUp').checked = settings.autoFollowUp === true;
            document.getElementById('customizeCoverLetter').checked = settings.customizeCoverLetter !== false;
            
            // Notifications
            const notifyCheckboxes = [
                'notifyNewJobs', 'notifyApplicationSent', 'notifyStatusUpdate',
                'notifyInterview', 'notifyRejection', 'dailySummary', 'weeklyReport'
            ];
            notifyCheckboxes.forEach(name => {
                const checkbox = document.querySelector(`[name="${name}"]`);
                if (checkbox) {
                    checkbox.checked = settings[name] !== false;
                }
            });
            
            // Integrations
            if (settings.webhookUrl) {
                document.getElementById('webhookUrl').value = settings.webhookUrl;
            }
            
            // Privacy
            const saveHistoryCheckbox = document.querySelector('[name="saveHistory"]');
            if (saveHistoryCheckbox) {
                saveHistoryCheckbox.checked = settings.saveHistory !== false;
            }
            
            const analyticsCheckbox = document.querySelector('[name="analytics"]');
            if (analyticsCheckbox) {
                analyticsCheckbox.checked = settings.analytics !== false;
            }
            
            // Advanced
            const debugCheckbox = document.querySelector('[name="debugMode"]');
            if (debugCheckbox) {
                debugCheckbox.checked = settings.debugMode === true;
            }
            
            const betaCheckbox = document.querySelector('[name="betaFeatures"]');
            if (betaCheckbox) {
                betaCheckbox.checked = settings.betaFeatures === true;
            }
            
            if (settings.theme) {
                document.getElementById('theme').value = settings.theme;
            }
            
            if (settings.language) {
                document.getElementById('language').value = settings.language;
            }
            
            console.log('Settings loaded');
            applySettings(settings);
            
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
    
    // ==================== APPLY SETTINGS ====================
    
    function applySettings(settings) {
        // Apply debug mode
        if (settings.debugMode) {
            window.DEBUG_MODE = true;
            console.log('Debug mode enabled');
        }
        
        // Apply theme
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // Store in global variable for other scripts
        window.APP_SETTINGS = settings;
    }
    
    // ==================== RESET SETTINGS ====================
    
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            localStorage.removeItem('appSettings');
            location.reload();
        }
    });
    
    // ==================== WEBHOOK TEST ====================
    
    const testWebhookBtn = document.getElementById('testWebhookBtn');
    if (testWebhookBtn) {
        testWebhookBtn.addEventListener('click', function() {
            testWebhook();
        });
    }
    
    function testWebhook() {
        const webhookUrl = document.getElementById('webhookUrl').value;
        
        if (!webhookUrl) {
            showNotification('Please enter a webhook URL first', 'error');
            return;
        }
        
        showNotification('Testing webhook connection...', 'info');
        
        // Send test payload
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                test: true,
                message: 'Test from JobAutomate Settings',
                timestamp: new Date().toISOString()
            })
        })
        .then(response => {
            if (response.ok) {
                showNotification('Webhook connected successfully! ✓', 'success');
            } else {
                showNotification('Webhook test failed. Check the URL and try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Webhook test error:', error);
            showNotification('Could not connect to webhook. Check your URL.', 'error');
        });
    }
    
    // ==================== DATA MANAGEMENT ====================
    
    const exportDataBtn = document.getElementById('exportDataBtn');
    const clearDataBtn = document.getElementById('clearDataBtn');
    
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            exportAllData();
        });
    }
    
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', function() {
            if (confirm('⚠️ WARNING: This will delete ALL your data including campaigns, applications, and profile. This cannot be undone. Are you absolutely sure?')) {
                clearAllData();
            }
        });
    }
    
    function exportAllData() {
        const data = {
            profile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
            campaigns: JSON.parse(localStorage.getItem('jobCampaigns') || '[]'),
            applications: JSON.parse(localStorage.getItem('applications') || '[]'),
            settings: JSON.parse(localStorage.getItem('appSettings') || '{}'),
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `jobautomate-data-${Date.now()}.json`;
        link.click();
        
        showNotification('Data exported successfully!', 'success');
    }
    
    function clearAllData() {
        localStorage.clear();
        showNotification('All data cleared. Reloading...', 'success');
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
    
    // ==================== ACCOUNT MANAGEMENT ====================
    
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            if (confirm('⚠️ FINAL WARNING: Delete your account and all data permanently? This CANNOT be undone!')) {
                clearAllData();
            }
        });
    }
    
    function loadAccountInfo() {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        if (profile.firstName && profile.lastName) {
            document.getElementById('accountName').textContent = 
                `${profile.firstName} ${profile.lastName}`;
        }
        
        if (profile.email) {
            document.getElementById('accountEmail').textContent = profile.email;
        }
        
        // Update avatar
        if (profile.firstName && profile.lastName) {
            const avatar = document.querySelector('.account-avatar');
            if (avatar) {
                avatar.textContent = 
                    profile.firstName.charAt(0) + profile.lastName.charAt(0);
            }
        }
    }
    
    // ==================== INTEGRATION CONNECTIONS ====================
    
    window.connectLinkedIn = function() {
        showNotification('LinkedIn OAuth integration coming soon!', 'info');
        // In production, this would open OAuth flow
    };
    
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
    
    // ==================== AUTO-SAVE ====================
    
    // Auto-save on toggle changes
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            console.log('Setting changed:', this.name, this.checked);
            // Auto-save could be implemented here
        });
    });
    
    console.log('Settings page initialized');
});
