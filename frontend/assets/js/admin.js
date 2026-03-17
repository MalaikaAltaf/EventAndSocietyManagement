// Logic for admin-dashboard.html, societies-management.html, events-management.html

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication and redirect if not Admin
    if (getAuthRole() !== 'Admin') {
        alert('Access denied. Admin role required.');
        window.location.href = '../student/login-signup.html';
        return;
    }

    // Only run dashboard logic
    if (document.getElementById('total-societies')) {
        fetchDashboardData();
        fetchNotifications();
    }

    // Management pages
    if (document.getElementById('all-societies-list-admin')) {
        loadAllSocieties();
        setupAddSocietyModal();
        const filter = document.getElementById('society-status-filter');
        if (filter) {
            filter.addEventListener('change', () => {
                loadAllSocieties(filter.value);
            });
        }
    }
    if (document.getElementById('all-events-list-admin')) {
        loadAllEvents();
        const fetchBtn = document.getElementById('fetch-filtered-events-btn');
        if (fetchBtn) {
            fetchBtn.addEventListener('click', () => {
                const status = document.getElementById('status-filter').value;
                loadAllEvents(status);
            });
        }
    }
});

const fetchDashboardData = async () => {
    // 1. Fetch Stats
    fetchAdminStats();
    // 2. Fetch Pending Items
    fetchPendingItems();
};

const fetchAdminStats = async () => {
    try {
        const response = await protectedFetch(`${API_BASE_URL}/admin/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const stats = await response.json();
        
        const socElem = document.getElementById('total-societies');
        const evElem = document.getElementById('total-events');
        const partElem = document.getElementById('total-participants');

        if (socElem) socElem.textContent = stats.totalSocieties;
        if (evElem) evElem.textContent = stats.totalEvents;
        if (partElem) partElem.textContent = stats.totalParticipants;

    } catch (error) {
        console.error('Stats Error:', error);
    }
};

const fetchNotifications = async () => {
    const notificationList = document.getElementById('admin-notification-list');
    if (!notificationList) return;

    try {
        const response = await protectedFetch(`${API_BASE_URL}/notifications`);
        if (!response.ok) throw new Error('Failed to fetch notifications');

        const notifications = await response.json();
        notificationList.innerHTML = ''; 

        if (notifications.length === 0) {
            notificationList.innerHTML = '<p>No new notifications.</p>';
            return;
        }

        notifications.forEach(notif => {
            const notifItem = document.createElement('div');
            notifItem.className = `notification-item ${notif.isRead ? '' : 'unread'}`;
            notifItem.innerHTML = `
                <div class="notif-content">
                    <p>${notif.message}</p>
                    <small>${new Date(notif.createdAt).toLocaleString()}</small>
                </div>
            `;
            notificationList.appendChild(notifItem);
        });
    } catch (error) {
        console.error('Notification Error:', error);
    }
};

const fetchPendingItems = async () => {
    const pendingSocieties = await fetchItemsForAdmin('societies');
    const pendingEvents = await fetchItemsForAdmin('events');

    renderPendingItems('pending-societies-list', pendingSocieties, 'society');
    renderPendingItems('pending-events-list', pendingEvents, 'event');
};

const fetchItemsForAdmin = async (endpoint) => {
    const url = `${API_BASE_URL}/admin/${endpoint}`;
    try {
        const response = await protectedFetch(url);
        if (!response.ok) return [];
        let items = await response.json();
        return items.filter(item => item.status === 'Pending');
    } catch (error) {
        console.error(`Error fetching pending ${endpoint}:`, error);
        return [];
    }
};

const renderPendingItems = (listId, items, type) => {
    const listElement = document.getElementById(listId);
    if (!listElement) return; 
    listElement.innerHTML = ''; 
    
    if (items.length === 0) {
        listElement.innerHTML = `<p class="success-text">No pending ${type}s found.</p>`;
        return;
    }

    items.forEach(item => {
        const listItem = document.createElement('div');
        listItem.className = 'card warning';
        listItem.style.border = '1px solid #ddd';
        listItem.style.padding = '15px';
        listItem.style.marginBottom = '10px';
        listItem.style.borderRadius = '8px';
        listItem.style.backgroundColor = '#f9f9f9';

        const societyName = item.societyId ? (item.societyId.name || 'Unknown') : 'N/A';

        listItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4 style="margin: 0;">${item.name || item.title}</h4>
                    ${type === 'event' ? `<p style="margin: 5px 0; font-size: 0.9em; color: #008080; font-weight: bold;">Society: ${societyName}</p>` : ''}
                    <p style="margin: 5px 0; font-size: 0.9em;">Status: <span style="color: #ff8c00; font-weight: bold;">${item.status}</span></p>
                </div>
                <div>
                    <button onclick="handleAction('${item._id}', '${type}', 'approve')" style="background-color: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Approve</button>
                    <button onclick="handleAction('${item._id}', '${type}', 'reject')" style="background-color: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">Reject</button>
                </div>
            </div>
        `;
        listElement.appendChild(listItem);
    });
};

