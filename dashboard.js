document.addEventListener('DOMContentLoaded', function() {
    const userRole = sessionStorage.getItem('userRole');
    const userId = sessionStorage.getItem('userId');
    initializeLoginButton();
    initializeLogoutButton();
    if (userRole && userId) {
        showDashboard(userRole, userId);
    } else {
        showLoginPrompt();
    }
});

function initializeLoginButton() {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            const loginButtonInHeader = document.querySelector('.login-area button:not(#logout-button)');
            if (loginButtonInHeader) {
                loginButtonInHeader.click();
            } else {
                if (typeof showRoleSelectionForm === 'function') {
                    showRoleSelectionForm();
                } else {
                    alert('Please navigate to the homepage to log in.');
                    window.location.href = 'index.html';
                }
            }
        });
    }
}

function initializeLogoutButton() {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.removeItem('userRole');
            sessionStorage.removeItem('userId');
            window.location.reload();
        });
    }
}

function showLoginPrompt() {
    document.getElementById('student-dashboard').style.display = 'none';
    document.getElementById('teacher-dashboard').style.display = 'none';
    document.getElementById('not-logged-in').style.display = 'block';
    document.getElementById('user-greeting').innerHTML = `
        <h1>Welcome to the Dashboard</h1>
        <p>Please log in to access your personalized dashboard.</p>
    `;
}

function showDashboard(role, userId) {
    document.getElementById('not-logged-in').style.display = 'none';
    if (role === 'student') {
        document.getElementById('student-dashboard').style.display = 'block';
        document.getElementById('teacher-dashboard').style.display = 'none';
        document.getElementById('user-greeting').innerHTML = `
            <h1>Welcome, Student ${userId}</h1>
            <p>Access your courses, assignments, and grades from your personalized dashboard.</p>
        `;
        loadUpcomingAssignments(userId);
        loadRecentGrades(userId);
    } else if (role === 'teacher') {
        document.getElementById('student-dashboard').style.display = 'none';
        document.getElementById('teacher-dashboard').style.display = 'block';
        document.getElementById('user-greeting').innerHTML = `
            <h1>Welcome, Teacher ${userId}</h1>
            <p>Manage your courses, assignments, and student grades from your dashboard.</p>
        `;
        loadRecentSubmissions();
        loadCourseStatistics();
    }
}

function loadUpcomingAssignments(userId) {
    const assignmentsContainer = document.getElementById('upcoming-assignments');
    if (!assignmentsContainer) return;
    const teacherAssignments = JSON.parse(localStorage.getItem('teacherAssignments')) || [];
    const studentAssignments = JSON.parse(localStorage.getItem('studentAssignments')) || [];
    const submittedAssignmentTitles = studentAssignments.filter(sa => sa.userId === userId).map(sa => sa.title);
    const upcomingAssignments = teacherAssignments.filter(assignment => !submittedAssignmentTitles.includes(assignment.title));
    if (upcomingAssignments.length === 0) {
        assignmentsContainer.innerHTML = '<p class="empty-state">No upcoming assignments found.</p>';
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
    assignmentsContainer.innerHTML = '';
    upcomingAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const assignmentsToShow = upcomingAssignments.slice(0, 5);
    assignmentsToShow.forEach(assignment => {
        const courseName = courseNames[assignment.course] || assignment.course;
        const today = new Date();
        const dueDate = new Date(assignment.dueDate);
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        let statusClass = 'status-upcoming';
        let statusText = 'Upcoming';
        if (daysUntilDue < 0) {
            statusClass = 'status-overdue';
            statusText = 'Overdue';
        } else if (daysUntilDue <= 3) {
            statusClass = 'status-due-soon';
            statusText = 'Due Soon';
        }
        const assignmentItem = document.createElement('div');
        assignmentItem.className = 'list-item';
        assignmentItem.innerHTML = `
            <div class="list-item-title">${assignment.title}</div>
            <div class="list-item-meta">
                <span>${courseName}</span>
                <span>Due: ${assignment.dueDate}</span>
                <span class="assignment-status ${statusClass}">${statusText}</span>
            </div>
        `;
        assignmentsContainer.appendChild(assignmentItem);
    });
}

function loadRecentGrades(userId) {
    const gradesContainer = document.getElementById('recent-grades');
    if (!gradesContainer) return;
    const studentAssignments = JSON.parse(localStorage.getItem('studentAssignments')) || [];
    const gradedAssignments = studentAssignments.filter(assignment => assignment.userId === userId && assignment.grade !== 'Not graded').sort((a, b) => b.id - a.id);
    if (gradedAssignments.length === 0) {
        gradesContainer.innerHTML = '<p class="empty-state">No recent grades found.</p>';
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
    gradesContainer.innerHTML = '';
    const gradesToShow = gradedAssignments.slice(0, 5);
    gradesToShow.forEach(assignment => {
        const courseName = courseNames[assignment.course] || assignment.course;
        let gradeClass = '';
        const numericGrade = parseFloat(assignment.grade);
        if (numericGrade >= 90) gradeClass = 'grade-a';
        else if (numericGrade >= 80) gradeClass = 'grade-b';
        else if (numericGrade >= 70) gradeClass = 'grade-c';
        else if (numericGrade >= 60) gradeClass = 'grade-d';
        else gradeClass = 'grade-f';
        const gradeItem = document.createElement('div');
        gradeItem.className = 'list-item';
        gradeItem.innerHTML = `
            <div class="list-item-title">${assignment.title}</div>
            <div class="list-item-meta">
                <span>${courseName}</span>
                <span class="${gradeClass}">${assignment.grade}/100</span>
            </div>
        `;
        gradesContainer.appendChild(gradeItem);
    });
}
