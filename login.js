document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            showRoleSelectionForm();
        });
    }
    
    const dashboard = document.getElementById('dashboard');
    const userRole = sessionStorage.getItem('userRole');
    
    if (dashboard && userRole) {
        dashboard.style.display = 'block';
        document.getElementById('user-role').textContent = userRole;
        
        if (userRole === 'Student') {
            document.getElementById('student-dashboard').style.display = 'block';
        } else if (userRole === 'Teacher') {
            document.getElementById('teacher-dashboard').style.display = 'block';
        }
    }
    
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            sessionStorage.clear();
            alert('You have been logged out. Redirecting to home page.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        });
    }
    
    function showRoleSelectionForm() {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        Object.assign(modalOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '999'
        });

        const modalHTML = `
            <div class="login-modal">
                <div class="login-box">
                    <h2>Select Your Role</h2>
                    <div class="role-options">
                        <label><input type="radio" name="userRole" value="Student"> Student</label>
                        <label><input type="radio" name="userRole" value="Teacher"> Teacher</label>
                    </div>
                    <div class="modal-buttons">
                        <button id="proceedLogin" class="btn primary-btn">Proceed</button>
                        <button id="closeModal" class="btn secondary-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        modalOverlay.innerHTML = modalHTML;
        document.body.appendChild(modalOverlay);
        
        document.getElementById('closeModal').addEventListener('click', function() {
            document.body.removeChild(modalOverlay);
        });

        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });

        document.getElementById('proceedLogin').addEventListener('click', function() {
            const selectedRole = document.querySelector('input[name="userRole"]:checked');
            if (selectedRole) {
                const role = selectedRole.value;
                document.body.removeChild(modalOverlay);
                showLoginForm(role);
            } else {
                alert('Please select a role before proceeding.');
            }
        });
    }

    function showLoginForm(role) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        Object.assign(modalOverlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '999'
        });

        const modalHTML = `
            <div class="login-modal">
                <div class="login-box">
                    <h2>${role} Login</h2>
                    <form id="login-form">
                        <label for="userId">User ID:</label>
                        <input type="text" id="userId" placeholder="Enter your ID" required>
                        
                        <label for="userPass">Password:</label>
                        <input type="password" id="userPass" placeholder="Enter your password" required>
                        
                        <div class="modal-buttons">
                            <button type="submit" id="submitLogin" class="btn primary-btn">Login</button>
                            <button type="button" id="closeModal" class="btn secondary-btn">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        modalOverlay.innerHTML = modalHTML;
        document.body.appendChild(modalOverlay);

        document.getElementById('closeModal').addEventListener('click', function() {
            document.body.removeChild(modalOverlay);
        });

        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                document.body.removeChild(modalOverlay);
            }
        });

        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const userId = document.getElementById('userId').value.trim();
            const userPass = document.getElementById('userPass').value.trim();

            if (userId && userPass) {
                sessionStorage.setItem('userRole', role);
                sessionStorage.setItem('userId', userId);
                alert(`${role} login successful! Loading your dashboard...`);
                document.body.removeChild(modalOverlay);

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                alert('Please fill out both fields.');
            }
        });
    }
});
