document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registration-form");
    const message = document.getElementById("form-message");

    // Check for eventId in URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId');

    if (eventId) {
        fetchEventDetails(eventId);
    }

    async function fetchEventDetails(id) {
        try {
            const response = await protectedFetch(`${API_BASE_URL}/events/${id}`);
            if (response.ok) {
                const event = await response.json();
                // Pre-fill form
                const eventInput = document.getElementById('reg-event-name');
                if (eventInput) {
                    eventInput.value = event.title;
                    eventInput.readOnly = true;
                }
            }
        } catch (error) {
            console.error('Error fetching event details:', error);
        }
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        if (!eventId) {
            showMessage("No event selected for registration.", false);
            return;
        }

        const registrationData = {
            name: document.getElementById('reg-name').value,
            studentId: document.getElementById('reg-student-id').value,
            contactNumber: document.getElementById('reg-contact').value,
            department: document.getElementById('reg-dept').value,
            semester: document.getElementById('reg-semester').value
        };

        try {
            const response = await protectedFetch(`${API_BASE_URL}/events/${eventId}/register`, {
                method: 'POST',
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();
            if (response.ok) {
                showMessage("✅ Registration submitted successfully!", true);
                setTimeout(() => {
                    window.location.href = 'student-home.html';
                }, 2000);
            } else {
                showMessage(data.message || "Registration failed.", false);
            }
        } catch (error) {
            console.error('Registration Error:', error);
            showMessage("Network error during registration.", false);
        }
    });

    function showMessage(text, success) {
        message.textContent = text;
        message.style.color = success ? "#0f766e" : "#b91c1c";
    }
});
