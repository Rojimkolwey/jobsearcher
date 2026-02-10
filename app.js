// ========================================
// Sample Application Data (Mock Data)
// ========================================

const sampleApplications = [
    {
        id: 1,
        jobTitle: "Senior Frontend Developer",
        company: "Google",
        location: "Mountain View, CA",
        status: "pending",
        appliedDate: "2026-02-07T10:30:00",
        platform: "Greenhouse",
        jobUrl: "https://careers.google.com/jobs/example",
        campaign: "Frontend Positions",
        salary: "$140,000 - $200,000",
        notes: ""
    },
    {
        id: 2,
        jobTitle: "Full Stack Engineer",
        company: "Meta",
        location: "Menlo Park, CA",
        status: "reviewing",
        appliedDate: "2026-02-06T14:20:00",
        platform: "LinkedIn",
        jobUrl: "https://www.metacareers.com/jobs/example",
        campaign: "Full Stack Remote",
        salary: "$150,000 - $220,000",
        notes: ""
    },
    {
        id: 3,
        jobTitle: "Software Engineer II",
        company: "Amazon",
        location: "Seattle, WA",
        status: "interview",
        appliedDate: "2026-02-04T09:15:00",
        platform: "Greenhouse",
        jobUrl: "https://amazon.jobs/example",
        campaign: "Backend Roles",
        salary: "$130,000 - $185,000",
        notes: "Interview scheduled for Feb 15"
    },
    {
        id: 4,
        jobTitle: "DevOps Engineer",
        company: "Netflix",
        location: "Los Gatos, CA",
        status: "rejected",
        appliedDate: "2026-02-02T11:45:00",
        platform: "Workday",
        jobUrl: "https://jobs.netflix.com/example",
        campaign: "DevOps Positions",
        salary: "$145,000 - $210,000",
        notes: ""
    },
    {
        id: 5,
        jobTitle: "Backend Developer",
        company: "Stripe",
        location: "San Francisco, CA",
        status: "reviewing",
        appliedDate: "2026-01-31T16:00:00",
        platform: "Greenhouse",
        jobUrl: "https://stripe.com/jobs/example",
        campaign: "Backend Roles",
        salary: "$135,000 - $195,000",
        notes: ""
    },
    {
        id: 6,
        jobTitle: "React Developer",
        company: "Airbnb",
        location: "Remote",
        status: "pending",
        appliedDate: "2026-02-05T13:30:00",
        platform: "Indeed",
        jobUrl: "https://careers.airbnb.com/example",
        campaign: "Frontend Positions",
        salary: "$125,000 - $175,000",
        notes: ""
    },
    {
        id: 7,
        jobTitle: "Product Engineer",
        company: "Notion",
        location: "San Francisco, CA",
        status: "interview",
        appliedDate: "2026-02-03T10:00:00",
        platform: "LinkedIn",
        jobUrl: "https://notion.so/careers/example",
        campaign: "Product Roles",
        salary: "$140,000 - $190,000",
        notes: "Second round interview next week"
    },
    {
        id: 8,
        jobTitle: "Frontend Engineer",
        company: "Figma",
        location: "Remote",
        status: "reviewing",
        appliedDate: "2026-02-01T15:20:00",
        platform: "Greenhouse",
        jobUrl: "https://figma.com/careers/example",
        campaign: "Frontend Positions",
        salary: "$145,000 - $200,000",
        notes: ""
    }
];

// ========================================
// State Management
// ========================================

let currentView = 'grid';
let currentFilter = 'all';
let currentSort = 'date-desc';
let currentPlatform = 'all';
let searchQuery = '';
let currentPage = 1;
let itemsPerPage = 12;

// ========================================
// View Management
// ========================================

function switchView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide appropriate containers
    const gridContainer = document.getElementById('applicationsContainer');
    const kanbanView = document.getElementById('kanbanView');
    
    if (view === 'kanban') {
        gridContainer.style.display = 'none';
        kanbanView.style.display = 'grid';
        renderKanbanView();
    } else {
        gridContainer.style.display = view === 'grid' ? 'grid' : 'block';
        gridContainer.className = view === 'grid' ? 'applications-grid' : 'applications-list';
        kanbanView.style.display = 'none';
        renderApplications();
    }
}

// ========================================
// Filtering and Sorting
// ========================================

function getFilteredApplications() {
    let filtered = [...sampleApplications];
    
    // Apply status filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(app => app.status === currentFilter);
    }
    
    // Apply platform filter
    if (currentPlatform !== 'all') {
        filtered = filtered.filter(app => 
            app.platform.toLowerCase() === currentPlatform.toLowerCase()
        );
    }
    
    // Apply search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(app =>
            app.jobTitle.toLowerCase().includes(query) ||
            app.company.toLowerCase().includes(query) ||
            app.location.toLowerCase().includes(query)
        );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch(currentSort) {
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
    
    return filtered;
}

// ========================================
// Rendering Functions
// ========================================

function renderApplications() {
    const container = document.getElementById('applicationsContainer');
    const filtered = getFilteredApplications();
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedApps = filtered.slice(startIndex, endIndex);
    
    if (currentView === 'grid') {
        container.innerHTML = paginatedApps.map(app => createAppCard(app)).join('');
    } else {
        container.innerHTML = paginatedApps.map(app => createAppListItem(app)).join('');
    }
    
    // Add click listeners
    container.querySelectorAll('.app-card, .app-list-item').forEach((item, index) => {
        item.addEventListener('click', () => openAppDetails(paginatedApps[index]));
    });
    
    updatePagination(filtered.length);
}

