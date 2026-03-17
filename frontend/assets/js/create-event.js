// Function to fetch and populate societies dropdown
async function populateSocieties() {
    const societySelect = document.getElementById('eventSociety');
    if (!societySelect) return;

    try {
        const response = await protectedFetch(`${API_BASE_URL}/societies`);

        if (response.ok) {
            const societies = await response.json();
            societies.forEach(society => {
                const option = document.createElement('option');
                option.value = society._id;
                option.textContent = society.name;
                societySelect.appendChild(option);
            });
        } else {
            console.error('Failed to fetch societies');
        }
    } catch (error) {
        console.error('Error fetching societies:', error);
    }
}

// Call populateSocieties when the page loads
document.addEventListener('DOMContentLoaded', populateSocieties);

document.getElementById("create-event-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Stop page reload

    // 1. Retrieve the selected societyId
    const societyId = document.getElementById("eventSociety").value;

    // 2. CRITICAL CHECK: If societyId is missing, do not send the request
    if (!societyId) {
        alert("Error: Please select a society for the event.");
        return;
    }

    // 3. Build the Event Data object
    const eventData = {
        title: document.getElementById("eventTitle").value,
        description: document.getElementById("eventDescription").value,
        date: document.getElementById("eventDate").value,
        time: document.getElementById("eventTime").value,
        venue: document.getElementById("eventLocation").value,
        // Ensure totalSeats is sent as a Number
        totalSeats: parseInt(document.getElementById("maxParticipants").value),
        // Send category as an array of tags
        tags: [document.getElementById("eventCategory").value],
        // INCLUDE THE SOCIETY ID HERE
        societyId: societyId
    };

    // LOG: Helpful for debugging—you can see exactly what is being sent in the Console (F12)
    console.log("Submitting Event Data:", eventData);

    try {
        const response = await protectedFetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            body: JSON.stringify(eventData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Event submitted successfully! Waiting for admin approval.");
            // Reset form fields
            document.getElementById("create-event-form").reset();
            // Optional: Redirect back to dashboard to see the pending event
            window.location.href = "society-dashboard.html";
        } else {
            // This will now show the specific error from your backend (like 'societyId missing')
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Submission Error:', error);
        alert('Connection failed. Is the server running?');
    }
});