document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eye-icon');

    // Toggle Password Visibility
    if (togglePasswordBtn && passwordInput && eyeIcon) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle Icon
            eyeIcon.classList.toggle('ph-eye');
            eyeIcon.classList.toggle('ph-eye-slash');
        });
    }

    // Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value.trim();
            const errorMsg = document.getElementById('login-error-msg');
            errorMsg.classList.add('hidden');

            // Define Demo Accounts
            const demoAccounts = {
                'johndoe@gmail.com': {
                    password: 'password123',
                    data: {
                        name: "John Doe",
                        email: "johndoe@gmail.com",
                        phone: "+91 98765 43210",
                        location: "HSR Layout, Bangalore",
                        city: "Bangalore",
                        pincode: "560102",
                        country: "India",
                        avatar: "../images/icon-profile.png",
                        joinDate: "January 2026",
                        lat: 12.9716,
                        lng: 77.5946
                    },
                    hasDemoReservations: true
                },
                'rahulsharma@spicegarden.com': {
                    password: 'admin123',
                    data: {
                        name: "Rahul Sharma",
                        email: "rahulsharma@spicegarden.com",
                        phone: "+91 91234 56789",
                        location: "MG Road, Bangalore",
                        city: "Bangalore",
                        pincode: "560001",
                        country: "India",
                        avatar: "../images/avatar-1.jpg",
                        joinDate: "February 2026",
                        lat: 12.9756,
                        lng: 77.5946
                    },
                    hasDemoReservations: false // Manager demo persona, start clean on diner side
                }
            };

            const demoAcc = demoAccounts[email];

            if (demoAcc && demoAcc.password === password) {
                // Handle Demo Login
                DinetimeStore.setUser(demoAcc.data);

                if (demoAcc.hasDemoReservations) {
                    // Populate John Doe's sample data
                    DinetimeStore.setReservations([
                        {
                            id: "RES-1049",
                            restaurant: "Spice Garden",
                            image: "../images/indian.jpg",
                            date: "15 April 2026",
                            time: "8:00 PM",
                            guests: 4,
                            status: "Confirmed",
                            tableType: "Indoor Seating",
                            location: "MG Road, Bangalore"
                        },
                        {
                            id: "RES-2841",
                            restaurant: "Green Bowl",
                            image: "../images/healthy.jpg",
                            date: "20 April 2026",
                            time: "1:00 PM",
                            guests: 2,
                            status: "Confirmed",
                            tableType: "Outdoor Seating",
                            location: "Jayanagar, Bangalore"
                        },
                        {
                            id: "RES-8291",
                            restaurant: "Sushi Master",
                            image: "../images/japanese.jpg",
                            date: "10 March 2026",
                            time: "7:30 PM",
                            guests: 2,
                            status: "Completed",
                            tableType: "Sushi Bar",
                            location: "Indiranagar, Bangalore",
                            hasRated: true,
                            rating: 5,
                            reviewText: "Amazing omakase experience! The chef was extremely attentive."
                        },
                        {
                            id: "RES-4452",
                            restaurant: "Burger Joint",
                            image: "../images/american.jpg",
                            date: "02 March 2026",
                            time: "8:00 PM",
                            guests: 3,
                            status: "Completed",
                            tableType: "Booth",
                            location: "Koramangala, Bangalore",
                            hasRated: false,
                            rating: 0,
                            reviewText: ""
                        },
                        {
                            id: "RES-9122",
                            restaurant: "Le Gourmet",
                            image: "../images/italian.jpg",
                            date: "14 February 2026",
                            time: "8:30 PM",
                            guests: 2,
                            status: "Completed",
                            tableType: "Window Seat",
                            location: "UB City, Bangalore",
                            hasRated: true,
                            rating: 4,
                            reviewText: "Fantastic atmosphere for Valentine's Day. The pasta was al dente."
                        },
                        {
                            id: "RES-3310",
                            restaurant: "Taco Fiesta",
                            image: "../images/mexican.jpg",
                            date: "05 January 2026",
                            time: "9:00 PM",
                            guests: 6,
                            status: "Cancelled",
                            tableType: "Bar Table",
                            location: "HSR Layout, Bangalore"
                        }
                    ]);
                } else {
                    // Other demo accounts (like Rahul) should start with empty records as per previous req
                    DinetimeStore.initNewUser();
                }
            } else {
                // Check if it's a persistent user from localStorage (v3 users list)
                const usersList = JSON.parse(localStorage.getItem('dinetime_v3_users_list')) || {};
                const registeredUser = usersList[email];

                if (registeredUser && registeredUser.password === password) {
                    // Valid registered user - but we need to check if they are currently active in store
                    const existingUser = DinetimeStore.getUser();
                    if (!existingUser || existingUser.email !== email) {
                        // User exists in list but not active store, we might need more data
                        // For simplicity, we assume the user object is already in 'dinetime_v3_user' 
                        // if they just registered. If not, we just check core validation.
                    }
                } else {
                    // Fallback to existing single-user check for dinetime_v3_user
                    const existingUser = DinetimeStore.getUser();
                    if (!existingUser || existingUser.email !== email || existingUser.password !== password) {
                        errorMsg.classList.remove('hidden');
                        setTimeout(() => errorMsg.classList.add('hidden'), 3500);
                        return;
                    }
                }
            }

            const btn = loginForm.querySelector('.btn-login');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Logging in...';

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
                
                // Redirect to browse.html on exact match only
                window.location.href = 'browse.html';
            }, 1000);
        });
    }


    // Social Login Simulation
    const socialBtns = document.querySelectorAll('.btn-social');
    const toastMsg = document.getElementById('login-error-msg');
    
    function showSocialToast(provider) {
        if (!toastMsg) return;
        
        const originalHTML = toastMsg.innerHTML;
        toastMsg.classList.remove('hidden');
        toastMsg.classList.add('social-toast');
        toastMsg.innerHTML = `<i class="ph ph-circle-notch"></i> Establishing secure connection with ${provider}...`;
        
        setTimeout(() => {
            toastMsg.classList.add('hidden');
            toastMsg.classList.remove('social-toast');
            toastMsg.innerHTML = originalHTML;
        }, 3000);
    }

    socialBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.innerText.includes('Google') ? 'Google' : 'Apple';
            showSocialToast(provider);
        });
    });

    // Demo Login Link
    const demoBtn = document.getElementById('demo-login-btn');
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('email').value = 'johndoe@gmail.com';
            document.getElementById('password').value = 'password123';
            
            // Hide error message if trying demo after failing
            const errorMsg = document.getElementById('login-error-msg');
            if(errorMsg) errorMsg.classList.add('hidden');
        });
    }

    // Forgot Password Modal Logic
    const forgotModal = document.getElementById('forgotPasswordModal');
    const linkForgotPassword = document.getElementById('linkForgotPassword');
    const closeForgotModal = document.getElementById('closeForgotModal');
    const forgotForm = document.getElementById('forgot-password-form');
    const resetSuccessMsg = document.getElementById('reset-success-msg');

    if (linkForgotPassword && forgotModal) {
        linkForgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            forgotModal.classList.remove('hidden');
            resetSuccessMsg.classList.add('hidden');
            forgotForm.style.display = 'block';
            forgotForm.reset();
        });
        
        closeForgotModal.addEventListener('click', () => {
            forgotModal.classList.add('hidden');
        });

        // Close when clicking outside content
        forgotModal.addEventListener('click', (e) => {
            if (e.target === forgotModal) {
                forgotModal.classList.add('hidden');
            }
        });

        forgotForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = forgotForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Sending...';

            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
                forgotForm.style.display = 'none';
                resetSuccessMsg.classList.remove('hidden');
                
                // Hide modal automatically after 3 seconds
                setTimeout(() => {
                    forgotModal.classList.add('hidden');
                }, 3000);
            }, 1000);
        });
    }
});
