// applications.js - Manage and Display Job Applications

console.log('Applications.js loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Applications page ready');
    
    // Get elements
    const searchInput = document.getElementById('searchInput');
    const filterPills = document.querySelectorAll('.filter-pill');
    const sortSelect = document.getElementById('sortSelect');
    const platformFilter = document.getElementById('platformFilter');
    const viewBtns = document.querySelectorAll('.view-btn');
    const applicationsContainer = document.getElementById('applicationsContainer');
    const kanbanView = document.getElementById('kanbanView');
    const exportBtn = document.getElementById('exportBtn');
    
    // State
    let applications = [];
    let currentFilter = 'all';
    let currentView = 'grid';
    let searchTerm = '';
    
    // Load applications
    loadApplications();
    
    // Generate sample data if none exists
    if (applications.length === 0) {
        applications = generateSampleApplications();
        saveApplications();
    }
    
    // Initial render
    renderApplications();
    updateCounts();
    
    // ==================== EVENT LISTENERS ====================
    
    // Search
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            searchTerm = e.target.value.toLowerCase();
            renderApplications();
        });
    }
    
    // Filter pills
    filterPills.forEach(pill => {
        pill.addEventListener('click', function() {
            currentFilter = this.dataset.status;
            
            // Update active state
            filterPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            renderApplications();
        });
    });
    
    // Sort
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            renderApplications();
        });
    }
    
    // Platform filter
    if (platformFilter) {
        platformFilter.addEventListener('change', function() {
            renderApplications();
        });
    }
    
    // View toggle
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currentView = this.dataset.view;
            
            // Update active state
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide views
            if (currentView === 'kanban') {
                applicationsContainer.style.display = 'none';
                kanbanView.style.display = 'grid';
            } else {
                applicationsContainer.style.display = currentView === 'grid' ? 'grid' : 'flex';
                applicationsContainer.className = currentView === 'grid' ? 'applications-grid' : 'applications-list';
                kanbanView.style.display = 'none';
            }
            
            renderApplications();
        });
    });
    
    // Export
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportApplications();
        });
    }
    
    // ==================== LOAD/SAVE ====================
    
    function loadApplications() {
        const saved = localStorage.getItem('applications');
        if (saved) {
            try {
                applications = JSON.parse(saved);
                console.log(`Loaded ${applications.length} applications`);
            } catch (e) {
                console.error('Error loading applications:', e);
                applications = [];
            }
        }
    }
    
    function saveApplications() {
        localStorage.setItem('applications', JSON.stringify(applications));
        console.log('Applications saved');
    }
    
    // ==================== GENERATE SAMPLE DATA ====================
    
    function generateSampleApplications() {
        const companies = [
            { name: 'Google', logo: 'G', color: '#4285F4' },
            { name: 'Meta', logo: 'M', color: '#0668E1' },
            { name: 'Apple', logo: 'A', color: '#000000' },
            { name: 'Amazon', logo: 'A', color: '#FF9900' },
            { name: 'Microsoft', logo: 'M', color: '#00A4EF' },
            { name: 'Netflix', logo: 'N', color: '#E50914' },
            { name: 'Stripe', logo: 'S', color: '#635BFF' },
            { name: 'Airbnb', logo: 'A', color: '#FF5A5F' },
            { name: 'Spotify', logo: 'S', color: '#1DB954' },
            { name: 'Twitter', logo: 'T', color: '#1DA1F2' },
            { name: 'Uber', logo: 'U', color: '#000000' },
            { name: 'Lyft', logo: 'L', color: '#FF00BF' },
            { name: 'Dropbox', logo: 'D', color: '#0061FF' },
            { name: 'Shopify', logo: 'S', color: '#96BF48' },
            { name: 'Square', logo: 'S', color: '#3E4348' }
        ];
        
        const positions = [
            'Senior Software Engineer',
            'Frontend Developer',
            'Backend Engineer',
            'Full Stack Developer',
            'DevOps Engineer',
            'Product Manager',
            'UI/UX Designer',
            'Data Scientist',
            'Machine Learning Engineer',
            'Engineering Manager'
        ];
        
        const locations = [
            'San Francisco, CA',
            'New York, NY',
            'Seattle, WA',
            'Austin, TX',
            'Remote',
            'Boston, MA',
            'Los Angeles, CA',
            'Chicago, IL'
        ];
        
        const statuses = ['pending', 'reviewing', 'interview', 'rejected', 'offer'];
        const platforms = ['Greenhouse', 'LinkedIn', 'Indeed', 'Workday'];
        
        const sampleApps = [];
        const now = Date.now();
        
        // Generate 25 applications
        for (let i = 0; i < 25; i++) {
            const company = companies[Math.floor(Math.random() * companies.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const daysAgo = Math.floor(Math.random() * 30);
            
            sampleApps.push({
                id: 'app_' + Date.now() + '_' + i,
                jobTitle: positions[Math.floor(Math.random() * positions.length)],
                company: company.name,
                companyLogo: company.logo,
                companyColor: company.color,
                location: locations[Math.floor(Math.random() * locations.length)],
                status: status,
                platform: platforms[Math.floor(Math.random() * platforms.length)],
                appliedDate: new Date(now - (daysAgo * 24 * 60 * 60 * 1000)).toISOString(),
                salary: '$' + (Math.floor(Math.random() * 100) + 80) + 'k - $' + (Math.floor(Math.random() * 100) + 120) + 'k',
                jobUrl: `https://example.com/jobs/${i}`,
                campaignName: ['Frontend Jobs', 'Backend Positions', 'Full Stack Roles'][Math.floor(Math.random() * 3)],
                notes: ''
            });
        }
        
        return sampleApps;
    }
    
    // ==================== RENDER ====================
    
    function renderApplications() {
        const filtered = getFilteredApplications();
        const sorted = sortApplications(filtered);
        
        if (currentView === 'kanban') {
            renderKanbanView(sorted);
        } else {
            renderGridOrListView(sorted);
        }
    }
    
    function getFilteredApplications() {
        return applications.filter(app => {
            // Status filter
            if (currentFilter !== 'all' && app.status !== currentFilter) {
                return false;
            }
            
            // Platform filter
            const platformValue = platformFilter ? platformFilter.value : 'all';
            if (platformValue !== 'all' && app.platform.toLowerCase() !== platformValue) {
                return false;
            }
            
            // Search
            if (searchTerm) {
                const searchable = `${app.jobTitle} ${app.company} ${app.location}`.toLowerCase();
                if (!searchable.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    function sortApplications(apps) {
        const sortValue = sortSelect ? sortSelect.value : 'date-desc';
        
        return [...apps].sort((a, b) => {
            switch (sortValue) {
                case 'date-desc':
                    return new Date(b.appliedDate) - new Date(a.appliedDate);
                case 'date-asc':
                    return new Date(a.appliedDate) - new Date(b.appliedDate);
                case 'company-asc':
                    return a.company.localeCompare(b.company);
                case 'company-desc':
                    return b.company.localeCompare(a.company);
                default:
                    return 0;
            }
        });
    }
    
    // ==================== RENDER GRID/LIST ====================
    
    function renderGridOrListView(apps) {
        if (apps.length === 0) {
            applicationsContainer.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; opacity: 0.3;">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <h3 style="margin-bottom: 0.5rem;">No applications found</h3>
                    <p style="color: var(--text-secondary);">Try adjusting your filters or create a new campaign to start applying</p>
                </div>
            `;
            return;
        }
        
        applicationsContainer.innerHTML = apps.map(app => createApplicationCard(app)).join('');
        
        // Add click listeners
        document.querySelectorAll('.application-card').forEach(card => {
            card.addEventListener('click', function() {
                const appId = this.dataset.id;
                openApplicationDetails(appId);
            });
        });
    }
    
    function createApplicationCard(app) {
        const statusClass = getStatusClass(app.status);
        const daysAgo = getDaysAgo(app.appliedDate);
        
        return `
            <div class="application-card" data-id="${app.id}">
                <div class="card-header">
                    <div class="company-logo" style="background: ${app.companyColor}20; color: ${app.companyColor};">
                        ${app.companyLogo}
                    </div>
                    <span class="status-badge ${statusClass}">${app.status}</span>
                </div>
                <h3 class="job-title">${app.jobTitle}</h3>
                <p class="company-name">${app.company}</p>
                <p class="job-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${app.location}
                </p>
                <div class="card-footer">
                    <span class="platform-tag">${app.platform}</span>
                    <span class="applied-date">${daysAgo}</span>
                </div>
            </div>
        `;
    }
    
    // ==================== RENDER KANBAN ====================
    
    function renderKanbanView(apps) {
        const columns = ['pending', 'reviewing', 'interview', 'rejected'];
        
        columns.forEach(status => {
            const columnApps = apps.filter(app => app.status === status);
            const container = kanbanView.querySelector(`[data-status="${status}"]`);
            
            if (!container) return;
            
            if (columnApps.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem 0; font-size: 0.875rem;">No applications</p>';
            } else {
                container.innerHTML = columnApps.map(app => createKanbanCard(app)).join('');
            }
            
            // Update count
            const countBadge = kanbanView.querySelector(`.kanban-column:has([data-status="${status}"]) .kanban-count`);
            if (countBadge) {
                countBadge.textContent = columnApps.length;
            }
        });
        
        // Add click listeners
        document.querySelectorAll('.application-card').forEach(card => {
            card.addEventListener('click', function() {
                const appId = this.dataset.id;
                openApplicationDetails(appId);
            });
        });
    }
    
    function createKanbanCard(app) {
        const daysAgo = getDaysAgo(app.appliedDate);
        
        return `
            <div class="application-card" data-id="${app.id}">
                <div class="card-header">
                    <div class="company-logo" style="background: ${app.companyColor}20; color: ${app.companyColor};">
                        ${app.companyLogo}
                    </div>
                </div>
                <h3 class="job-title">${app.jobTitle}</h3>
                <p class="company-name">${app.company}</p>
                <p class="job-location">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    ${app.location}
                </p>
                <div class="card-footer">
                    <span class="platform-tag">${app.platform}</span>
                    <span class="applied-date">${daysAgo}</span>
                </div>
            </div>
        `;
    }
    
    // ==================== APPLICATION DETAILS ====================
    
    function openApplicationDetails(appId) {
        const app = applications.find(a => a.id === appId);
        if (!app) return;
        
        // Populate modal
        document.getElementById('modalJobTitle').textContent = app.jobTitle;
        document.getElementById('modalCompany').textContent = app.company;
        document.getElementById('modalLocation').textContent = app.location;
        document.getElementById('modalPlatform').textContent = app.platform;
        document.getElementById('modalStatus').textContent = app.status;
        document.getElementById('modalStatus').className = 'status-badge ' + getStatusClass(app.status);
        document.getElementById('modalDate').textContent = formatDate(app.appliedDate);
        document.getElementById('modalCampaign').textContent = app.campaignName;
        document.getElementById('modalSalary').textContent = app.salary;
        document.getElementById('modalJobUrl').href = app.jobUrl;
        document.getElementById('modalNotes').value = app.notes || '';
        
        // Show modal
        document.getElementById('appDetailsModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Save notes button
        document.getElementById('saveNotesBtn').onclick = function() {
            app.notes = document.getElementById('modalNotes').value;
            saveApplications();
            showNotification('Notes saved', 'success');
        };
        
        // Close buttons
        document.getElementById('closeDetailsModal').onclick = closeModal;
        document.getElementById('closeDetailsBtn').onclick = closeModal;
        
        function closeModal() {
            document.getElementById('appDetailsModal').classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // ==================== UPDATE COUNTS ====================
    
    function updateCounts() {
        const counts = {
            all: applications.length,
            pending: applications.filter(a => a.status === 'pending').length,
            reviewing: applications.filter(a => a.status === 'reviewing').length,
            interview: applications.filter(a => a.status === 'interview').length,
            rejected: applications.filter(a => a.status === 'rejected').length
        };
        
        filterPills.forEach(pill => {
            const status = pill.dataset.status;
            const countSpan = pill.querySelector('.pill-count');
            if (countSpan && counts[status] !== undefined) {
                countSpan.textContent = counts[status];
            }
        });
    }
    
    // ==================== EXPORT ====================
    
    function exportApplications() {
        const csv = convertToCSV(applications);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-applications-${Date.now()}.csv`;
        link.click();
        
        showNotification('Applications exported successfully!', 'success');
    }
    
    function convertToCSV(data) {
        const headers = ['Job Title', 'Company', 'Location', 'Status', 'Platform', 'Applied Date', 'Salary', 'Campaign', 'URL'];
        const rows = data.map(app => [
            app.jobTitle,
            app.company,
            app.location,
            app.status,
            app.platform,
            formatDate(app.appliedDate),
            app.salary,
            app.campaignName,
            app.jobUrl
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    // ==================== UTILITIES ====================
    
    function getStatusClass(status) {
        switch (status) {
            case 'pending': return 'pending';
            case 'reviewing': return 'reviewing';
            case 'interview': return 'interview';
            case 'rejected': return 'rejected';
            case 'offer': return 'offer';
            default: return 'pending';
        }
    }
    
    function getDaysAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
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
    
    // ==================== LISTEN FOR NEW APPLICATIONS ====================
    
    window.addEventListener('campaignCreated', function(e) {
        console.log('New campaign created, applications may be added soon');
    });
    
    // Export function for other scripts
    window.addApplication = function(appData) {
        applications.push({
            id: 'app_' + Date.now(),
            ...appData,
            appliedDate: appData.appliedDate || new Date().toISOString()
        });
        saveApplications();
        renderApplications();
        updateCounts();
        showNotification('New application added!', 'success');
    };
    
    console.log('Applications page initialized');
});
