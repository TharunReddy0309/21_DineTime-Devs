document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Steps
    const steps = [
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3')
    ];
    
    // Left Panel Elements
    const leftTitle = document.getElementById('left-panel-title');
    const leftDesc = document.getElementById('left-panel-desc');
    const feat2Text = document.getElementById('feat-2-text');
    const feat3Text = document.getElementById('feat-3-text');

    // Forms
    const form1 = document.getElementById('form-step-1');
    const form2 = document.getElementById('form-step-2');
    const form3 = document.getElementById('form-step-3');

    // Navigation Buttons
    const backToStep1 = document.getElementById('back-to-step-1');
    const backToStep2 = document.getElementById('back-to-step-2');
    const mapCoordsDisplay = document.getElementById('map-coords');
    const mapZoomDisplay = document.getElementById('map-zoom');
    const toStep2Btn = document.getElementById('btn-to-step-2');
    const toStep3Btn = document.getElementById('btn-to-step-3');


    // Map Variables
    let map = null;
    let marker = null;
    const defaultCoords = [12.9716, 77.5946]; // Bengaluru default


    // Data object to collect all registration info
    let registrationData = {
        account: {},
        restaurant: {},
        location: {}
    };

    // --- Utility: Show Toast ---
    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        if (type === 'error') toast.style.borderLeftColor = '#DC2626';
        
        toast.innerHTML = `
            <i class="ph ${type === 'error' ? 'ph-warning' : 'ph-check-circle'} toast-icon" style="color: ${type === 'error' ? '#DC2626' : 'var(--primary-green)'}"></i>
            <span class="toast-message">${message}</span>
        `;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('hiding'), 3000);
        setTimeout(() => toast.remove(), 3350);
    }

    // --- STEP NAVIGATION LOGIC ---
    function goToStep(stepNumber) {
        steps.forEach((s, idx) => {
            s.classList.toggle('active', idx === stepNumber - 1);
        });

        // Update Left Panel Content
        if (stepNumber === 1) {
            leftTitle.innerHTML = 'Register Your<br>Restaurant on<br>DineTime';
            leftDesc.innerText = 'Create a manager account to manage your restaurant, track reservations, and optimize seating capacity.';
            feat2Text.innerText = 'Monitor table availability';
            feat3Text.innerText = 'Grow your customer reach';
        } else if (stepNumber === 2) {
            leftTitle.innerHTML = 'Add Your Restaurant<br>to DineTime';
            leftDesc.innerText = 'List your restaurant so diners can discover it, reserve tables, and enjoy a seamless dining experience.';
            feat2Text.innerText = 'Optimize seating capacity';
            feat3Text.innerText = 'Grow your restaurant visibility';
        } else if (stepNumber === 3) {
            leftTitle.innerHTML = 'Set Your Restaurant<br>Location';
            leftDesc.innerText = 'Provide your restaurant address so diners can easily discover and navigate to your location.';
            feat2Text.innerText = 'Improve reservation accuracy';
            feat3Text.innerText = 'Support GPS-based restaurant search';
            
            // Initialize Map on step 3
            setTimeout(initRegistrationMap, 100);
        }

        // Scroll to top of card
        document.querySelector('.login-right').scrollTop = 0;
    }

    // --- MAP LOGIC ---
    function initRegistrationMap() {
        if (map) {
            map.invalidateSize();
            return;
        }

        // Initialize map
        map = L.map('reg-map-ui').setView(defaultCoords, 13);

        // Add OSM Tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add Draggable Marker
        const greenIcon = new L.Icon({
            iconUrl: '../images/map-marker-green.png',
            shadowUrl: '../images/map-marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        marker = L.marker(defaultCoords, {
            draggable: true,
            icon: greenIcon
        }).addTo(map);

        // Update coords on drag
        marker.on('dragend', function(e) {
            const position = marker.getLatLng();
            updateCoords(position.lat, position.lng);
        });

        // Update coords on map click
        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateCoords(e.latlng.lat, e.latlng.lng);
        });

        // Initial coord set
        updateCoords(defaultCoords[0], defaultCoords[1]);
        
        map.on('zoomend', () => {
            if (mapZoomDisplay) mapZoomDisplay.innerText = `Zoom ${map.getZoom()}`;
        });
    }

    function updateCoords(lat, lng) {
        const latFixed = lat.toFixed(6);
        const lngFixed = lng.toFixed(6);
        if (mapCoordsDisplay) mapCoordsDisplay.innerText = `${latFixed}, ${lngFixed}`;
        registrationData.location.coords = [lat, lng];
    }




    // --- STEP 1 LOGIC ---
    if (toStep2Btn) {
        toStep2Btn.addEventListener('click', () => {
            const name = document.getElementById('reg-name').value;
            const phone = document.getElementById('reg-phone').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirm = document.getElementById('reg-confirm').value;
            const license = document.getElementById('reg-license').value;
            const govId = document.getElementById('reg-gov-id').value;
            const authorized = document.getElementById('reg-auth').checked;

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.toLowerCase())) {
                document.getElementById('err-email').classList.add('show');
                return;
            } else {
                document.getElementById('err-email').classList.remove('show');
            }

            if (password.length < 8) {
                document.getElementById('err-pass').classList.add('show');
                return;
            } else {
                document.getElementById('err-pass').classList.remove('show');
            }

            if (password !== confirm) {
                document.getElementById('err-confirm').classList.add('show');
                return;
            } else {
                document.getElementById('err-confirm').classList.remove('show');
            }

            if (!license || !govId || !authorized || !name || !phone) {
                showToast('Please fill all required fields and authorize.', 'error');
                return;
            }

            // Regex for License (BL-XX-XXXX)
            const licenseRegex = /^BL-[A-Z]{2}-\d{4}$/;
            if (!licenseRegex.test(license.toUpperCase())) {
                const errLicense = document.getElementById('err-license');
                if(errLicense) errLicense.classList.add('show');
                showToast('Invalid Business License format (BL-XX-XXXX).', 'error');
                return;
            } else {
                if(document.getElementById('err-license')) document.getElementById('err-license').classList.remove('show');
            }

            // Regex for Gov ID (GOV-ID-XXXXXXXX)
            const govIdRegex = /^GOV-ID-\d{8}$/;
            if (!govIdRegex.test(govId.toUpperCase())) {
                const errGov = document.getElementById('err-gov-id');
                if(errGov) errGov.classList.add('show');
                showToast('Invalid Government ID format (GOV-ID-XXXXXXXX).', 'error');
                return;
            } else {
                if(document.getElementById('err-gov-id')) document.getElementById('err-gov-id').classList.remove('show');
            }

            if (!/^\d{10}$/.test(phone)) {
                document.getElementById('err-phone').classList.add('show');
                return;
            } else {
                if(document.getElementById('err-phone')) document.getElementById('err-phone').classList.remove('show');
            }

            // Verify email doesn't already exist
            try {
                const existingData = StorageManager.getRawData();
                if (existingData.users && existingData.users[email.toLowerCase()]) {
                    const errEmailExist = document.getElementById('err-email-exist');
                    if (errEmailExist) {
                        errEmailExist.classList.add('show');
                        document.getElementById('reg-email').addEventListener('input', () => {
                            errEmailExist.classList.remove('show');
                        }, {once: true});
                    } else {
                        showToast('This email is already registered. Please log in.', 'error');
                    }
                    return;
                } else {
                    const errEmailExist = document.getElementById('err-email-exist');
                    if (errEmailExist) errEmailExist.classList.remove('show');
                }
            } catch(e) {
                console.warn(e);
            }

            // Save data and move to step 2
            registrationData.account = { name, phone, email, password, license, govId };
            goToStep(2);
        });
    }


    // --- STEP 2 LOGIC ---
    // Image Upload Simulation
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('res-image-input');
    const imgPreview = document.getElementById('img-preview');
    const removeImgBtn = document.getElementById('remove-img');

    dropzone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imgPreview.style.backgroundImage = `url(${event.target.result})`;
                imgPreview.classList.add('active');
                registrationData.restaurant.image = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    removeImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        imgPreview.classList.remove('active');
        fileInput.value = '';
        delete registrationData.restaurant.image;
    });

    if (toStep3Btn) {
        toStep3Btn.addEventListener('click', () => {
            const name = document.getElementById('res-name').value;
            const cuisine = document.getElementById('res-cuisine').value;
            const desc = document.getElementById('res-desc').value;
            const phone = document.getElementById('res-phone').value;

            if (!name || !cuisine || !phone) {
                showToast('Please fill all required fields.', 'error');
                return;
            }

            if (!/^\d{10}$/.test(phone)) {
                showToast('Restaurant contact number must be exactly 10 digits.', 'error');
                return;
            }

            // Save data and move to step 3
            registrationData.restaurant = { 
                ...registrationData.restaurant,
                name, cuisine, desc, phone 
            };
            goToStep(3);
        });
    }


    backToStep1.addEventListener('click', () => goToStep(1));

    // --- STEP 3 LOGIC ---
    form3.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const address = document.getElementById('loc-address').value;
        const city = document.getElementById('loc-city').value;
        const zip = document.getElementById('loc-zip').value;
        const country = document.getElementById('loc-country').value;

        if (!address || !city || !zip || !country) {
            showToast('Please fill all required fields.', 'error');
            return;
        }

        if (!/^\d{6}$/.test(zip)) {
            showToast('Pincode must be exactly 6 digits.', 'error');
            return;
        }

        // Save location data
        registrationData.location = { 
            ...registrationData.location,
            address, city, zip, country 
        };


        // --- FINAL SUBMISSION ---
        finishRegistration();
    });

    backToStep2.addEventListener('click', () => goToStep(2));

    function finishRegistration() {
        showToast('Registering your restaurant...');
        
        // Use the new isolated registration method in StorageManager
        StorageManager.register(
            registrationData.account.email,
            registrationData.account,
            registrationData.restaurant,
            registrationData.location
        );

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html'; // Redirect to dashboard
        }, 1500);
    }


    // Password Toggle Utility
    document.querySelectorAll('.toggle-eye-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('ph-eye', 'ph-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('ph-eye-slash', 'ph-eye');
            }
        });
    });

    // Social Login Simulation
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.innerText.includes('Google') ? 'Google' : 'Apple';
            showToast(`<i class="ph ph-circle-notch ph-spin" style="margin-right: 8px;"></i> Establishing secure connection with ${provider}...`, 'info');
        });
    });
});