function createAppCard(app) {
    const gradient = getRandomGradient();
    const initial = app.company.charAt(0).toUpperCase();
    
    return `
        <div class="app-card" data-id="${app.id}">
            <div class="app-card-header">
                <div class="app-card-logo" style="background: ${gradient};">${initial}</div>
                <div class="app-card-info">
                    <h3 class="app-card-title">${app.jobTitle}</h3>
                    <p class="app-card-company">${app.company}</p>
                    <p class="app-card-location">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        ${app.location}
                    </p>
                </div>
                <span class="status-badge ${app.status}">${capitalize(app.status)}</span>
            </div>
            <div class="app-card-meta">
                <span class="app-card-date">${formatDate(app.appliedDate)}</span>
                <span class="app-card-platform">${app.platform}</span>
            </div>
        </div>
    `;
}

function createAppListItem(app) {
    const gradient = getRandomGradient();
    const initial = app.company.charAt(0).toUpperCase();
    
    return `
        <div class="app-list-item" data-id="${app.id}">
            <div class="app-list-job">
                <div class="app-list-logo" style="background: ${gradient};">${initial}</div>
                <div>
                    <div class="app-list-title">${app.jobTitle}</div>
                    <div class="app-list-company">${app.company}</div>
                </div>
            </div>
            <div class="app-list-location">${app.location}</div>
            <div class="app-list-date">${formatDate(app.appliedDate)}</div>
            <div class="app-list-platform">${app.platform}</div>
            <span class="status-badge ${app.status}">${capitalize(app.status)}</span>
        </div>
    `;
}

function renderKanbanView() {
    const statuses = ['pending', 'reviewing', 'interview', 'rejected'];
    
    statuses.forEach(status => {
        const container = document.querySelector(`.kanban-cards[data-status="${status}"]`);
        const apps = sampleApplications.filter(app => app.status === status);
        
        container.innerHTML = apps.map(app => createKanbanCard(app)).join('');
        
        // Add click listeners
        container.querySelectorAll('.kanban-card').forEach((card, index) => {
            card.addEventListener('click', () => openAppDetails(apps[index]));
        });
    });
}

function createKanbanCard(app) {
    return `
        <div class="kanban-card" data-id="${app.id}">
            <div class="kanban-card-title">${app.jobTitle}</div>
            <div class="kanban-card-company">${app.company}</div>
            <div class="kanban-card-date">${formatDate(app.appliedDate)}</div>
        </div>
    `;
}

// ========================================
// Application Details Modal
// ========================================

function openAppDetails(app) {
    const modal = document.getElementById('appDetailsModal');
    
    // Populate modal with data
    document.getElementById('modalJobTitle').textContent = app.jobTitle;
    document.getElementById('modalCompany').textContent = app.company;
    document.getElementById('modalLocation').textContent = app.location;
    document.getElementById('modalPlatform').textContent = app.platform;
    document.getElementById('modalStatus').textContent = capitalize(app.status);
    document.getElementById('modalStatus').className = `status-badge ${app.status}`;
    document.getElementById('modalDate').textContent = new Date(app.appliedDate).toLocaleDateString();
    document.getElementById('modalCampaign').textContent = app.campaign;
    document.getElementById('modalJobUrl').href = app.jobUrl;
    document.getElementById('modalSalary').textContent = app.salary;
    document.getElementById('modalNotes').value = app.notes;
    
    modal.classList.add('active');
}

function closeAppDetailsModal() {
    const modal = document.getElementById('appDetailsModal');
    modal.classList.remove('active');
}

// ========================================
// Pagination
// ========================================

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

// ========================================
// Utility Functions
// ========================================

function getRandomGradient() {
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
}

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

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ========================================
// Event Listeners
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    
    // Filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentFilter = pill.dataset.status;
            currentPage = 1;
            renderApplications();
        });
    });
    
    // Sort and platform filters
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderApplications();
    });
    
    document.getElementById('platformFilter').addEventListener('change', (e) => {
        currentPlatform = e.target.value;
        currentPage = 1;
        renderApplications();
    });
    
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderApplications();
    });
    
    // Pagination
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderApplications();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', () => {
        currentPage++;
        renderApplications();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Modal close
    document.getElementById('closeDetailsModal').addEventListener('click', closeAppDetailsModal);
    document.getElementById('closeDetailsBtn').addEventListener('click', closeAppDetailsModal);
    
    // Close modal on outside click
    document.getElementById('appDetailsModal').addEventListener('click', (e) => {
        if (e.target.id === 'appDetailsModal') {
            closeAppDetailsModal();
        }
    });
    
    // Export button (placeholder)
    document.getElementById('exportBtn').addEventListener('click', () => {
        alert('Export functionality coming soon!');
    });
    
    // Save notes button (placeholder)
    document.getElementById('saveNotesBtn').addEventListener('click', () => {
        const notes = document.getElementById('modalNotes').value;
        alert('Notes saved! (This will connect to n8n later)');
    });
    
    // Initial render
    renderApplications();
});