const loadAllSocieties = async (status = 'All') => {
    const container = document.getElementById('all-societies-list-admin');
    if (!container) return;
    try {
        const response = await protectedFetch(`${API_BASE_URL}/admin/societies`);
        let societies = await response.json();
        if (status !== 'All') societies = societies.filter(s => s.status === status);
        renderManagementItems(container, societies, 'society');
    } catch (error) {
        console.error('Load Societies Error:', error);
    }
};

const loadAllEvents = async (status = 'All') => {
    const container = document.getElementById('all-events-list-admin');
    if (!container) return;
    try {
        const response = await protectedFetch(`${API_BASE_URL}/admin/events`);
        let events = await response.json();
        if (status !== 'All') events = events.filter(e => e.status === status);
        renderManagementItems(container, events, 'event');
    } catch (error) {
        console.error('Load Events Error:', error);
    }
};

const renderManagementItems = (container, items, type) => {
    container.innerHTML = '';
    if (items.length === 0) {
        container.innerHTML = `<p class="placeholder-text">No ${type}s found.</p>`;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'action-card';
        card.style.background = 'white';
        card.style.padding = '20px';
        card.style.borderRadius = '12px';
        card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        card.style.marginBottom = '20px';

        const societyName = item.societyId ? (item.societyId.name || 'Unknown') : 'N/A';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3 style="margin: 0 0 10px 0; color: var(--hub-teal);">${item.name || item.title}</h3>
                    <p style="margin: 5px 0; font-size: 0.9em; color: #008080; font-weight: bold;">President: ${item.presidentName || item.president || 'N/A'}</p>
                    <p style="margin: 5px 0; font-size: 0.9em;">General Secretary: ${item.generalSecretaryName || item.generalSecretary || 'N/A'}</p>
                    <p style="margin: 5px 0; font-size: 0.9em;">Media Lead: ${item.mediaLeadName || item.mediaLead || 'N/A'}</p>
                    <p style="margin: 5px 0; font-size: 0.9em;">Event Manager Lead: ${item.eventManagerLeadName || item.eventManagerLead || 'N/A'}</p>
                    <p style="margin: 5px 0; font-size: 0.9em;">Description: ${item.description || 'N/A'}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="delete-society-btn" data-id="${item._id}" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer;">Delete</button>
                </div>
            </div>
        `;
        // Add event listener for delete button
        card.querySelector('.delete-society-btn').addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this society?')) {
                try {
                    const response = await protectedFetch(`${API_BASE_URL}/societies/${item._id}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        alert('Society deleted successfully!');
                        loadAllSocieties();
                    } else {
                        const result = await response.json();
                        alert(`Failed to delete society: ${result.message}`);
                    }
                } catch (error) {
                    alert('Network error deleting society.');
                }
            }
        });
        container.appendChild(card);
    });
};

window.handleAction = async (id, type, action) => {
    let body = {};
    if (type === 'event' && action === 'reject') {
        const reason = prompt("Please enter the reason for rejection:");
        if (reason === null) return; // Cancelled
        body.rejectionReason = reason;
    }

    const endpoint = `${API_BASE_URL}/admin/${type}s/${id}/${action}`;
    try {
        const response = await protectedFetch(endpoint, { 
            method: 'PUT',
            body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
        });
        const result = await response.json();
        if (response.ok) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} ${action}d successfully!`);
            if (document.getElementById('total-societies')) fetchDashboardData();
            if (document.getElementById('all-societies-list-admin')) loadAllSocieties();
            if (document.getElementById('all-events-list-admin')) loadAllEvents(document.getElementById('status-filter').value);
        } else {
            alert(`Failed to ${action} ${type}: ${result.message}`);
        }
    } catch (error) {
        console.error(`Error during ${type} ${action}:`, error);
        alert(`Network error during ${type} ${action}.`);
    }
};

const setupAddSocietyModal = () => {
    const modal = document.getElementById('add-society-modal');
    const btn = document.getElementById('add-society-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const form = document.getElementById('add-society-form');

    if (!modal || !btn || !closeBtn || !form) return;

    btn.onclick = () => modal.style.display = 'block';
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('new-society-name').value;
        const description = document.getElementById('new-society-description').value;
        const presidentName = document.getElementById('new-society-president').value;
        const generalSecretaryName = document.getElementById('new-society-gs').value;
        const mediaLeadName = document.getElementById('new-society-media').value;
        const eventManagerLeadName = document.getElementById('new-society-em').value;

        try {
            const response = await protectedFetch(`${API_BASE_URL}/societies`, {
                method: 'POST',
                body: JSON.stringify({ 
                    name, 
                    description,
                    presidentName,
                    generalSecretaryName,
                    mediaLeadName,
                    eventManagerLeadName
                })
            });

            if (response.ok) {
                alert('Society added successfully!');
                modal.style.display = 'none';
                form.reset();
                loadAllSocieties(); // Refresh the list
            } else {
                const result = await response.json();
                alert(`Failed to add society: ${result.message}`);
            }
        } catch (error) {
            console.error('Add Society Error:', error);
            alert('Network error adding society.');
        }
    };
};
