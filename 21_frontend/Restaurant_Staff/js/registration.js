// Toggle password visibility for multiple fields
const API_BASE = (window.DINETIME_CONFIG && window.DINETIME_CONFIG.API_BASE) || 'http://localhost:3000';

async function apiRequest(path, options = {}, role = 'staff') {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            role,
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

function normalizeKey(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveRestaurant(restaurants, inputValue) {
    const input = String(inputValue || '').trim();
    const normalizedInput = normalizeKey(input);

    if (!normalizedInput) return null;

    const direct = (restaurants || []).find((restaurant) =>
        normalizeKey(restaurant.id) === normalizedInput ||
        normalizeKey(restaurant.name) === normalizedInput,
    );
    if (direct) return direct;

    // Backward-compatible aliases used in older UI versions.
    const legacyAliasToName = {
        restaurantseed1: 'spicegarden',
        restaurantseed2: 'bellaitalia',
        restaurantseed3: 'dragonbowl',
        restaurantseed4: 'sakurahouse',
        res1001: 'spicegarden',
    };

    const aliasName = legacyAliasToName[normalizedInput];
    if (aliasName) {
        const byAlias = (restaurants || []).find((restaurant) => normalizeKey(restaurant.name) === aliasName);
        if (byAlias) return byAlias;
    }

    const seedMatch = normalizedInput.match(/restaurantseed(\d+)$/);
    if (seedMatch) {
        const index = Number(seedMatch[1]) - 1;
        if (index >= 0 && index < (restaurants || []).length) {
            return restaurants[index];
        }
    }

    return null;
}

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
document.getElementById('registerForm').addEventListener('submit', async function(e) {
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

    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting Request...';
    submitBtn.disabled = true;

    try {
        const [restaurantsRes, usersRes] = await Promise.all([
            apiRequest('/restaurants', {}, 'staff'),
            apiRequest('/users', {}, 'manager'),
        ]);

        const restaurants = restaurantsRes?.data || [];
        const users = usersRes?.data || [];

        const restaurant = resolveRestaurant(restaurants, restId);

        if (!restaurant) {
            throw new Error('Restaurant not found. Use a valid Restaurant ID or exact restaurant name.');
        }

        const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            throw new Error('This email is already registered.');
        }

        await apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify({
                name: fullName,
                email,
                phone,
                password_hash: password,
                role: 'staff',
                status: 'inactive',
                location_id: 'loc_blr_1',
                restaurant_id: restaurant.id,
                employee_code: `EMP-${Date.now().toString().slice(-6)}`,
                role_type: 'service',
            }),
        }, 'manager');

        window.location.href = 'request.html';
    } catch (error) {
        errorMsg.textContent = error.message || 'Unable to submit request.';
        errorMsg.style.display = 'block';
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});
