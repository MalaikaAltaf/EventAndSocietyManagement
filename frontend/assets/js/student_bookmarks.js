document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("bookmarks-list");

    let bookmarks = [];
    try {
        bookmarks = JSON.parse(localStorage.getItem('bookmarkedEvents') || '[]');
    } catch (e) {
        bookmarks = [];
    }

    if (bookmarks.length === 0) {
        list.innerHTML = '<p class="empty-bookmarks">No bookmarked events yet.</p>';
        return;
    }

    bookmarks.forEach(event => {
        const card = document.createElement("div");
        card.className = "bookmark-card";

        card.innerHTML = `
            <div class="bookmark-header-row">
                <h2>${event.title}</h2>
                <span class="bookmark-badge">Saved</span>
            </div>

            <div class="bookmark-info">
                <p><i class="fas fa-calendar-alt"></i> ${new Date(event.date).toLocaleDateString()}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${event.venue}</p>
                <p><i class="fas fa-users"></i> ${event.society}</p>
            </div>

            <div class="bookmark-actions">
                <button class="view-btn" onclick="window.location.href='event-details.html?id=${event._id}'">View Event</button>
                <button class="remove-btn">Remove</button>
            </div>
        `;

        // Remove button handler
        card.querySelector('.remove-btn').addEventListener('click', () => {
            bookmarks = bookmarks.filter(e => e._id !== event._id);
            localStorage.setItem('bookmarkedEvents', JSON.stringify(bookmarks));
            card.remove();
            if (bookmarks.length === 0) {
                list.innerHTML = '<p class="empty-bookmarks">No bookmarked events yet.</p>';
            }
        });

        list.appendChild(card);
    });
});