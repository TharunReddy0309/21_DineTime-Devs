// settings.js - connected to DinetimeStore

let hasUnsavedChanges = false;

function markUnsaved() {
    hasUnsavedChanges = true;
}

const translations = {
    // Purposefully removed per user request
};

function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'error' ? 'error' : ''}`;
    
    const icon = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check';
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

function showConfirmModal(title, message, onConfirm) {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const btnCancel = document.getElementById('btnModalCancel');
    const btnConfirm = document.getElementById('btnModalConfirm');

    titleEl.innerText = title;
    msgEl.innerText = message;
    overlay.classList.add('show');

    const closeModal = () => {
        overlay.classList.remove('show');
        // Clean up listeners
        btnConfirm.onclick = null;
        btnCancel.onclick = null;
    };

    btnConfirm.onclick = () => {
        onConfirm();
        closeModal();
    };

    btnCancel.onclick = () => {
        closeModal();
    };
    
    // Close on overlay click
    overlay.onclick = (e) => {
        if(e.target === overlay) closeModal();
    };
}

function populateForm() {
    const user = DinetimeStore.getUser();
    const settings = DinetimeStore.getSettings();

    if (user) {
        document.getElementById('iptName').value = user.name || '';
        document.getElementById('iptEmail').value = user.email || '';
        document.getElementById('iptPhone').value = user.phone || '';
        
        let city = user.city || '';
        let country = user.country || '';
        let address = user.address || '';
        let pincode = user.pincode || '';
        
        // Backwards compatibility for generic unparsed location
        if (!city && user.location && user.location.includes(',')) {
            const parts = user.location.split(',');
            city = parts[0].trim();
            country = parts[1].trim();
        }

        document.getElementById('iptCity').value = city;
        if(document.getElementById('iptCountry')) document.getElementById('iptCountry').value = country;
        if(document.getElementById('iptAddress')) document.getElementById('iptAddress').value = address;
        if(document.getElementById('iptPincode')) document.getElementById('iptPincode').value = pincode;
    }

    if (settings) {
        document.getElementById('chk2FA').checked = settings.enable2FA || false;
        
        document.getElementById('tglResConf').checked = settings.resConf !== false;
        document.getElementById('tglPromos').checked = settings.promotions || false;
        document.getElementById('tglRestUpdates').checked = settings.restUpdates !== false;
        document.getElementById('tglEmailNotifs').checked = settings.emailNotifs !== false;
        document.getElementById('tglSmsNotifs').checked = settings.smsAlerts || false;
        

        document.getElementById('chkContact').checked = settings.contactMe !== false;
        document.getElementById('chkHistory').checked = settings.shareHistory !== false;
    }

    // clear passwords
    document.getElementById('iptCurPass').value = '';
    document.getElementById('iptNewPass').value = '';
    document.getElementById('iptConfPass').value = '';
    
    hasUnsavedChanges = false;
}

function updateStoreFromForm() {
    const user = DinetimeStore.getUser() || {};
    const settings = DinetimeStore.getSettings() || {};

    user.name = document.getElementById('iptName').value;
    user.email = document.getElementById('iptEmail').value;
    user.phone = document.getElementById('iptPhone').value;
    
    let city = document.getElementById('iptCity').value;
    let country = document.getElementById('iptCountry') ? document.getElementById('iptCountry').value : '';
    let address = document.getElementById('iptAddress') ? document.getElementById('iptAddress').value : '';
    let pincode = document.getElementById('iptPincode') ? document.getElementById('iptPincode').value : '';
    
    user.city = city;
    user.country = country;
    user.address = address;
    user.pincode = pincode;
    
    // Construct standard display location
    if (country) {
        user.location = `${city}, ${country}`;
    } else {
        user.location = city;
    }
    
    settings.enable2FA = document.getElementById('chk2FA').checked;
    settings.resConf = document.getElementById('tglResConf').checked;
    settings.promotions = document.getElementById('tglPromos').checked;
    settings.restUpdates = document.getElementById('tglRestUpdates').checked;
    settings.emailNotifs = document.getElementById('tglEmailNotifs').checked;
    settings.smsAlerts = document.getElementById('tglSmsNotifs').checked;

    settings.contactMe = document.getElementById('chkContact').checked;
    settings.shareHistory = document.getElementById('chkHistory').checked;

    DinetimeStore.setUser(user);
    DinetimeStore.setSettings(settings);
}

function init() {
    populateForm();
    
    // Attach change listeners to all inputs to mark as unsaved
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', markUnsaved);
        input.addEventListener('change', markUnsaved);
    });
    
    document.getElementById('btnResetAccount').addEventListener('click', () => {
         showConfirmModal(
            'Reset Account Data', 
            'Are you sure you want to revert to your original data? All unsaved changes will be lost.',
            () => {
                populateForm();
                showToast('Settings reverted successfully!');
            }
         );
    });

    document.getElementById('btnSaveAccount').addEventListener('click', () => {
        const requiredFields = [
            { id: 'iptName', name: 'Full Name' },
            { id: 'iptEmail', name: 'Email Address' },
            { id: 'iptPhone', name: 'Phone Number' },
            { id: 'iptAddress', name: 'Address' },
            { id: 'iptCity', name: 'City' },
            { id: 'iptPincode', name: 'Pincode' },
            { id: 'iptCountry', name: 'Country' }
        ];

        let isValid = true;
        let firstEmptyField = null;

        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                input.classList.add('input-error');
                isValid = false;
                if (!firstEmptyField) firstEmptyField = input;
                
                // Remove error style on input
                input.addEventListener('input', () => {
                    input.classList.remove('input-error');
                }, { once: true });
            } else {
                input.classList.remove('input-error');
            }
        });

        if (!isValid) {
            showToast('Please fill in all required account fields.', 'error');
            if (firstEmptyField) firstEmptyField.focus();
            return;
        }

        updateStoreFromForm();
        hasUnsavedChanges = false;
        showToast('Account settings saved successfully!');
    });

    // Save Password logic
    document.getElementById('btnUpdatePass').addEventListener('click', () => {
        const user = DinetimeStore.getUser();
        const curPass = document.getElementById('iptCurPass').value;
        const newPass = document.getElementById('iptNewPass').value;
        const confPass = document.getElementById('iptConfPass').value;

        if (!curPass || !newPass || !confPass) {
            showToast('Please fill in all password fields.', 'error');
            return;
        }

        if (curPass !== user.password) {
            showToast('The current password you entered is incorrect.', 'error');
            return;
        }

        if (newPass !== confPass) {
            showToast('New password and confirmation password do not match.', 'error');
            return;
        }

        if (newPass.length < 6) {
            showToast('New password must be at least 6 characters long.', 'error');
            return;
        }

        showConfirmModal(
            'Confirm Password Update',
            'Are you sure you want to update your login password?',
            () => {
                user.password = newPass;
                DinetimeStore.setUser(user);
                
                hasUnsavedChanges = false;
                document.getElementById('iptCurPass').value = '';
                document.getElementById('iptNewPass').value = '';
                document.getElementById('iptConfPass').value = '';
                showToast('Password updated successfully!');
            }
        );
    });

    // Sidebar navigation interception
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('data-href');
            if (href === '#' || !href) return;
            window.location.href = href;
        });
    });
}

document.addEventListener('DOMContentLoaded', init);
