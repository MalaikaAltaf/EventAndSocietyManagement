// Fetch pending societies from backend
async function loadPendingSocieties() {
    const container = document.getElementById('pending-societies-list');
    container.innerHTML = '<p class="placeholder-text">Loading pending societies...</p>';

    try {
        const response = await fetch('/api/societies/pending'); // backend endpoint
        const societies = await response.json();

        if (societies.length === 0) {
            container.innerHTML = '<p class="placeholder-text">No pending societies.</p>';
            return;
        }

        container.innerHTML = '';

        societies.forEach(society => {
            const card = document.createElement('div');
            card.className = 'action-card';
            card.innerHTML = `
                <div class="card-header">
                    <i class="fas fa-users"></i>
                    <h2>${society.name}</h2>
                </div>
                <p><strong>Owner:</strong> ${society.owner}</p>
                <p><strong>Description:</strong> ${society.description}</p>
                <div>
                    <button class="approve-btn action-btn" onclick="updateSocietyStatus(${society.id}, 'approved')">Approve</button>
                    <button class="reject-btn action-btn" onclick="updateSocietyStatus(${society.id}, 'rejected')">Reject</button>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="placeholder-text">Error fetching societies.</p>';
    }
}

// Update society status
async function updateSocietyStatus(id, status) {
    try {
        const response = await fetch(`/api/societies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadPendingSocieties(); // refresh list
        } else {
            alert('Failed to update society status.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Load pending societies on page load
window.onload = loadPendingSocieties;
