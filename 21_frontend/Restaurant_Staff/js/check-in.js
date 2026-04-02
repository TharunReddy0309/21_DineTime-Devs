// Plain JavaScript array and global filters
let bookingList = [];
let expandedBookingIds = new Set();
let currentStaffRestaurant = 'Spice Garden';
let filters = {
    search: '',
    date: new Date().toISOString().split('T')[0], // Default to current date
    time: 'All'         // Default to all times
};

// Auth Guard
function checkAuth() {
    const session = localStorage.getItem('dinetime_session');
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    const sessionData = JSON.parse(session);
    if (sessionData && sessionData.restaurant) {
        currentStaffRestaurant = sessionData.restaurant;
        // Dynamically update the header text
        const brandTextEl = document.querySelector('.brand-text span');
        if (brandTextEl) {
            brandTextEl.textContent = currentStaffRestaurant;
        }
    }
    return true;
}

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    loadProfileName();
    loadBookingsFromStorage();
    resolvePastBookings(); // Clean up past dates on start
    setupEventListeners();
    
    // Set initial UI states for filters
    const dateInput = document.getElementById('filter-date');
    if (dateInput) {
        dateInput.value = filters.date;
    }
    
    updateStats();
    renderBookings();
});

// Load saved profile name from storage
function loadProfileName() {
    const saved = localStorage.getItem('dinetime_profile');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.name) {
            const userNameEl = document.querySelector('.user-name');
            if (userNameEl) userNameEl.textContent = data.name;
        }
    }
}

