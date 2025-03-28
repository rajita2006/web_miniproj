document.addEventListener('DOMContentLoaded', function() {
    checkUserAuthentication();
    setupFormToggle();
    
    const assignmentForm = document.getElementById('assignment-form');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', handleAssignmentCreation);
    }
    
    const gradingForm = document.getElementById('grading-form');
    if (gradingForm) {
        gradingForm.addEventListener('submit', handleGradeSubmission);
    }
    
    setupModalClose();
    loadAssignments();
    loadSubmissions();
    
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
    const formContainer = document.getElementById('create-assignment-form');
    const cancelBtn = document.getElementById('cancel-btn');
    
    if (toggleBtn && formContainer && cancelBtn) {
        toggleBtn.addEventListener('click', function() {
            formContainer.style.display = 'block';
            toggleBtn.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', function() {
            formContainer.style.display = 'none';
            toggleBtn.style.display = 'block';
            document.getElementById('assignment-form').reset();
        });
    }
}

function setupModalClose() {
    const modal = document.getElementById('grading-modal');
    const closeButtons = document.querySelectorAll('.close-btn, .close-modal');
    
    if (modal && closeButtons.length) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modal.style.display = 'none';
            });
        });
        
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

function handleAssignmentCreation(e) {
    e.preventDefault();
    
    const course = document.getElementById('course').value;
    const title = document.getElementById('assignment-title').value;
    const dueDate = document.getElementById('due-date').value;
    const totalPoints = document.getElementById('total-points').value;
    const description = document.getElementById('assignment-description').value;
    const materialsInput = document.getElementById('assignment-materials');
    
    if (!course || !title || !dueDate || !description) {
        alert('Please fill in all required fields.');
        return;
    }
    
    if (materialsInput.files.length > 0) {
        const file = materialsInput.files[0];
        if (file.size > 10 * 1024 * 1024) {
            alert('File size exceeds the maximum limit of 10MB.');
            return;
        }
        
        const fileName = file.name;
        const fileExt = fileName.split('.').pop().toLowerCase();
        const allowedExts = ['pdf', 'docx', 'zip'];
        
        if (!allowedExts.includes(fileExt)) {
            alert('Invalid file type. Only PDF, DOCX, and ZIP files are allowed.');
            return;
        }
    }
    
    saveAssignment(course, title, dueDate, totalPoints, description, materialsInput.files.length > 0 ? materialsInput.files[0].name : null);
    
    document.getElementById('assignment-form').reset();
    document.getElementById('create-assignment-form').style.display = 'none';
    document.getElementById('toggle-form-btn').style.display = 'block';
    alert('Assignment created successfully!');
    loadAssignments();
}

function saveAssignment(course, title, dueDate, totalPoints, description, fileName) {
    const teacherId = sessionStorage.getItem('userId');
    const createdDate = new Date().toISOString().split('T')[0];
    let assignments = JSON.parse(localStorage.getItem('teacherAssignments')) || [];
    
    assignments.push({
        id: Date.now(),
        teacherId: teacherId,
        course: course,
        title: title,
        createdDate: createdDate,
        dueDate: dueDate,
        totalPoints: totalPoints,
        description: description,
        fileName: fileName,
        submissions: 0
    });
    
    localStorage.setItem('teacherAssignments', JSON.stringify(assignments));
}

function loadAssignments() {
    const teacherId = sessionStorage.getItem('userId');
    const assignmentsList = document.getElementById('active-assignments');
    
    if (!assignmentsList) return;
    assignmentsList.innerHTML = '';
    const allAssignments = JSON.parse(localStorage.getItem('teacherAssignments')) || [];
    const teacherAssignments = allAssignments.filter(assignment => assignment.teacherId === teacherId);
    
    if (teacherAssignments.length === 0) {
        assignmentsList.innerHTML = '<tr><td colspan="6" class="text-center">No active assignments. Create your first assignment above.</td></tr>';
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
    
    teacherAssignments.forEach(assignment => {
        const row = document.createElement('tr');
        const courseName = courseNames[assignment.course] || assignment.course;
        const today = new Date();
        const dueDate = new Date(assignment.dueDate);
        const isPastDue = today > dueDate;
        
        row.innerHTML = `
            <td>${courseName}</td>
            <td>${assignment.title}</td>
            <td>${assignment.createdDate}</td>
            <td class="${isPastDue ? 'status-late' : ''}">${assignment.dueDate}${isPastDue ? ' (Past due)' : ''}</td>
            <td>${assignment.submissions}</td>
            <td>
                <button class="action-btn view-btn" data-id="${assignment.id}">View</button>
                <button class="action-btn edit-btn" data-id="${assignment.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${assignment.id}">Delete</button>
            </td>
        `;
        
        assignmentsList.appendChild(row);
        
        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this assignment?')) {
                deleteAssignment(assignment.id);
            }
        });
        
        const viewBtn = row.querySelector('.view-btn');
        viewBtn.addEventListener('click', function() {
            alert(`Assignment Details:\n\nCourse: ${courseName}\nTitle: ${assignment.title}\nDue Date: ${assignment.dueDate}\nTotal Points: ${assignment.totalPoints}\n\nDescription: ${assignment.description}`);
        });
    });
    updateSubmissionCounts();
}
