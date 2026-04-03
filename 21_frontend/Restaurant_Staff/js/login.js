// Toggle password visibility
document.getElementById('toggle-pwd').addEventListener('click', function(e) {
    const pwdInput = document.getElementById('password');
    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    } else {
        pwdInput.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
});

// ── Forgot Password Modal ─────────────────────────────
const forgotModal      = document.getElementById('forgotPasswordModal');
const closeForgotModal = document.getElementById('closeForgotModal');
const resetSuccessMsg  = document.getElementById('reset-success-msg');

document.getElementById('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.classList.remove('hidden');
});

closeForgotModal.addEventListener('click', () => {
    forgotModal.classList.add('hidden');
    resetSuccessMsg.classList.add('hidden');
});

forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) {
        forgotModal.classList.add('hidden');
        resetSuccessMsg.classList.add('hidden');
    }
});

document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    resetSuccessMsg.classList.remove('hidden');
    setTimeout(() => {
        forgotModal.classList.add('hidden');
        resetSuccessMsg.classList.add('hidden');
        document.getElementById('reset-email').value = '';
    }, 2500);
});

// Login Form Submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const staffId = document.getElementById('staff-id').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('remember-me').checked;
    const errorMsg = document.getElementById('login-error');

    errorMsg.style.display = 'none';

    // Basic Validation
    if (!staffId || !password) {
        errorMsg.textContent = 'Please enter both Staff ID and Password.';
        errorMsg.style.display = 'block';
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = 'Invalid credentials. Password must be at least 6 characters.';
        errorMsg.style.display = 'block';
        return;
    }

    // Simulate Server Authentication Request
    const loginBtn = document.querySelector('.btn-primary');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Authenticating...';
    loginBtn.disabled = true;

    setTimeout(() => {
        // --- REAL SESSION MANAGEMENT LOGIC ---
        let registeredStaff = JSON.parse(localStorage.getItem('dinetime_registered_staff')) || {};
        
        // Always inject default test accounts for seamless testing
        registeredStaff['admin@dinetime.com'] = {
            name: 'Admin User', email: 'admin@dinetime.com', phone: '9876500199', password: 'password123', role: 'Staff', restaurant: 'Spice Garden', status: 'Approved'
        };
        registeredStaff['spice@dinetime.com'] = {
            name: 'Priya Mehta', email: 'spice@dinetime.com', phone: '9876500200', password: 'password123', role: 'Staff', restaurant: 'Spice Garden', status: 'Approved'
        };
        registeredStaff['sushi@dinetime.com'] = {
            name: 'Rohan Mehra', email: 'sushi@dinetime.com', phone: '9876500201', password: 'password123', role: 'Staff', restaurant: 'Sushi Master', status: 'Approved'
        };
        registeredStaff['burger@dinetime.com'] = {
            name: 'Amit Khanna', email: 'burger@dinetime.com', phone: '9876500202', password: 'password123', role: 'Staff', restaurant: 'Burger Joint', status: 'Approved'
        };
        registeredStaff['gourmet@dinetime.com'] = {
            name: 'Sarah Johnson', email: 'gourmet@dinetime.com', phone: '9876500203', password: 'password123', role: 'Staff', restaurant: 'Le Gourmet', status: 'Approved'
        };
        registeredStaff['taco@dinetime.com'] = {
            name: 'Andrea Lopez', email: 'taco@dinetime.com', phone: '9876500204', password: 'password123', role: 'Staff', restaurant: 'Taco Fiesta', status: 'Approved'
        };
        localStorage.setItem('dinetime_registered_staff', JSON.stringify(registeredStaff));

        const userRecord = registeredStaff[staffId];

        if (!userRecord || userRecord.password !== password) {
            // Authentication Failed
            errorMsg.textContent = 'Invalid Staff ID or Password. Please try again.';
            errorMsg.style.display = 'block';
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
            return;
        }

        // --- Sync approval status from Manager portal ---
        try {
            const RESTAURANT_ID_MAP = {
                'RES-1001': 'rahul.sharma@spicegarden.com',
                'RES-2001': 'manager@sushimaster.com'
            };
            const managerEmail = userRecord.restId ? RESTAURANT_ID_MAP[userRecord.restId] : null;
            if (managerEmail) {
                const managerDataStr = localStorage.getItem('dinetimeData_v2');
                if (managerDataStr) {
                    const managerData = JSON.parse(managerDataStr);
                    const mgr = managerData.users && managerData.users[managerEmail];
                    if (mgr && mgr.staff) {
                        const staffEntry = mgr.staff.find(s => s.email === staffId);
                        if (staffEntry) {
                            userRecord.status = staffEntry.status;
                            registeredStaff[staffId] = userRecord;
                            localStorage.setItem('dinetime_registered_staff', JSON.stringify(registeredStaff));
                        }
                    }
                }
            }
        } catch(e) {}

        // --- Approval Gate ---
        const staffStatus = userRecord.status || 'Approved';
        if (staffStatus === 'Pending') {
            errorMsg.textContent = '⏳ Your account is awaiting approval from your Restaurant Manager. Please check back after approval.';
            errorMsg.style.display = 'block';
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
            return;
        }
        if (staffStatus === 'Rejected') {
            errorMsg.textContent = '🚫 Your access request was rejected by the Restaurant Manager. Please contact your manager.';
            errorMsg.style.display = 'block';
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
            return;
        }

        // Authentication Successful
        const sessionData = {
            id: staffId,
            name: userRecord.name,
            role: userRecord.role || 'Staff',
            restaurant: userRecord.restaurant || 'Spice Garden',
            loggedInAt: new Date().toISOString(),
            remember: remember
        };

        localStorage.setItem('dinetime_session', JSON.stringify(sessionData));
        
        // Sync the user's details to the Profile page globally
        localStorage.setItem('dinetime_profile', JSON.stringify({
            name: userRecord.name,
            email: userRecord.email,
            phone: userRecord.phone
        }));
        // ------------------------------------

        // Redirect to Customer Check-In dashboard
        window.location.href = 'check-in.html';
        
    }, 800);
});

// Auto-fill redirect checking inside login page isn't needed here (it's the login page).
// But we *can* redirect them AWAY from login if they are already logged in.
function checkExistingSession() {
    const session = localStorage.getItem('dinetime_session');
    if (session) {
        window.location.href = 'check-in.html';
    }
}

document.addEventListener('DOMContentLoaded', checkExistingSession);