// Load booking items from local storage, or insert default mock data if empty
function loadBookingsFromStorage() {
    let shouldSeed = !localStorage.getItem('dinetime_bookings_seeded');
    const storedData = localStorage.getItem('dinetime_bookings_v5'); 

    if (storedData) {
        bookingList = JSON.parse(storedData);
    } else {
        bookingList = [];
    }

    if (shouldSeed) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

        const mockData = [
            // --- YESTERDAY (6 Reservations) ---
            { id: 'DT-10001', name: 'Amit Verma', phone: '+91 98765 00001', date: yesterday, time: '7:00 PM', guests: 2, email: 'amit@example.com', table: 'Table 1', status: 'Checked-In' },
            { id: 'DT-10002', name: 'Sania Mirza', phone: '+91 98765 00002', date: yesterday, time: '7:30 PM', guests: 4, email: 'sania@example.com', table: 'Table 2', status: 'No-Show' },
            { id: 'DT-10003', name: 'Peter Parker', phone: '+91 98765 00003', date: yesterday, time: '8:00 PM', guests: 2, email: 'peter@example.com', table: 'Table 3', status: 'Checked-In' },
            { id: 'DT-10004', name: 'Ananya Roy', phone: '+91 98765 00004', date: yesterday, time: '8:30 PM', guests: 6, email: 'ananya@example.com', table: 'Table 4', status: 'Checked-In' },
            { id: 'DT-10005', name: 'Rohan Khanna', phone: '+91 98765 00005', date: yesterday, time: '9:00 PM', guests: 2, email: 'rohan@example.com', table: 'Table 5', status: 'No-Show' },
            { id: 'DT-10006', name: 'Sneha Nair', phone: '+91 98765 00006', date: yesterday, time: '9:30 PM', guests: 4, email: 'sneha@example.com', table: 'Table 6', status: 'Checked-In' },

            // --- TODAY (6 Reservations) ---
            { id: 'DT-20001', name: 'Rahul Sharma', phone: '+91 98765 43210', date: today, time: '7:00 PM', guests: 4, email: 'rahul@example.com', table: 'Table 12', status: 'Checked-In' },
            { id: 'DT-20002', name: 'Priya Verma', phone: '+91 98765 43211', date: today, time: '7:15 PM', guests: 2, email: 'priya@example.com', table: 'Table 14', status: 'Upcoming' },
            { id: 'DT-20003', name: 'Arjun Mehta', phone: '+91 98765 43212', date: today, time: '7:45 PM', guests: 3, email: 'arjun@example.com', table: 'Table 15', status: 'No-Show' },
            { id: 'DT-20004', name: 'Sanjay Gupta', phone: '+91 98765 43213', date: today, time: '8:00 PM', guests: 4, email: 'sanjay@example.com', table: 'Table 16', status: 'Upcoming' },
            { id: 'DT-20005', name: 'Lakshmi Iyer', phone: '+91 98765 43214', date: today, time: '8:30 PM', guests: 2, email: 'lakshmi@example.com', table: 'Table 17', status: 'Checked-In' },
            { id: 'DT-20006', name: 'Snehal Gupta', phone: '+91 98765 43215', date: today, time: '9:00 PM', guests: 5, email: 'snehal@example.com', table: 'Table 18', status: 'Upcoming' },

            // --- TOMORROW (6 Reservations) ---
            { id: 'DT-30001', name: 'Vikram Singh', phone: '+91 98765 11111', date: tomorrow, time: '6:00 PM', guests: 2, email: 'vikram@example.com', table: 'Table 7', status: 'Upcoming' },
            { id: 'DT-30002', name: 'Meera Reddy', phone: '+91 98765 11112', date: tomorrow, time: '6:30 PM', guests: 4, email: 'meera@example.com', table: 'Table 8', status: 'Upcoming' },
            { id: 'DT-10015', name: 'Naveen Kumar', phone: '+91 98765 11113', date: tomorrow, time: '7:00 PM', guests: 6, email: 'naveen@example.com', table: 'Table 9', status: 'Upcoming' },
            { id: 'DT-10016', name: 'Simran Kaur',  phone: '+91 98765 11114', date: tomorrow, time: '7:30 PM', guests: 2, email: 'simran@example.com', table: 'Table 10', status: 'Upcoming' },
            { id: 'DT-10017', name: 'Vishal Sharma',  phone: '+91 98765 11115', date: tomorrow, time: '8:00 PM', guests: 3, email: 'vishal@example.com', table: 'Table 11', status: 'Upcoming' },
            { id: 'DT-10018', name: 'Deepa Menon',   phone: '+91 98765 11116', date: tomorrow, time: '8:30 PM', guests: 8, email: 'deepa@example.com', table: 'Table 13', status: 'Upcoming' }
        ];
        // Distribute the original mock data across different restaurants
        const rests = ['Spice Garden', 'Sushi Master', 'Burger Joint'];
        const mockDataWithRests = mockData.map((b, i) => ({
            ...b,
            restaurant: rests[i % rests.length]
        }));
        
        bookingList = bookingList.concat(mockDataWithRests);
        localStorage.setItem('dinetime_bookings_seeded', 'true');
        saveBookingsToStorage();
    } else {
        // Retro-actively distribute any existing records that lack the restaurant field.
        let needsUpdate = false;
        const rests = ['Spice Garden', 'Sushi Master', 'Burger Joint'];
        bookingList = bookingList.map((b, i) => {
            if (!b.restaurant) {
                needsUpdate = true;
                return { ...b, restaurant: rests[i % rests.length] };
            }
            return b;
        });
        if (needsUpdate) {
            saveBookingsToStorage();
        }
    }
}

// Save the current bookingList back to local storage
function saveBookingsToStorage() {
    localStorage.setItem('dinetime_bookings_v5', JSON.stringify(bookingList));
}

// Logic to "heal" past days - Upcoming should become No-Show
function resolvePastBookings() {
    const today = new Date().toISOString().split('T')[0];
    let changed = false;

    bookingList.forEach(booking => {
        if (booking.date < today && booking.status === 'Upcoming') {
            booking.status = 'No-Show';
            changed = true;
        }
    });

    if (changed) {
        saveBookingsToStorage();
        updateStats();
    }
}

// Logic to update a table status in the central dinetime_tables storage
function updateTableStatus(tableId, newStatus, guestsCount = 0) {
    const storedTables = localStorage.getItem('dinetime_tables');
    if (!storedTables) return;
    
    let tableList = JSON.parse(storedTables);
    const tableIndex = tableList.findIndex(t => t.id === tableId);
    
    if (tableIndex !== -1) {
        tableList[tableIndex].status = newStatus;
        if (newStatus === 'Occupied') {
            tableList[tableIndex].guests = guestsCount;
            tableList[tableIndex].time = 'Just now';
        }
        localStorage.setItem('dinetime_tables', JSON.stringify(tableList));
    }
}

