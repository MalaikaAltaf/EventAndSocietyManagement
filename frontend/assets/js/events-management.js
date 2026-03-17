document.addEventListener('DOMContentLoaded', () => {
    const allEventsList = document.getElementById('all-events-list');
    const fetchBtn = document.getElementById('fetch-filtered-events-btn');
    const statusFilter = document.getElementById('status-filter');

    async function fetchEvents(status = 'All') {
        try {
            let url = '/api/events'; // Replace with your backend endpoint
            if (status !== 'All') url += `?status=${status}`;

            const response = await fetch(url);
            const events = await response.json();
            renderEvents(events);
        } catch (err) {
            allEventsList.innerHTML = `<p class="placeholder-text">Failed to load events.</p>`;
            console.error(err);
        }
    }

    function renderEvents(events) {
        allEventsList.innerHTML = '';

        if (events.length === 0) {
            allEventsList.innerHTML = '<p class="placeholder-text">No events found.</p>';
            return;
        }

        events.forEach(event => {
            const card = document.createElement('div');
            card.classList.add('event-card');

            card.innerHTML = `
                <h3>${event.title}</h3>
                <p>Society: ${event.societyName}</p>
                <p>Date: ${event.date}</p>
                <p class="status">Status: ${event.status}</p>
                <div class="action-buttons">
                    <button class="approve">Approve</button>
                    <button class="reject">Reject</button>
                </div>
            `;

            card.querySelector('.approve').addEventListener('click', async () => {
                await updateEventStatus(event.id, 'Approved');
                card.querySelector('.status').textContent = 'Status: Approved';
            });

            card.querySelector('.reject').addEventListener('click', async () => {
                await updateEventStatus(event.id, 'Rejected');
                card.querySelector('.status').textContent = 'Status: Rejected';
            });

            allEventsList.appendChild(card);
        });
    }

    async function updateEventStatus(eventId, newStatus) {
        try {
            await fetch(`/api/events/${eventId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    }

    // Initial load
    fetchEvents();

    // Filter button
    fetchBtn.addEventListener('click', () => {
        fetchEvents(statusFilter.value);
    });
});
