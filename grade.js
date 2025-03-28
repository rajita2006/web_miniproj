document.addEventListener('DOMContentLoaded', function() {
    const gradesContainer = document.getElementById('grades-container');
    const loginSection = document.getElementById('login-section');
    const gradesSection = document.getElementById('grades-section');
    const gradesLoginButton = document.getElementById('grades-login-button');
    const logoutButton = document.getElementById('logout-button');
    
    const subjects = [
        { code: 'BMAT101L', title: 'Calculus I' },
        { code: 'BENG101P', title: 'Technical English' },
        { code: 'BCSE201P', title: 'Computer Java' },
        { code: 'BPHY201L', title: 'Engineering Physics' },
        { code: 'BCSE204L', title: 'Web Programming' },
        { code: 'BCHY101L', title: 'Engineering Chemistry' },
        { code: 'BEEE203L', title: 'Digital Systems Design' },
        { code: 'BMAT203P', title: 'Probability Statistics' },
        { code: 'BSOC101P', title: 'Introduction to Sociology' },
        { code: 'BHIS102L', title: 'Pacific History' },
        { code: 'BECO201P', title: 'Microeconomics' },
        { code: 'BPSY101L', title: 'General Psychology' }
    ];
    
    const gradeScale = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
    
    function checkLogin() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userRole = sessionStorage.getItem('userRole');
        
        if (isLoggedIn || (userRole === 'Student')) {
            generateRandomGrades();
        }
    }
    
    function generateRandomGrades() {
        const numSubjects = Math.floor(Math.random() * 4) + 5;
        const shuffledSubjects = [...subjects].sort(() => 0.5 - Math.random());
        const selectedSubjects = shuffledSubjects.slice(0, numSubjects);
        
        const grades = selectedSubjects.map(subject => ({
            ...subject,
            grade: gradeScale[Math.floor(Math.random() * gradeScale.length)]
        }));
        
        sessionStorage.setItem('studentGrades', JSON.stringify(grades));
        sessionStorage.setItem('isLoggedIn', true);
        
        showGrades();
    }
    
    function showGrades() {
        const storedGrades = sessionStorage.getItem('studentGrades');
        
        if (storedGrades) {
            const grades = JSON.parse(storedGrades);
            
            const gradePoints = {
                'S': 10,
                'A': 9,
                'B': 8,
                'C': 7,
                'D': 6,
                'E': 5,
                'F': 0
            };
            
            let totalPoints = 0;
            let totalCourses = grades.length;
            
            grades.forEach(course => {
                totalPoints += gradePoints[course.grade] || 0;
            });
            
            const gpa = totalCourses > 0 ? (totalPoints / totalCourses).toFixed(2) : 'N/A';
            
            let tableContent = `
                <div class="semester-info">
                    <p><strong>Student ID:</strong> ${sessionStorage.getItem('userId') || 'DWU2024001'}</p>
                    <p><strong>Semester:</strong> Fall 2024</p>
                    <p><strong>GPA:</strong> ${gpa}</p>
                </div>
                <table class="grade-table">
                    <thead>
                        <tr>
                            <th>Course Code</th>
                            <th>Course Title</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            grades.forEach(course => {
                tableContent += `
                    <tr>
                        <td>${course.code}</td>
                        <td>${course.title}</td>
                        <td>${course.grade}</td>
                    </tr>
                `;
            });
            
            tableContent += '</tbody></table>';
            gradesContainer.innerHTML = tableContent;
            
            if (loginSection) loginSection.style.display = 'none';
            if (gradesSection) gradesSection.style.display = 'block';
        }
    }
    
    if (gradesLoginButton) {
        gradesLoginButton.addEventListener('click', function() {
            loginSection.innerHTML = `
                <div class="container">
                    <h2>Student Login</h2>
                    <form id="login-form">
                        <label for="studentId">Student ID:</label>
                        <input type="text" id="studentId" required>
                        
                        <label for="password">Password:</label>
                        <input type="password" id="password" required>
                        
                        <button type="submit" class="btn primary-btn">Login</button>
                    </form>
                </div>
            `;
            
            document.getElementById('login-form').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const studentId = document.getElementById('studentId').value;
                const password = document.getElementById('password').value;
                
                if (studentId && password) {
                    sessionStorage.setItem('isLoggedIn', true);
                    sessionStorage.setItem('userRole', 'Student');
                    sessionStorage.setItem('userId', studentId);
                    
                    loginSection.innerHTML = "<p>Login successful! Loading grades...</p>";
                    setTimeout(generateRandomGrades, 1000);
                } else {
                    alert('Please enter a valid Student ID and Password.');
                }
            });
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('studentGrades');
            alert('You have been logged out.');
            window.location.reload();
        });
    }
    
    checkLogin();
});
