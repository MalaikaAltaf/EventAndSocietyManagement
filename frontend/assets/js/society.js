// frontend/assets/js/society.js
// Logic for the Society Manager Dashboard (Event Creation, Management, and Filtering).

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication and redirect if not Society
    if (getAuthRole() !== 'Society') {
        alert('Access denied. Society role required.');
        window.location.href = '../student/login-signup.html';
        return;
    }

    // --- 1. Quick Filter Tab Logic ---
    const filterTabs = document.querySelector('.filter-tabs');
    const eventListContainer = document.querySelector('.event-list-container');

    if (filterTabs) {
        filterTabs.addEventListener('click', (event) => {
            const target = event.target.closest('.tab-btn');
            if (target) {
                const filterValue = target.dataset.filter;
                
                filterTabs.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                target.classList.add('active');

                // If My Events is hidden, reveal it when a filter tab is selected
                const myEventsSection = document.querySelector('.my-events-section');
                if (myEventsSection && myEventsSection.classList.contains('hidden')) {
                    myEventsSection.classList.remove('hidden');
                    myEventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                fetchMyEvents(filterValue);
            }
        });
    }

    // --- 2. Initial Data Fetch ---
    fetchSocietyStatus();
    // My Events is hidden by default; events will be fetched when the user opens the section.

    // Toggle display of My Events per user request
    const viewEventsBtn = document.getElementById('view-events-btn');
    const myEventsSection = document.querySelector('.my-events-section');

    function showMyEvents(scroll = true) {
        if (!myEventsSection) return;
        if (myEventsSection.classList.contains('hidden')) {
            myEventsSection.classList.remove('hidden');
            if (scroll) myEventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function hideMyEvents() {
        if (!myEventsSection) return;
        myEventsSection.classList.add('hidden');
    }

    if (viewEventsBtn) {
        viewEventsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (myEventsSection && myEventsSection.classList.contains('hidden')) {
                const activeTab = document.querySelector('.tab-btn.active');
                const filter = activeTab ? activeTab.dataset.filter : 'all';
                showMyEvents();
                fetchMyEvents(filter);
            } else {
                hideMyEvents();
            }
        });
    }

    // --- 3. Auto-refresh events every 30 seconds for real-time updates ---
    setInterval(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        const currentFilter = activeTab ? activeTab.dataset.filter : 'all';
        const myEventsSection = document.querySelector('.my-events-section');
        // Only refresh events when My Events section is visible
        if (!myEventsSection || !myEventsSection.classList.contains('hidden')) {
            fetchMyEvents(currentFilter);
        }
        fetchSocietyStatus();
    }, 30000);
});

/**
 * Fetches and displays events for the current society.
 */
async function fetchMyEvents(filter = 'all') {
    const eventListContainer = document.querySelector('.event-list-container');
    if (!eventListContainer) return;

    try {
        const response = await protectedFetch(`${API_BASE_URL}/events/me`);
        if (!response.ok) throw new Error('Failed to fetch your events.');

        let events = await response.json();

        // Apply filter
        if (filter === 'pending') {
            events = events.filter(e => e.status === 'Pending');
        } else if (filter === 'approved') {
            events = events.filter(e => e.status === 'Approved');
        } else if (filter === 'rejected') {
            events = events.filter(e => e.status === 'Rejected');
        }

        renderEvents(events, filter);
    } catch (error) {
        console.error('Fetch My Events Error:', error);
        eventListContainer.innerHTML = `<p class="error-text">${error.message}</p>`;
    }
}

/**
 * Renders the list of events, grouped by status if 'all' is selected.
 */
function renderEvents(events, filter = 'all') {
    const eventListContainer = document.querySelector('.event-list-container');
    if (!eventListContainer) return;

    if (events.length === 0) {
        eventListContainer.innerHTML = '<p class="placeholder-text">No events found.</p>';
        return;
    }

    eventListContainer.innerHTML = '';

    if (filter === 'all') {
        const statuses = ['Approved', 'Pending', 'Rejected'];
        statuses.forEach(status => {
            const statusEvents = events.filter(e => e.status === status);
            if (statusEvents.length > 0) {
                const sectionHeader = document.createElement('h4');
                sectionHeader.textContent = `${status} Events`;
                sectionHeader.style.margin = '20px 0 10px 0';
                sectionHeader.style.color = 'var(--hub-teal)';
                eventListContainer.appendChild(sectionHeader);

                statusEvents.forEach(event => {
                    eventListContainer.appendChild(createEventCard(event));
                });
            }
        });
    } else {
        events.forEach(event => {
            eventListContainer.appendChild(createEventCard(event));
        });
    }
}

