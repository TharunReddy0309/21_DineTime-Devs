
document.addEventListener('DOMContentLoaded', function() {
    
    if (!localStorage.getItem('admin_email')) {
        localStorage.setItem('admin_email', 'admin@dinetime.com');
    }
    if (!localStorage.getItem('admin_password')) {
        localStorage.setItem('admin_password', 'admin123');
    }

    const loginForm = document.getElementById('superLoginForm');
    const errorMsg = document.getElementById('login-error-msg');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const emailInput = document.getElementById('superEmail').value;
            const passInput = document.getElementById('superPassword').value;

            const masterEmail = localStorage.getItem('admin_email');
            const masterPass = localStorage.getItem('admin_password');

            if (emailInput === masterEmail && passInput === masterPass) {
                // Successful Auth
                localStorage.setItem('super_auth_status', 'true');
                window.location.href = 'super-dashboard.html';
            } else {
                // Failed Auth
                showError();
            }
        });
    }

    function showError() {
        if (!errorMsg) return;
        errorMsg.classList.remove('hidden');
        
        // Remove and re-add class to trigger animation again
        errorMsg.style.animation = 'none';
        errorMsg.offsetHeight; /* trigger reflow */
        errorMsg.style.animation = null;

        setTimeout(function() {
            errorMsg.classList.add('hidden');
        }, 3000);
    }
});
