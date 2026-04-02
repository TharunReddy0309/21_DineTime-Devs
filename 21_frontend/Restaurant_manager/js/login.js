// ---- Toast ----
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' toast-error' : '');
    const icon = type === 'error' ? 'ph-warning' : 'ph-check-circle';
    const iconColor = type === 'error' ? '#DC2626' : '#527A59';
    toast.innerHTML = `<i class="ph ${icon}" style="font-size:18px;color:${iconColor};flex-shrink:0;"></i><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// ---- Toggle password visibility ----
const toggleEye = document.getElementById('toggle-eye');
const eyeIcon   = document.getElementById('eye-icon');
const passInput = document.getElementById('password-input');

toggleEye.addEventListener('click', () => {
    const isHidden = passInput.type === 'password';
    passInput.type = isHidden ? 'text' : 'password';
    eyeIcon.className = isHidden ? 'ph ph-eye-slash' : 'ph ph-eye';
});

// ---- Forgot password ----
const forgotModal = document.getElementById('forgotPasswordModal');
const closeForgotModal = document.getElementById('closeForgotModal');

document.getElementById('forgot-link').addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.classList.remove('hidden');
});

closeForgotModal.addEventListener('click', () => {
    forgotModal.classList.add('hidden');
    document.getElementById('reset-success-msg').classList.add('hidden');
});

forgotModal.addEventListener('click', (e) => {
    if (e.target === forgotModal) {
        forgotModal.classList.add('hidden');
        document.getElementById('reset-success-msg').classList.add('hidden');
    }
});

document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const resetEmail = document.getElementById('reset-email').value.trim();
    if (!resetEmail) return;
    
    try {
        const raw = JSON.parse(localStorage.getItem('dinetimeData_v2')) || { users: {} };
        if (!raw.users[resetEmail.toLowerCase()] && resetEmail.toLowerCase() !== "rahul.sharma@spicegarden.com" && resetEmail.toLowerCase() !== "manager@sushimaster.com") {
            showToast('Email address not found in our system.', 'error');
            return;
        }
    } catch(err) {}

    document.getElementById('reset-success-msg').classList.remove('hidden');
    setTimeout(() => {
        forgotModal.classList.add('hidden');
        document.getElementById('reset-success-msg').classList.add('hidden');
        document.getElementById('reset-email').value = '';
    }, 2500);
});

// ---- Form submit ----
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const emailVal    = document.getElementById('email-input').value.trim();
    const passwordVal = document.getElementById('password-input').value;

    const emailInput  = document.getElementById('email-input');
    const pwInput     = document.getElementById('password-input');
    const emailErr    = document.getElementById('email-error');
    const passwordErr = document.getElementById('password-error');

    // Reset errors
    emailInput.classList.remove('input-error');
    pwInput.classList.remove('input-error');
    emailErr.classList.remove('show');
    passwordErr.classList.remove('show');

    let valid = true;
    if (!emailVal) {
        emailInput.classList.add('input-error');
        emailErr.classList.add('show');
        valid = false;
    }
    if (!passwordVal) {
        pwInput.classList.add('input-error');
        passwordErr.textContent = 'Please enter your password.';
        passwordErr.classList.add('show');
        valid = false;
    }
    if (!valid) return;

    // Simulate credential check
    const isMockUser = (emailVal.toLowerCase() === "rahul.sharma@spicegarden.com" && passwordVal === "password123") ||
                       (emailVal.toLowerCase() === "manager@sushimaster.com" && passwordVal === "password123");
    
    // For registered users, we cross-reference stored custom passwords natively
    const raw = StorageManager.getRawData();
    const user = raw.users[emailVal.toLowerCase()];
    const isRegisteredUser = user && (user.password === passwordVal);

    if (!isMockUser && !isRegisteredUser) {
        pwInput.classList.add('input-error');
        passwordErr.textContent = 'Invalid email or password. Please try again.';
        passwordErr.classList.add('show');
        showToast('Login failed. Check your credentials.', 'error');
        return;
    }

    // Success - Load the correct user context
    StorageManager.login(emailVal);
    
    const btn = document.getElementById('login-btn');
    btn.textContent = 'Logging in…';
    btn.disabled = true;
    showToast('Login successful! Redirecting…');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
});

// Demo Login Helper
document.getElementById('demo-login-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('email-input').value = "rahul.sharma@spicegarden.com";
    document.getElementById('password-input').value = "password123";
    showToast('Demo credentials autofilled! Click Login to proceed.', 'info');
});

// Social Login Simulation
document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
        const provider = btn.innerText.includes('Google') ? 'Google' : 'Apple';
        showToast(`<i class="ph ph-circle-notch ph-spin" style="margin-right: 8px;"></i> Establishing secure connection with ${provider}...`, 'info');
    });
});