/**
 * Creates an event card element.
 */
function createEventCard(event) {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.style.border = '1px solid #ddd';
    eventCard.style.padding = '15px';
    eventCard.style.marginBottom = '15px';
    eventCard.style.borderRadius = '8px';
    eventCard.style.backgroundColor = 'white';
    eventCard.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';

    let statusColor = '#ff8c00'; // Pending
    if (event.status === 'Approved') statusColor = '#28a745';
    if (event.status === 'Rejected') statusColor = '#dc3545';

    eventCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
                <h4 style="margin: 0 0 10px 0; color: #333;">${event.title}</h4>
                <p style="margin: 5px 0; font-size: 0.9em; color: #666;"><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()} at ${event.time}</p>
                <p style="margin: 5px 0; font-size: 0.9em; color: #666;"><i class="fas fa-map-marker-alt"></i> ${event.venue}</p>
                <p style="margin: 5px 0; font-size: 0.9em;">Status: <span style="color: ${statusColor}; font-weight: bold;">${event.status}</span></p>
                ${event.status === 'Rejected' ? `<p style="margin: 5px 0; font-size: 0.9em; color: #dc3545;"><strong>Reason:</strong> ${event.rejectionReason || 'No reason provided.'}</p>` : ''}
            </div>
            <div style="text-align: right;">
                <span style="display: block; font-size: 0.8em; color: #888;">Seats: ${event.bookedSeats}/${event.totalSeats}</span>
                <button onclick="deleteEvent('${event._id}')" style="margin-top: 10px; background: none; border: none; color: #dc3545; cursor: pointer;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
    return eventCard;
}

/**
 * Deletes an event.
 */
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
        const response = await protectedFetch(`${API_BASE_URL}/events/${eventId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Event deleted successfully.');
            fetchMyEvents(); // Refresh
        } else {
            const data = await response.json();
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Delete Event Error:', error);
        alert('Network error during deletion.');
    }
}

/**
 * Fetches notifications to check for Admin feedback on events and society status.
 */
async function fetchSocietyStatus() {
    const approvalAlert = document.getElementById('approval-alert');
    if (!approvalAlert) return;

    try {
        // 1. Fetch Society Info to check if it's pending
        const socResponse = await protectedFetch(`${API_BASE_URL}/societies/me`);
        if (socResponse.ok) {
            const society = await socResponse.json();
            if (society.status === 'Pending') {
                approvalAlert.style.display = 'flex';
                approvalAlert.querySelector('.alert-message').textContent = 'Your society is currently pending admin approval. You can submit event proposals, but they will not be public until approved.';
            } else if (society.status === 'Rejected') {
                approvalAlert.style.display = 'flex';
                approvalAlert.style.backgroundColor = '#f8d7da';
                approvalAlert.style.color = '#721c24';
                approvalAlert.querySelector('.alert-icon').className = 'fas fa-times-circle alert-icon';
                approvalAlert.querySelector('.alert-message').textContent = 'Your society registration was rejected by the Admin.';
            } else {
                approvalAlert.style.display = 'none';
            }
        }

        // Fetch current user profile to display their name in the header
        try {
            const userResp = await protectedFetch(`${API_BASE_URL}/auth/me`);
            if (userResp && userResp.ok) {
                const userData = await userResp.json();
                const nameEl = document.getElementById('welcome-name');
                if (nameEl) {
                    // Show first name only for brevity (e.g., 'Malaika' from 'Malaika Johnson')
                    const fullName = userData.name || '';
                    const firstName = fullName.split(' ')[0] || fullName || 'Society Manager';
                    nameEl.textContent = firstName;
                }
            }
        } catch (e) {
            // Non-fatal, just leave the default name
            console.warn('Could not fetch user name:', e);
        }

        // 2. Fetch notifications for feedback
        const response = await protectedFetch(`${API_BASE_URL}/notifications`);
        if (!response.ok) return;

        const notifications = await response.json();

        // Check for recent unread Approval or Rejection notifications
        const latestFeedback = notifications
            .filter(n => (n.type === 'Approval' || n.type === 'Rejection') && !n.isRead)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        if (latestFeedback) {
            // We could show another alert or toast here for event-specific feedback
            console.log('Latest Feedback:', latestFeedback.message);
        }

    } catch (error) {
        console.error('Error fetching society status:', error);
    }
}