// Helper to convert 24h (14:30) to 12h (2:30 PM)
function convertTo12Hour(time24) {
    if (!time24) return 'All';
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const m = minutes;
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${m} ${ampm}`;
}

// Bind top-level interaction logic
function setupEventListeners() {
    // 1. Search filter
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filters.search = e.target.value.toLowerCase();
            renderBookings();
        });
    }

    // 2. Date filter
    const dateInput = document.getElementById('filter-date');
    if (dateInput) {
        dateInput.addEventListener('change', (e) => {
            filters.date = e.target.value;
            renderBookings();
        });
    }

    // 3. Time slot input (Flexible Time)
    const timeSlotInput = document.getElementById('time-slot-input');
    if (timeSlotInput) {
        timeSlotInput.addEventListener('input', (e) => {
            const val = e.target.value;
            filters.time = convertTo12Hour(val);
            const timeDisplay = document.getElementById('selected-time-slot');
            if (timeDisplay) {
                timeDisplay.innerText = filters.time === 'All' ? 'All Times' : filters.time;
            }
            renderBookings();
        });
    }

    // 4. Notifications modal
    const bellBtn = document.getElementById('notification-bell');
    const notifyModal = document.getElementById('notifications-modal');
    const closeNotify = document.getElementById('close-notifications');

    if (bellBtn && notifyModal && closeNotify) {
        bellBtn.addEventListener('click', () => {
            notifyModal.classList.add('active');
        });

        closeNotify.addEventListener('click', () => {
            notifyModal.classList.remove('active');
        });

        // Close on clicking overlay
        notifyModal.addEventListener('click', (e) => {
            if (e.target === notifyModal) {
                notifyModal.classList.remove('active');
            }
        });
    }

    // 5. Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('dinetime_session');
            window.location.href = 'login.html';
        });
    }

    // 6. Add Walk-In modal logic
    const addTrigger = document.getElementById('add-walkin-trigger');
    const walkinModal = document.getElementById('add-walkin-modal');
    const closeWalkin = document.getElementById('close-walkin-modal');
    const cancelWalkin = document.getElementById('cancel-walkin');
    const walkinForm = document.getElementById('add-walkin-form');

    if (addTrigger && walkinModal) {
        addTrigger.addEventListener('click', () => {
            walkinModal.classList.add('active');
            // Default walk-in time to now
            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            document.getElementById('walkin-time').value = `${h}:${m}`;
        });

        const closeModalFunc = () => {
            walkinModal.classList.remove('active');
            walkinForm.reset();
        };

        closeWalkin.addEventListener('click', closeModalFunc);
        cancelWalkin.addEventListener('click', closeModalFunc);
        
        walkinModal.addEventListener('click', (e) => {
            if (e.target === walkinModal) closeModalFunc();
        });

        walkinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const tableNumStr = document.getElementById('walkin-table').value;
            const tableId = parseInt(tableNumStr.replace('Table ', ''));
            const guestsCount = document.getElementById('walkin-guests').value;

            const name = document.getElementById('walkin-name').value;
            const phone = document.getElementById('walkin-phone').value;
            const attendees = document.getElementById('walkin-guests').value;
            const timeVal = document.getElementById('walkin-time').value;

            if (!/^\d{10}$/.test(phone)) {
                showToast('Phone number must be exactly 10 digits.', 'error');
                return;
            }

            const newGuest = {
                id: 'WK-' + Math.floor(Math.random() * 90000 + 10000),
                name: name,
                phone: phone,
                guests: attendees,
                time: convertTo12Hour(timeVal),
                date: new Date().toISOString().split('T')[0],
                status: 'Checked-In',
                table: tableNumStr,
                restaurant: currentStaffRestaurant
            };

            // Sync Table Status to 'Occupied'
            updateTableStatus(tableId, 'Occupied', parseInt(guestsCount));

            bookingList.unshift(newGuest); // Add to top
            saveBookingsToStorage();
            updateStats();
            renderBookings();
            closeModalFunc();
            
            // Show brief success alert (optional, but premium)
            showToast('Guest verified and added to today\'s list!');
        });
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type === 'error' ? 'error' : ''}`;
    const icon = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showConfirmModal(title, message, onConfirm) {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const btnCancel = document.getElementById('btnModalCancel');
    const btnConfirm = document.getElementById('btnModalConfirm');

    if (!overlay || !titleEl || !msgEl) return;

    titleEl.innerText = title;
    msgEl.innerText = message;
    overlay.classList.add('active');

    const closeModal = () => {
        overlay.classList.remove('active');
        btnConfirm.onclick = null;
        btnCancel.onclick = null;
    };

    btnConfirm.onclick = () => {
        onConfirm();
        closeModal();
    };
    btnCancel.onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

// Helper to extract table ID from "Table X" string
function parseTableId(tableStr) {
    if (!tableStr || typeof tableStr !== 'string') return null;
    const match = tableStr.match(/Table (\d+)/);
    return match ? parseInt(match[1]) : null;
}

// Render out the dynamic list of reservations from our JS array
function renderBookings() {
    const container = document.getElementById('bookings-list');
    if (!container) return;
    
    container.innerHTML = ''; 

    // Apply combined filters (AND logic)
    const filteredList = bookingList.filter(booking => {
        // Enforce restaurant routing
        const bookingRest = booking.restaurant || 'Spice Garden';
        if (bookingRest !== currentStaffRestaurant) return false;

        const matchesSearch = !filters.search || 
                             booking.name.toLowerCase().includes(filters.search) || 
                             booking.id.toLowerCase().includes(filters.search);
        
        const matchesDate = !filters.date || booking.date === filters.date;
        const matchesTime = filters.time === 'All' || booking.time === filters.time;

        return matchesSearch && matchesDate && matchesTime;
    });

    // Toggle showing status logic
    const timeDisplay = document.getElementById('selected-time-slot');
    if (timeDisplay) {
        timeDisplay.innerText = filters.time === 'All' ? 'All Times' : filters.time;
    }

    // Check if list is empty
    if (filteredList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px; color:var(--text-muted); background:white; border-radius:12px;">
                <i class="fa-regular fa-calendar-xmark" style="font-size:2rem; margin-bottom:12px; display:block;"></i>
                No reservations found for the selected filters.
            </div>
        `;
    }

    filteredList.forEach(booking => {
        const item = document.createElement('div');
        const isExpanded = expandedBookingIds.has(booking.id);
        
        item.className = `booking-item ${isExpanded ? 'expanded' : ''}`;
        item.dataset.id = booking.id;

        // Figure out status aesthetics
        let statusClass = 'upcoming';
        if (booking.status === 'Checked-In') statusClass = 'checked-in';
        if (booking.status === 'No-Show') statusClass = 'noshow';

        const initials = booking.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        item.innerHTML = `
            <div class="customer-info" style="grid-column: 1 / 2;">
                <div class="customer-avatar">${initials}</div>
                <div class="customer-details">
                    <h4>${booking.name} <span class="status-badge ${statusClass}">• ${booking.status === 'Checked-In' ? 'Verified' : booking.status}</span></h4>
                    <span class="booking-id"># ${booking.id}</span>
                </div>
            </div>

            <div class="action-buttons" style="grid-column: 3 / 4; justify-self: end;">
                <button class="action-icon" title="Contact Customer"><i class="fa-solid fa-phone"></i></button>
                <button class="action-icon view-btn ${isExpanded ? 'active' : ''}" title="View Details">
                    <i class="fa-regular fa-eye"></i>
                </button>
                ${booking.status === 'Upcoming' ? `
                    <button class="action-icon delete delete-btn" title="Mark as No-Show"><i class="fa-solid fa-user-xmark"></i></button>
                    <button class="btn-green check-in-btn"><i class="fa-regular fa-circle-check"></i> Check In</button>
                ` : ''}
                ${booking.status === 'Checked-In' ? `
                    <button class="btn-secondary" style="border-color:#ecfdf5; background:#ecfdf5; color:var(--success-green); cursor:default;" disabled><i class="fa-solid fa-circle-check"></i> Verified</button>
                ` : ''}
                ${booking.status === 'No-Show' ? `
                    <button class="btn-secondary" style="border-color:#fee2e2; background:#fef2f2; color:var(--error-red); cursor:default;" disabled><i class="fa-solid fa-user-xmark"></i> No-Show</button>
                ` : ''}
            </div>
            
            <div class="reservation-details" style="grid-column: 1 / 4;">
                <div class="detail-col">
                    <span class="detail-label">Reservation ID</span>
                    <span class="detail-value" style="font-weight: 600; color: #1D1D1D;">${booking.id}</span>
                </div>
                <div class="detail-col">
                    <span class="detail-label">Time Slot</span>
                    <span class="detail-value" style="font-weight: 600; color: #1D1D1D;">${booking.time}</span>
                </div>
                <div class="detail-col">
                    <span class="detail-label">Party Size</span>
                    <span class="detail-value" style="font-weight: 600; color: #1D1D1D;">${booking.guests} Guests</span>
                </div>
                <div class="detail-col">
                    <span class="detail-label">Table Assigned</span>
                    <span class="detail-value" style="font-weight: 600; color: #1D1D1D;">${booking.table}</span>
                </div>
                <div class="detail-col">
                    <span class="detail-label">Contact</span>
                    <span class="detail-value" style="font-weight: 600; color: #1D1D1D;">${booking.phone}</span>
                </div>
                <div class="detail-col">
                    <span class="detail-label">Status</span>
                    <span class="detail-value" style="font-weight: 600; color: #1D1D1D; text-transform: capitalize;">${booking.status}</span>
                </div>
            </div>
        `;

        // Toggle Details click handler
        const viewBtn = item.querySelector('.view-btn');
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (expandedBookingIds.has(booking.id)) {
                expandedBookingIds.delete(booking.id);
            } else {
                expandedBookingIds.add(booking.id);
            }
            renderBookings();
        });

        // No-Show click handler
        const noShowBtn = item.querySelector('.delete-btn');
        if (noShowBtn) {
            noShowBtn.addEventListener('click', () => {
                showConfirmModal(
                    'Mark No-Show',
                    `Mark ${booking.name} as a No-Show for this reservation?`,
                    () => {
                        booking.status = 'No-Show';
                        saveBookingsToStorage();
                        
                        // Sync to Diner's view
                        try {
                            let dinerList = JSON.parse(localStorage.getItem('dinetime_v3_reservations')) || [];
                            let dRes = dinerList.find(r => r.id === booking.id);
                            if (dRes) {
                                dRes.status = 'Cancelled';
                                localStorage.setItem('dinetime_v3_reservations', JSON.stringify(dinerList));
                            }
                        } catch(e) {}

                        renderBookings();
                        updateStats();
                        showToast('Customer marked as No-Show.', 'error');
                    }
                );
            });
        }
        
        // Check-in click handler
        const checkInBtn = item.querySelector('.check-in-btn');
        if(checkInBtn) {
            checkInBtn.addEventListener('click', () => {
                showConfirmModal(
                    'Verify Check-In',
                    `Customer: ${booking.name}\nContact: ${booking.phone}\nGuests: ${booking.guests}\nAssigned: ${booking.table}\n\nProceed to check in this customer?`,
                    () => {
                        booking.status = 'Checked-In';
                        saveBookingsToStorage();
                        
                        // Sync to Diner's view
                        try {
                            let dinerList = JSON.parse(localStorage.getItem('dinetime_v3_reservations')) || [];
                            let dRes = dinerList.find(r => r.id === booking.id);
                            if (dRes) {
                                dRes.status = 'Completed';
                                localStorage.setItem('dinetime_v3_reservations', JSON.stringify(dinerList));
                            }
                        } catch(e) {}

                        renderBookings();
                        updateStats();
                        showToast(`Check-In successful for ${booking.name}.`);
                    }
                );
            });
        }

        container.appendChild(item);
    });

    // Update list badge logic
    const totalBadge = document.getElementById('list-total-badge');
    if (totalBadge) totalBadge.innerText = `${filteredList.length} total`;

    // Update the Summary Cards based on the current filter
    updateStats(filteredList);
}

// Computes derived arrays and populates basic summary fields from a specific list (usually filtered)
function updateStats(list = null) {
    if (!list) {
        list = bookingList.filter(b => (b.restaurant || 'Spice Garden') === currentStaffRestaurant);
    }
    const total = list.length;
    const checked = list.filter(b => b.status === 'Checked-In').length;
    const noshow = list.filter(b => b.status === 'No-Show').length;
    const pending = total - checked - noshow;

    const elTotal = document.getElementById('total-count');
    const elChecked = document.getElementById('checked-count');
    const elPending = document.getElementById('pending-count');
    const elNoShow = document.getElementById('noshow-count');

    if (elTotal) elTotal.innerText = total;
    if (elChecked) elChecked.innerText = checked;
    if (elPending) elPending.innerText = pending;
    if (elNoShow) elNoShow.innerText = noshow;
}
