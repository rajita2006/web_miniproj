document.addEventListener('DOMContentLoaded', function() {
    checkUserAuthentication();
    
    const assignmentForm = document.getElementById('assignment-form');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', handleAssignmentSubmission);
    }
    
    loadAssignments();
    
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
    
    if (!userRole || !userId || userRole !== 'student') {
        alert('You must be logged in as a student to access this page.');
        window.location.href = '../index.html';
    }
}

function handleAssignmentSubmission(e) {
    e.preventDefault();
    
    const course = document.getElementById('course').value;
    const title = document.getElementById('assignment-title').value;
    const dueDate = document.getElementById('due-date').value;
    const fileInput = document.getElementById('assignment-file');
    const comments = document.getElementById('comments').value;
    
    if (!course || !title || !dueDate || !fileInput.files.length) {
        alert('Please fill in all required fields and select a file.');
        return;
    }
    
    const file = fileInput.files[0];
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
    
    saveAssignment(course, title, dueDate, fileName, comments);
    assignmentForm.reset();
    alert('Assignment submitted successfully!');
    loadAssignments();
}

function saveAssignment(course, title, dueDate, fileName, comments) {
    const userId = sessionStorage.getItem('userId');
    const submissionDate = new Date().toISOString().split('T')[0];
    
    let assignments = JSON.parse(localStorage.getItem('studentAssignments')) || [];
    
    assignments.push({
        id: Date.now(),
        userId: userId,
        course: course,
        title: title,
        fileName: fileName,
        submissionDate: submissionDate,
        dueDate: dueDate,
        comments: comments,
        status: determineStatus(submissionDate, dueDate),
        grade: 'Not graded'
    });
    
    localStorage.setItem('studentAssignments', JSON.stringify(assignments));
}

function determineStatus(submissionDate, dueDate) {
    const submitted = new Date(submissionDate);
    const due = new Date(dueDate);
    
    if (submitted > due) {
        return 'Late';
    } else {
        return 'Submitted';
    }
}

function loadAssignments() {
    const userId = sessionStorage.getItem('userId');
    const assignmentsList = document.getElementById('assignments-list');
    
    if (!assignmentsList) return;
    
    assignmentsList.innerHTML = '';
    
    const allAssignments = JSON.parse(localStorage.getItem('studentAssignments')) || [];
    const userAssignments = allAssignments.filter(assignment => assignment.userId === userId);
    
    if (userAssignments.length === 0) {
        assignmentsList.innerHTML = '<tr><td colspan="6" class="text-center">No assignments uploaded yet.</td></tr>';
        return;
    }
    
    userAssignments.forEach(assignment => {
        const row = document.createElement('tr');
        
        const courseNames = {
            'math101': 'Mathematics 101',
            'eng205': 'English Literature 205',
            'cs150': 'Computer Science 150',
            'bio200': 'Biology 200',
            'phy101': 'Physics 101',
            'hist110': 'History 110'
        };
        
        const courseName = courseNames[assignment.course] || assignment.course;
        
        let statusClass = '';
        if (assignment.status === 'Late') {
            statusClass = 'status-late';
        } else if (assignment.grade !== 'Not graded') {
            statusClass = 'status-graded';
        } else {
            statusClass = 'status-pending';
        }
        
        row.innerHTML = `
            <td>${courseName}</td>
            <td>${assignment.title}</td>
            <td>${assignment.submissionDate}</td>
            <td>${assignment.dueDate}</td>
            <td class="${statusClass}">${assignment.status}</td>
            <td>${assignment.grade}</td>
        `;
        
        assignmentsList.appendChild(row);
    });
}
