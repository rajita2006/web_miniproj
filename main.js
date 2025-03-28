document.addEventListener('DOMContentLoaded', function() {
    const createMobileNav = () => {
        const header = document.querySelector('.main-header');
        if (!document.querySelector('.menu-toggle')) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            `;
            const nav = document.querySelector('.main-nav');
            header.insertBefore(menuToggle, nav);
            menuToggle.addEventListener('click', function() {
                document.querySelector('.main-nav').classList.toggle('active');
            });
        }
    };

    const checkMobileNav = () => {
        if (window.innerWidth <= 768) {
            createMobileNav();
        }
    };

    checkMobileNav();
    window.addEventListener('resize', checkMobileNav);

    const checkLoginStatus = () => {
        const userRole = sessionStorage.getItem('userRole');
        const dashboard = document.getElementById('dashboard');
        if (dashboard && userRole) {
            dashboard.style.display = 'block';
            const userRoleElement = document.getElementById('user-role');
            if (userRoleElement) {
                userRoleElement.textContent = userRole;
            }
            if (userRole === 'Student') {
                document.getElementById('student-dashboard').style.display = 'block';
                document.getElementById('teacher-dashboard').style.display = 'none';
            } else if (userRole === 'Teacher') {
                document.getElementById('student-dashboard').style.display = 'none';
                document.getElementById('teacher-dashboard').style.display = 'block';
            }
            const loginButton = document.getElementById('login-button');
            if (loginButton) {
                loginButton.style.display = 'none';
            }
        }
    };

    checkLoginStatus();

    const addMobileStyles = () => {
        if (!document.getElementById('mobile-styles')) {
            const style = document.createElement('style');
            style.id = 'mobile-styles';
            style.innerHTML = `
                @media (max-width: 768px) {
                    .menu-toggle {
                        display: block;
                        background: transparent;
                        border: none;
                        color: white;
                        font-size: 24px;
                        cursor: pointer;
                        padding: 5px;
                    }
                    .main-nav {
                        display: none;
                        width: 100%;
                    }
                    .main-nav.active {
                        display: block;
                    }
                    .main-nav ul {
                        flex-direction: column;
                    }
                    .main-nav ul li {
                        margin: 5px 0;
                    }
                }
                @media (min-width: 769px) {
                    .menu-toggle {
                        display: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    };

    addMobileStyles();
});

const counters = document.querySelectorAll(".counter");

const animateCounter = (counter) => {
  const target = +counter.getAttribute("data-target");
  const increment = target / 100;
  let currentValue = 0;

  const updateCounter = () => {
    if (currentValue < target) {
      currentValue += increment;
      counter.innerText = Math.ceil(currentValue);
      setTimeout(updateCounter, 30);
    } else {
      counter.innerText = target;
    }
  };

  updateCounter();
};

const options = {
  threshold: 0.6,
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
    }
  });
}, options);

counters.forEach((counter) => {
  observer.observe(counter);
});
