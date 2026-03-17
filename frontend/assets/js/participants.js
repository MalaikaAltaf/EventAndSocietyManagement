//
// frontend/assets/js/participants.js
// Logic for displaying event registrations and managing check-ins.
//

document.addEventListener('DOMContentLoaded', () => {
    
    const eventSelect = document.getElementById('eventSelect');
    const participantsTableBody = document.getElementById('participantsTableBody');
    const searchInput = document.getElementById('searchParticipant');

    let currentParticipants = [];

    /** Populates the event selection dropdown with events managed by the society. */
    async function populateEventDropdown() {
        try {
            const response = await protectedFetch(`${API_BASE_URL}/events/me`);
            if (!response.ok) throw new Error('Failed to fetch events');
            
            const events = await response.json();
            
            // Clear existing options, keep the default
            eventSelect.innerHTML = '<option value="">-- Choose an event --</option>';

            events.forEach(event => {
                const option = document.createElement('option');
                option.value = event._id;
                option.textContent = `${event.title} (${event.status})`;
                eventSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Populate Dropdown Error:', error);
        }
    }

    /** Updates the event summary box. */
    function updateEventSummary(event) {
        document.getElementById('summary-title').textContent = event.title || 'N/A';
        document.getElementById('summary-date').textContent = event.date ? new Date(event.date).toLocaleDateString() : 'N/A';
        document.getElementById('summary-registrations').textContent = event.bookedSeats || 0;
        document.getElementById('summary-capacity').textContent = event.totalSeats || 'N/A';
    }

    /** Renders the participant table for a selected event. */
    function renderParticipants(participants) {
        participantsTableBody.innerHTML = ''; // Clear table
        currentParticipants = participants;

        if (participants.length === 0) {
            participantsTableBody.innerHTML = '<tr><td colspan="4" class="no-data-row">No students have registered for this event yet.</td></tr>';
            return;
        }

        participants.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.name}</td>
                <td>${p.department || 'N/A'}</td>
                <td>${new Date(p.createdAt).toLocaleDateString()}</td>
                <td><span class="status-badge status-registered">Registered</span></td>
            `;
            participantsTableBody.appendChild(row);
        });
    }

    eventSelect.addEventListener('change', async (e) => {
        const eventId = e.target.value;
        
        if (!eventId) {
            participantsTableBody.innerHTML = '<tr><td colspan="6" class="no-data-row">Please select an event to view participants.</td></tr>';
            updateEventSummary({});
            return;
        }

        try {
            // 1. Fetch Event Details for Summary
            const eventResponse = await protectedFetch(`${API_BASE_URL}/events/${eventId}`);
            if (eventResponse.ok) {
                const selectedEvent = await eventResponse.json();
                updateEventSummary(selectedEvent);
            }

            // 2. Fetch Participants
            const participantsResponse = await protectedFetch(`${API_BASE_URL}/events/${eventId}/participants`);
            if (participantsResponse.ok) {
                const participants = await participantsResponse.json();
                renderParticipants(participants);
            }
        } catch (error) {
            console.error('Event Selection Error:', error);
        }
    });

    // --- 2. Check-in and Search Logic ---

    // Handle Check-in Button Clicks (using event delegation)
    participantsTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('.checkin-btn');
        if (button && !button.disabled) {
            const participantId = button.dataset.participantId;
            // Optimistic UI Update
            button.textContent = 'Checking...';
            button.disabled = true;
            
            // In a real app, this would use: await window.api.checkInParticipant(participantId);
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // --- SIMULATED SUCCESS: Find the participant and update their status ---
            const participant = currentParticipants.find(p => p.id == participantId);
            if (participant) {
                participant.checkedIn = true;
                // Re-render table to show the new status badge
                renderParticipants(currentParticipants); 
                // In a production app, a small success message would be ideal here
            }
        }
    });

    // Handle Search Input
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredParticipants = currentParticipants.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.stdId.toLowerCase().includes(searchTerm)
        );
        
        // Render the filtered list
        renderParticipants(filteredParticipants);
    });
    

    // --- Export CSV Functionality ---
    document.getElementById('exportBtn').addEventListener('click', () => {
        if (!currentParticipants || currentParticipants.length === 0) {
            alert('No participants to export.');
            return;
        }
        // CSV header
        let csv = 'Name,Department,Registered On,Status\n';
        currentParticipants.forEach(p => {
            csv += `"${p.name}","${p.department || ''}","${new Date(p.createdAt).toLocaleDateString()}","Registered"\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'participants.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // --- 3. Initialize Page ---
    populateEventDropdown();
});