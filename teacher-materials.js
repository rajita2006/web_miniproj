document.addEventListener('DOMContentLoaded', function() {
    checkUserAuthentication();
    setupFormToggle();
    const materialForm = document.getElementById('material-form');
    if (materialForm) {
        materialForm.addEventListener('submit', handleMaterialUpload);
    }
    setupFiltering();
    loadMaterials();
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('userId');
            window.location.href = '../index.html';
        });
    }
});

function checkUserAuthentication() {
    const userRole = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    if (!userRole || !userId || userRole !== 'teacher') {
        alert('You must be logged in as a teacher to access this page.');
        window.location.href = '../index.html';
    }
}

function setupFormToggle() {
    const toggleBtn = document.getElementById('toggle-form-btn');
    const formContainer = document.getElementById('upload-material-form');
    const cancelBtn = document.getElementById('cancel-btn');
    if (toggleBtn && formContainer && cancelBtn) {
        toggleBtn.addEventListener('click', function() {
            formContainer.style.display = 'block';
            toggleBtn.style.display = 'none';
        });
        cancelBtn.addEventListener('click', function() {
            formContainer.style.display = 'none';
            toggleBtn.style.display = 'block';
            document.getElementById('material-form').reset();
        });
    }
}

function setupFiltering() {
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            loadMaterials();
        });
    }
}

function handleMaterialUpload(e) {
    e.preventDefault();
    const course = document.getElementById('course').value;
    const materialType = document.getElementById('material-type').value;
    const title = document.getElementById('material-title').value;
    const description = document.getElementById('material-description').value;
    const fileInput = document.getElementById('material-file');
    const visibility = document.getElementById('visibility').value;
    if (!course || !materialType || !title || !fileInput.files.length) {
        alert('Please fill in all required fields and select a file.');
        return;
    }
    const file = fileInput.files[0];
    if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds the maximum limit of 50MB.');
        return;
    }
    const fileName = file.name;
    const fileExt = fileName.split('.').pop().toLowerCase();
    const allowedExts = ['pdf', 'docx', 'pptx', 'zip', 'mp4'];
    if (!allowedExts.includes(fileExt)) {
        alert('Invalid file type. Only PDF, DOCX, PPTX, ZIP, and MP4 files are allowed.');
        return;
    }
    saveMaterial(course, materialType, title, description, fileName, visibility);
    document.getElementById('material-form').reset();
    document.getElementById('upload-material-form').style.display = 'none';
    document.getElementById('toggle-form-btn').style.display = 'block';
    alert('Material uploaded successfully!');
    loadMaterials();
}

function saveMaterial(course, materialType, title, description, fileName, visibility) {
    const teacherId = sessionStorage.getItem('userId');
    const uploadDate = new Date().toISOString().split('T')[0];
    let materials = JSON.parse(localStorage.getItem('teacherMaterials')) || [];
    materials.push({
        id: Date.now(),
        teacherId: teacherId,
        course: course,
        materialType: materialType,
        title: title,
        description: description,
        fileName: fileName,
        uploadDate: uploadDate,
        visibility: visibility,
        downloads: 0
    });
    localStorage.setItem('teacherMaterials', JSON.stringify(materials));
}

function loadMaterials() {
    const teacherId = sessionStorage.getItem('userId');
    const materialsContainer = document.getElementById('materials-container');
    if (!materialsContainer) return;
    const courseFilter = document.getElementById('filter-course').value;
    const typeFilter = document.getElementById('filter-type').value;
    materialsContainer.innerHTML = '';
    const allMaterials = JSON.parse(localStorage.getItem('teacherMaterials')) || [];
    let filteredMaterials = allMaterials.filter(material => material.teacherId === teacherId);
    if (courseFilter !== 'all') {
        filteredMaterials = filteredMaterials.filter(material => material.course === courseFilter);
    }
    if (typeFilter !== 'all') {
        filteredMaterials = filteredMaterials.filter(material => material.materialType === typeFilter);
    }
    if (filteredMaterials.length === 0) {
        materialsContainer.innerHTML = '<p class="no-materials">No materials found. Upload your first material using the form above.</p>';
        return;
    }
    const courseNames = {
        'math101': 'Mathematics 101',
        'eng205': 'English Literature 205',
        'cs150': 'Computer Science 150',
        'bio200': 'Biology 200',
        'phy101': 'Physics 101',
        'hist110': 'History 110'
    };
    const materialTypeNames = {
        'lecture': 'Lecture Slides',
        'notes': 'Lecture Notes',
        'reading': 'Required Reading',
        'supplementary': 'Supplementary Material',
        'syllabus': 'Course Syllabus',
        'other': 'Other Material'
    };
    filteredMaterials.forEach(material => {
        const card = document.createElement('div');
        card.className = 'material-card';
        const courseName = courseNames[material.course] || material.course;
        const typeName = materialTypeNames[material.materialType] || material.materialType;
        card.innerHTML = `
            <div class="material-header">
                <div class="material-type">${typeName}</div>
                <h3 class="material-title">${material.title}</h3>
            </div>
            <div class="material-content">
                <p class="material-description">${material.description || 'No description provided.'}</p>
                <div class="material-meta">
                    <span>Course: ${courseName}</span>
                    <span>Uploaded: ${material.uploadDate}</span>
                </div>
                <div class="material-meta">
                    <span>File: ${material.fileName}</span>
                    <span>Downloads: ${material.downloads}</span>
                </div>
                <div class="material-actions">
                    <button class="material-download" data-id="${material.id}">Download</button>
                    <button class="material-delete" data-id="${material.id}">Delete</button>
                </div>
            </div>
        `;
        materialsContainer.appendChild(card);
        const downloadBtn = card.querySelector('.material-download');
        downloadBtn.addEventListener('click', function() {
            alert(`In a production environment, this would download ${material.fileName}`);
            incrementDownloads(material.id);
        });
        const deleteBtn = card.querySelector('.material-delete');
        deleteBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this material?')) {
                deleteMaterial(material.id);
            }
        });
    });
}

function incrementDownloads(materialId) {
    let materials = JSON.parse(localStorage.getItem('teacherMaterials')) || [];
    const materialIndex = materials.findIndex(material => material.id === materialId);
    if (materialIndex !== -1) {
        materials[materialIndex].downloads++;
        localStorage.setItem('teacherMaterials', JSON.stringify(materials));
        const downloadCountElement = document.querySelector(`.material-download[data-id="${materialId}"]`)
            .closest('.material-content')
            .querySelector('.material-meta:nth-child(3) span:nth-child(2)');
        if (downloadCountElement) {
            downloadCountElement.textContent = `Downloads: ${materials[materialIndex].downloads}`;
        }
    }
}

function deleteMaterial(materialId) {
    let materials = JSON.parse(localStorage.getItem('teacherMaterials')) || [];
    materials = materials.filter(material => material.id !== materialId);
    localStorage.setItem('teacherMaterials', JSON.stringify(materials));
    loadMaterials();
}
