// frontend/assets/js/student.js
// Logic for student-home.html, event-details.html, my-registrations.html

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status before proceeding
    if (!getAuthToken()) {
        window.location.href = 'login-signup.html';
        return;
    }
    
    // Only fetch events if we are on the student home page
    const fetchEventsBtn = document.getElementById('fetch-events-btn');
    if (fetchEventsBtn) {
        fetchEventsBtn.addEventListener('click', fetchEvents);
    }
});

const fetchEvents = async () => {
    try {
        // This is a public route, token is optional for viewing approved events
        const response = await fetch(`${API_BASE_URL}/events`);
        const events = await response.json();

        if (response.ok) {
            displayMessage('fetch-message', `Found ${events.length} approved event(s).`, true);
            renderEvents(events);
        } else {
            displayMessage('fetch-message', `Failed to fetch events.`, false);
        }
    } catch (error) {
        displayMessage('fetch-message', 'Error connecting to fetch events endpoint.', false);
    }
};

const renderEvents = (events) => {
    const eventListDiv = document.getElementById('event-list');
    const role = getAuthRole();
    eventListDiv.innerHTML = ''; 

    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h4>${event.title} (${event.societyId.name})</h4>
            <p>Date: ${new Date(event.date).toLocaleDateString()} @ ${event.time}</p>
            <p class="seats">Seats: ${event.bookedSeats} / ${event.totalSeats}</p>
            <p class="venue">Venue: ${event.venue}</p>
            ${role === 'Student' ? `
                <button class="action-btn register-btn" data-id="${event._id}">Register</button>
                <button class="action-btn unregister-btn" data-id="${event._id}">Unregister</button>
            ` : `<p class="warning">Log in as Student to register.</p>`}
        `;
        eventListDiv.appendChild(card);
    });

    // Attach event listeners for registration
    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', () => handleRegistration(btn.dataset.id, 'register'));
    });
    document.querySelectorAll('.unregister-btn').forEach(btn => {
        btn.addEventListener('click', () => handleRegistration(btn.dataset.id, 'unregister'));
    });
};

const handleRegistration = async (eventId, type) => {
    if (getAuthRole() !== 'Student') {
        alert('Action forbidden.');
        return;
    }

    const method = type === 'register' ? 'POST' : 'DELETE';
    const endpoint = `${API_BASE_URL}/events/${eventId}/${type}`;

    try {
        // Uses protectedFetch helper from api.js
        const response = await protectedFetch(endpoint, { method: method });
        const result = await response.json();
        
        if (response.ok) {
            displayMessage('fetch-message', `${result.message}`, true);
        } else {
            displayMessage('fetch-message', `${result.message}`, false);
        }
        
        // Refresh the list to show updated seat count
        fetchEvents();

    } catch (error) {
        displayMessage('fetch-message', 'Network error during registration.', false);
    }
};