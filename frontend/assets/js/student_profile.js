document.addEventListener("DOMContentLoaded", () => {
    const upload = document.getElementById("upload-img");
    const profileImg = document.getElementById("profile-img");
    const editBtn = document.getElementById("edit-profile-btn");
    const saveBtn = document.getElementById("save-profile-btn");
    const cancelBtn = document.getElementById("cancel-profile-btn");
    const profileForm = document.getElementById("profile-form");

    upload.addEventListener("change", () => {
        const file = upload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                profileImg.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });

    function getProfile() {
        const raw = localStorage.getItem('studentProfile');
        return raw ? JSON.parse(raw) : {
            name: null,
            studentId: null,
            email: null,
            contact: null,
            department: null,
            semester: null,
            img: null
        };
    }

    function saveProfile(profile) {
        localStorage.setItem('studentProfile', JSON.stringify(profile));
    }

    function renderProfile() {
        const p = getProfile();
        document.getElementById('profile-name').textContent = p.name || '';
        document.getElementById('profile-role').textContent = p.department ? `${p.department} Student` : '';
        document.getElementById('profile-studentid').textContent = p.studentId || '';
        document.getElementById('profile-email').textContent = p.email || '';
        document.getElementById('profile-contact').textContent = p.contact || '';
        document.getElementById('profile-dept').textContent = p.department || '';
        document.getElementById('profile-semester').textContent = p.semester || '';
        if (p.img) profileImg.src = p.img;
        else profileImg.src = '../../assets/images/default-avatar.png';
    }

    function openEditor() {
        const p = getProfile();
        document.getElementById('input-name').value = p.name || '';
        document.getElementById('input-studentid').value = p.studentId || '';
        document.getElementById('input-email').value = p.email || '';
        document.getElementById('input-contact').value = p.contact || '';
        document.getElementById('input-dept').value = p.department || '';
        document.getElementById('input-semester').value = p.semester || '';
        profileForm.style.display = '';
        document.getElementById('profile-display').style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
    }

    function closeEditor() {
        profileForm.style.display = 'none';
        document.getElementById('profile-display').style.display = '';
        if (editBtn) editBtn.style.display = '';
    }

    if (editBtn) editBtn.addEventListener('click', openEditor);
    if (cancelBtn) cancelBtn.addEventListener('click', closeEditor);
    if (saveBtn) saveBtn.addEventListener('click', () => {
        const newProfile = {
            name: document.getElementById('input-name').value.trim() || null,
            studentId: document.getElementById('input-studentid').value.trim() || null,
            email: document.getElementById('input-email').value.trim() || null,
            contact: document.getElementById('input-contact').value.trim() || null,
            department: document.getElementById('input-dept').value.trim() || null,
            semester: document.getElementById('input-semester').value.trim() || null,
            img: profileImg.src && !profileImg.src.includes('default-avatar.png') ? profileImg.src : null
        };
        saveProfile(newProfile);
        renderProfile();
        closeEditor();
    });

    // On load: show info only, hide form
    profileForm.style.display = 'none';
    document.getElementById('profile-display').style.display = '';
    renderProfile();
});