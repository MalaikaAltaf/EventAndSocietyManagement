document.addEventListener("DOMContentLoaded", () => {
    // Check authentication and redirect if not Student
    if (getAuthRole() !== 'Student') {
        alert('Access denied. Student role required.');
        window.location.href = 'login-signup.html';
        return;
    }
    loadStudentDashboard();
});

async function loadStudentDashboard() {
    try {
        // 1. Fetch Approved Events
        const eventsResponse = await protectedFetch(`${API_BASE_URL}/events`);
        if (!eventsResponse.ok) throw new Error('Failed to fetch events');
        const events = await eventsResponse.json();

        // 2. Update Stats
        document.getElementById("total-events").innerText = events.length;
        
        // Fetch registrations to get count
        const registrationsResponse = await protectedFetch(`${API_BASE_URL}/auth/me`);
        if (registrationsResponse.ok) {
            const userData = await registrationsResponse.json();
            document.getElementById("total-registrations").innerText = userData.registeredEvents ? userData.registeredEvents.length : 0;
        }
        // Bookmarks: count from localStorage
        let bookmarks = [];
        try {
            bookmarks = JSON.parse(localStorage.getItem('bookmarkedEvents') || '[]');
        } catch (e) {
            bookmarks = [];
        }
        document.getElementById("total-bookmarks").innerText = bookmarks.length;

        // 3. Render Events
        const list = document.getElementById("events-list");
        list.innerHTML = "";

        if (events.length === 0) {
            list.innerHTML = '<p class="placeholder-text">No upcoming events available at the moment.</p>';
            return;
        }

        const now = new Date();

        events.forEach(event => {
            const eventDate = new Date(event.date);
            // Combine date and time for comparison
            const [hours, minutes] = event.time.split(':');
            eventDate.setHours(parseInt(hours), parseInt(minutes));

            const isPassed = eventDate < now;
            const isFull = event.bookedSeats >= event.totalSeats;

            const div = document.createElement("div");
            div.className = "event-item";
            div.style.background = "white";
            div.style.padding = "20px";
            div.style.borderRadius = "12px";
            div.style.marginBottom = "15px";
            div.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";

            div.innerHTML = `
                <div>
                    <div class="event-title" style="font-weight: bold; font-size: 1.2em; color: var(--hub-teal);">${event.title}</div>
                    <div class="event-meta" style="color: #666; margin-top: 5px;">
                        <i class="fas fa-users"></i> ${event.societyId ? event.societyId.name : 'Unknown Society'} • 
                        <i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()} at ${event.time} • 
                        <i class="fas fa-map-marker-alt"></i> ${event.venue}
                    </div>
                    <div style="margin-top: 5px; font-size: 0.9em; color: ${isFull ? '#dc3545' : '#28a745'}">
                        ${isFull ? 'Sold Out' : `Seats: ${event.bookedSeats}/${event.totalSeats}`}
                    </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <a href="event-details.html?id=${event._id}" class="action-btn" style="text-decoration: none; color: var(--hub-teal); font-weight: 500;">Details</a>
                    <button 
                        class="register-btn" 
                        onclick="handleRegistration('${event._id}')" 
                        ${isPassed || isFull ? 'disabled' : ''}
                        style="
                            background: ${isPassed || isFull ? '#ccc' : 'var(--hub-teal)'}; 
                            color: white; 
                            border: none; 
                            padding: 8px 16px; 
                            border-radius: 6px; 
                            cursor: ${isPassed || isFull ? 'not-allowed' : 'pointer'};
                        "
                    >
                        ${isPassed ? 'Passed' : (isFull ? 'Full' : 'Register')}
                    </button>
                </div>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error('Load Dashboard Error:', error);
        document.getElementById("events-list").innerHTML = '<p class="error-text">Error loading events. Please try again later.</p>';
    }
}

function handleRegistration(eventId) {
    window.location.href = `my-registrations.html?eventId=${eventId}`;
}
