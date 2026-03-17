document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (eventId) {
        loadEventDetails(eventId);
    } else {
        alert('No event ID provided.');
        window.location.href = 'student-home.html';
    }
});

async function loadEventDetails(eventId) {
    try {
        const response = await protectedFetch(`${API_BASE_URL}/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event details');
        
        const event = await response.json();

        document.getElementById("event-title").innerText = event.title;
        document.getElementById("event-society").innerText =
            "Organized by " + (event.societyId ? event.societyId.name : 'Unknown Society');
        
        document.getElementById("event-date").innerText = new Date(event.date).toLocaleDateString();
        document.getElementById("event-time").innerText = event.time;
        document.getElementById("event-venue").innerText = event.venue;
        
        const availableSeats = event.totalSeats - event.bookedSeats;
        document.getElementById("event-seats").innerText = `${availableSeats} seats available`;
        document.getElementById("event-description").innerText = event.description;

        const registerBtn = document.getElementById("register-btn");
        const now = new Date();
        const eventDate = new Date(event.date);
        const [hours, minutes] = event.time.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes));

        const isPassed = eventDate < now;
        const isFull = event.bookedSeats >= event.totalSeats;

        if (isPassed || isFull) {
            registerBtn.disabled = true;
            registerBtn.style.background = '#ccc';
            registerBtn.style.cursor = 'not-allowed';
            registerBtn.innerHTML = `<i class="fas fa-ban"></i> ${isPassed ? 'Passed' : 'Full'}`;
        } else {
            registerBtn.addEventListener("click", () => {
                window.location.href = `my-registrations.html?eventId=${eventId}`;
            });
        }
        
        document.getElementById("bookmark-btn").addEventListener("click", () => bookmarkEvent(eventId));
    } catch (error) {
        console.error('Load Details Error:', error);
        alert('Error loading event details.');
    }
}

async function bookmarkEvent(eventId) {
    try {
        // Fetch event details (again) to get all info for bookmark
        const response = await protectedFetch(`${API_BASE_URL}/events/${eventId}`);
        if (!response.ok) throw new Error('Failed to fetch event details');
        const event = await response.json();

        // Get bookmarks from localStorage
        let bookmarks = JSON.parse(localStorage.getItem('bookmarkedEvents') || '[]');
        // Avoid duplicate bookmarks
        if (bookmarks.some(e => e._id === event._id)) {
            alert('Event already bookmarked!');
            return;
        }
        // Store minimal info for display
        bookmarks.push({
            _id: event._id,
            title: event.title,
            date: event.date,
            time: event.time,
            venue: event.venue,
            society: event.societyId && event.societyId.name ? event.societyId.name : 'Unknown Society'
        });
        localStorage.setItem('bookmarkedEvents', JSON.stringify(bookmarks));
        alert('Event added to bookmarks!');
    } catch (err) {
        alert('Failed to bookmark event.');
    }
}
