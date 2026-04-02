// Toggle password visibility for multiple fields
const toggleIcons = document.querySelectorAll('.toggle-password');
toggleIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const pwdInput = document.getElementById(targetId);
        
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
});

// Registration Form Submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const restId = document.getElementById('rest-id').value.trim();
    const pincode = document.getElementById('pincode').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();
    const errorMsg = document.getElementById('register-error');

    errorMsg.style.display = 'none';

    // Basic Validation
    if (!fullName || !email || !phone || !restId || !pincode || !password || !confirmPassword) {
        errorMsg.textContent = 'Please fill out all fields.';
        errorMsg.style.display = 'block';
        return;
    }

    if (password.length < 8) {
        errorMsg.textContent = 'Password must be at least 8 characters.';
        errorMsg.style.display = 'block';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMsg.textContent = 'Please enter a valid email address.';
        errorMsg.style.display = 'block';
        return;
    }

    if (!/^\d{10}$/.test(phone)) {
        errorMsg.textContent = 'Phone number must be exactly 10 digits.';
        errorMsg.style.display = 'block';
        return;
    }

    // Known Restaurant ID map
    const RESTAURANT_ID_MAP = {
        'RES-1001': { name: 'Spice Garden',  managerEmail: 'rahul.sharma@spicegarden.com' },
        'RES-2001': { name: 'Sushi Master',  managerEmail: 'manager@sushimaster.com' },
        'RES-3001': { name: 'Burger Joint',  managerEmail: null },
        'RES-4001': { name: 'Le Gourmet',    managerEmail: null },
        'RES-5001': { name: 'Taco Fiesta',   managerEmail: null }
    };

    const restIdUpper = restId.toUpperCase();
    if (!RESTAURANT_ID_MAP[restIdUpper]) {
        errorMsg.textContent = 'Invalid Restaurant ID. Valid IDs: RES-1001 (Spice Garden), RES-2001 (Sushi Master).';
        errorMsg.style.display = 'block';
        return;
    }

    if (!/^\d{6}$/.test(pincode)) {
        errorMsg.textContent = 'Pincode must be exactly 6 digits.';
        errorMsg.style.display = 'block';
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.textContent = 'Passwords do not match.';
        errorMsg.style.display = 'block';
        return;
    }

    // Check if email already registered
    let registeredStaff = JSON.parse(localStorage.getItem('dinetime_registered_staff')) || {};
    if (registeredStaff[email]) {
        const emailErrorSpan = document.getElementById('email-error');
        if (emailErrorSpan) {
            emailErrorSpan.style.display = 'block';
            document.getElementById('email').addEventListener('input', () => {
                emailErrorSpan.style.display = 'none';
            }, {once: true});
        } else {
            errorMsg.textContent = 'This email is already registered.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    // Simulate Server Request
    const submitBtn = document.querySelector('.btn-primary');
    submitBtn.textContent = 'Submitting Request...';
    submitBtn.disabled = true;

    setTimeout(() => {
        const restIdUpper = restId.toUpperCase();
        const RESTAURANT_ID_MAP = {
            'RES-1001': { name: 'Spice Garden',  managerEmail: 'rahul.sharma@spicegarden.com' },
            'RES-2001': { name: 'Sushi Master',  managerEmail: 'manager@sushimaster.com' },
            'RES-3001': { name: 'Burger Joint',  managerEmail: null },
            'RES-4001': { name: 'Le Gourmet',    managerEmail: null },
            'RES-5001': { name: 'Taco Fiesta',   managerEmail: null }
        };
        const restInfo = RESTAURANT_ID_MAP[restIdUpper];
        const restaurantName = restInfo ? restInfo.name : 'Unknown';
        const managerEmail   = restInfo ? restInfo.managerEmail : null;

        // Store pending state for the UI
        const pendingRequest = {
            name: fullName,
            email: email,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('dinetime_pending_request', JSON.stringify(pendingRequest));
        
        // Save staff as Pending in dinetime_registered_staff
        let registeredStaff = JSON.parse(localStorage.getItem('dinetime_registered_staff')) || {};
        registeredStaff[email] = {
            name: fullName,
            email: email,
            phone: phone,
            restId: restIdUpper,
            restaurant: restaurantName,
            pincode: pincode,
            password: password,
            role: 'Staff',
            status: 'Pending'   // Blocked until manager approves
        };
        localStorage.setItem('dinetime_registered_staff', JSON.stringify(registeredStaff));

        // Route the pending request to the correct manager's staff list in dinetimeData_v2
        if (managerEmail) {
            try {
                let managerData = JSON.parse(localStorage.getItem('dinetimeData_v2'));
                if (managerData && managerData.users && managerData.users[managerEmail]) {
                    const mgr = managerData.users[managerEmail];
                    if (!mgr.staff) mgr.staff = [];
                    // Avoid duplicates
                    const alreadyExists = mgr.staff.find(s => s.email === email);
                    if (!alreadyExists) {
                        const initials = fullName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
                        mgr.staff.push({
                            id: 'ST-' + Date.now(),
                            name: fullName,
                            initials: initials,
                            role: 'Staff',
                            email: email,
                            phone: phone,
                            status: 'Pending',
                            requestedOn: new Date().toLocaleDateString('en-IN')
                        });
                        localStorage.setItem('dinetimeData_v2', JSON.stringify(managerData));
                    }
                }
            } catch(e) { console.error('Failed to route staff request to manager:', e); }
        }
        
        // Redirect to Request Status Page
        window.location.href = 'request.html';
        
    }, 1000);
});
