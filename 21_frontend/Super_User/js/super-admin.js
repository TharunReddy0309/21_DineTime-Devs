/* =========================================================
   js/modules/super-admin.js
   Local Storage Persistent Logic + Domain Dictionary
   Version: V5 (Auto-resets cache to apply ID additions & 30 Restaurants)
   ========================================================= */

const TITLES = {
    dashboard: ['Global Dashboard', 'Real-time platform health and metrics.'],
    restaurants: ['Restaurant Management', 'Onboard, verify, and control network nodes.'],
    users: ['User Management', 'Global database of Diners, Restaurant Managers, and Restaurant Staff.'],
    reservations: ['Reservations', 'Track bookings, customer check-ins, and no-shows globally.'],
    payments: ['Payments', 'Platform-wide transaction oversight.'],
    reports: ['Reports & Analytics', 'Platform performance, operational hours, and dining insights.'],
    notifications: ['Broadcast Center', 'Send platform-wide alerts.'],
    audit: ['System Audit Logs', 'Complete trace of system actions.']
};

// INITIAL DATA ARRAYS (Expanded to 10 Restaurants for brevity here, matches your provided code)
const INIT_RESTAURANTS = [
    { id: "RES-1001", name: "Spice Garden", cuisine: "North Indian", tables: 20, address: "123 Main St", city: "Bangalore", pincode: "560001", managerName: "Rahul Sharma", managerEmail: "admin@spice.com", license: "12345678901234", timeSlots: "10 AM - 10 PM", status: "Verified", activeReservations: 2, lastActive: "2 mins ago" },
    { id: "RES-1002", name: "The Velvet Fork", cuisine: "Continental", tables: 15, address: "45 West Ave", city: "Mumbai", pincode: "400001", managerName: "Sarah Jenkins", managerEmail: "sarah@velvet.in", license: "99245678901234", timeSlots: "11 AM - 11 PM", status: "Suspended", activeReservations: 0, lastActive: "3 days ago" },
    { id: "RES-1003", name: "Sushi Central", cuisine: "Japanese", tables: 12, address: "Link Road", city: "Mumbai", pincode: "400050", managerName: "Kenji Sato", managerEmail: "kenji@sushi.in", license: "44545678901234", timeSlots: "12 PM - 10 PM", status: "Verified", activeReservations: 2, lastActive: "Just now" },
    { id: "RES-1004", name: "Tuscan Villa", cuisine: "Italian", tables: 25, address: "UB City", city: "Bangalore", pincode: "560001", managerName: "Marco Rossi", managerEmail: "marco@tuscan.com", license: "77845678901234", timeSlots: "10 AM - 11 PM", status: "Verified", activeReservations: 2, lastActive: "5 mins ago" },
    { id: "RES-1005", name: "Delhi Darbar", cuisine: "Mughlai", tables: 30, address: "Connaught", city: "Delhi", pincode: "110001", managerName: "Amit Khan", managerEmail: "amit@darbar.com", license: "11245678901234", timeSlots: "11 AM - 12 AM", status: "Pending", activeReservations: 1, lastActive: "1 hour ago" },
    { id: "RES-1006", name: "Burger Joint", cuisine: "Fast Food", tables: 10, address: "Bandra West", city: "Mumbai", pincode: "400050", managerName: "Priya Patel", managerEmail: "priya@burger.in", license: "33445678901234", timeSlots: "10 AM - 11 PM", status: "Verified", activeReservations: 1, lastActive: "10 mins ago" },
    { id: "RES-1007", name: "Vegan Bites", cuisine: "Healthy", tables: 18, address: "Indiranagar", city: "Bangalore", pincode: "560038", managerName: "John Doe", managerEmail: "john@vegan.com", license: "55645678901234", timeSlots: "9 AM - 9 PM", status: "Verified", activeReservations: 2, lastActive: "Just now" },
    { id: "RES-1008", name: "Dimsum House", cuisine: "Chinese", tables: 14, address: "Powai", city: "Mumbai", pincode: "400076", managerName: "Li Wei", managerEmail: "li@dimsum.in", license: "88945678901234", timeSlots: "11 AM - 11 PM", status: "Verified", activeReservations: 1, lastActive: "20 mins ago" },
    { id: "RES-1009", name: "Southern Spice", cuisine: "South Indian", tables: 22, address: "T Nagar", city: "Chennai", pincode: "600017", managerName: "Karthik Raj", managerEmail: "karthik@southern.in", license: "22145678901234", timeSlots: "7 AM - 10 PM", status: "Verified", activeReservations: 2, lastActive: "1 min ago" },
    { id: "RES-1010", name: "Hyderabad House", cuisine: "Biryani", tables: 28, address: "Jubilee Hills", city: "Hyderabad", pincode: "500033", managerName: "Syed Ali", managerEmail: "syed@hydhouse.com", license: "66345678901234", timeSlots: "12 PM - 12 AM", status: "Verified", activeReservations: 2, lastActive: "Just now" }
];

const INIT_USERS = [
    { id: "USR-001", name: "Rahul Sharma", email: "admin@spice.com", role: "Restaurant Manager", node: "Spice Garden", status: "Active" },
    { id: "USR-002", name: "Sarah Jenkins", email: "sarah@velvet.in", role: "Restaurant Manager", node: "The Velvet Fork", status: "Suspended" },
    { id: "USR-007", name: "Ravi Kumar", email: "ravi.staff@spice.com", role: "Restaurant Staff", node: "Spice Garden", status: "Active" },
    { id: "USR-008", name: "Anita Desai", email: "anita.staff@tuscan.com", role: "Restaurant Staff", node: "Tuscan Villa", status: "Active" },
    { id: "USR-012", name: "Neha Gupta", email: "neha.diner@gmail.com", role: "Diner", node: "N/A", status: "Active" },
    { id: "USR-014", name: "Pooja Reddy", email: "pooja.r@hotmail.com", role: "Diner", node: "N/A", status: "Suspended" },
    { id: "USR-015", name: "Aditya Verma", email: "aditya.v@gmail.com", role: "Diner", node: "N/A", status: "Active" },
    { id: "USR-016", name: "Fatima Noor", email: "fatima@nawabi.com", role: "Restaurant Manager", node: "Nawabi Feast", status: "Active" },
    { id: "USR-017", name: "Karan Desai", email: "karan@oceanview.in", role: "Restaurant Manager", node: "Ocean View", status: "Active" }
];

const INIT_RESERVATIONS = [
    { id: "BKG-88421", dinerName: "Neha Gupta", dinerId: "USR-012", restaurantName: "Spice Garden", restaurantId: "RES-1001", date: "2026-03-30", time: "19:30", party: 4, status: "Booking" },
    { id: "BKG-88419", dinerName: "Aditya Verma", dinerId: "USR-015", restaurantName: "Tuscan Villa", restaurantId: "RES-1004", date: "2026-03-30", time: "20:00", party: 2, status: "Customer Check-In" },
    { id: "BKG-88407", dinerName: "Pooja Reddy", dinerId: "USR-014", restaurantName: "Delhi Darbar", restaurantId: "RES-1005", date: "2026-03-31", time: "18:00", party: 6, status: "No-Show" },
    { id: "BKG-88390", dinerName: "Karan Desai", dinerId: "USR-017", restaurantName: "Sushi Central", restaurantId: "RES-1003", date: "2026-03-30", time: "13:00", party: 3, status: "Booking" },
    { id: "BKG-88385", dinerName: "Amit Khan", dinerId: "USR-005", restaurantName: "Ocean View", restaurantId: "RES-1011", date: "2026-03-31", time: "20:30", party: 2, status: "Customer Check-In" }
];

const INIT_PAYMENTS = [
    { id: "TRANSACTION-9928401", user: "Neha Gupta", userId: "USR-012", restaurant: "Spice Garden", restaurantId: "RES-1001", amount: "₹500", method: "UPI", status: "Success" },
    { id: "TRANSACTION-9928389", user: "Aditya Verma", userId: "USR-015", restaurant: "Tuscan Villa", restaurantId: "RES-1004", amount: "₹1,000", method: "Card", status: "Success" },
    { id: "TRANSACTION-9928301", user: "Pooja Reddy", userId: "USR-014", restaurant: "Delhi Darbar", restaurantId: "RES-1005", amount: "₹300", method: "Netbanking", status: "Failed" },
    { id: "TRANSACTION-9928210", user: "Karan Desai", userId: "USR-017", restaurant: "Sushi Central", restaurantId: "RES-1003", amount: "₹300", method: "UPI", status: "Refunded" }
];

const INIT_AUDIT = [
    { time: "14:32:18", message: "Super Admin approved Restaurant <code style='background:#f0f0f0;padding:2px 4px;border-radius:4px;color:#333;font-size:0.8rem;'>Spice Garden</code>" },
    { time: "13:51:04", message: "User <code style='background:#f0f0f0;padding:2px 4px;border-radius:4px;color:#333;font-size:0.8rem;'>pooja.r@hotmail.com</code> suspended for policy violation" },
    { time: "10:30:15", message: "Payment Gateway settings updated globally" },
    { time: "09:15:00", message: "Broadcast notification sent to all Diners" }
];

// INITIALIZATION (Using v5 keys)
window.onload = function() {
    if(!localStorage.getItem('dt_admin_res_v5')) localStorage.setItem('dt_admin_res_v5', JSON.stringify(INIT_RESTAURANTS));
    if(!localStorage.getItem('dt_admin_usr_v5')) localStorage.setItem('dt_admin_usr_v5', JSON.stringify(INIT_USERS));
    if(!localStorage.getItem('dt_admin_bkg_v5')) localStorage.setItem('dt_admin_bkg_v5', JSON.stringify(INIT_RESERVATIONS));
    if(!localStorage.getItem('dt_admin_pay_v5')) localStorage.setItem('dt_admin_pay_v5', JSON.stringify(INIT_PAYMENTS));
    if(!localStorage.getItem('dt_admin_log_v5')) localStorage.setItem('dt_admin_log_v5', JSON.stringify(INIT_AUDIT));
    
    // Seed Auth Defaults
    if(!localStorage.getItem('admin_email')) localStorage.setItem('admin_email', 'admin@dinetime.com');
    if(!localStorage.getItem('admin_password')) localStorage.setItem('admin_password', 'admin123');

    var savedTab = localStorage.getItem('dt_active_tab_v5') || 'dashboard';
    switchTab(savedTab);

    renderGlobalTable();
    renderUsersTable();
    renderReservationsTable();
    renderPaymentsTable();
    renderAuditLogs();
    generateReport();

    // Setup Restaurant Form
    var superForm = document.getElementById('superForm');
    if(superForm) {
        superForm.onsubmit = function(event) {
            event.preventDefault(); 
            
            // STRICT JS VALIDATIONS (As fallback to HTML5 Pattern Validation)
            const pincodeVal = document.getElementById('resPincode').value;
            if (!/^\d{6}$/.test(pincodeVal)) {
                showToast("Pincode must be exactly 6 digits.", "error");
                return;
            }

            const emailVal = document.getElementById('resManagerEmail').value;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                showToast("Invalid manager email format.", "error");
                return;
            }

            const fssaiVal = document.getElementById('resLicense').value;
            if (!/^\d{14}$/.test(fssaiVal)) {
                showToast("FSSAI License must be exactly 14 digits.", "error");
                return;
            }
            
            var saveBtn = document.getElementById('saveNodeBtn');
            saveBtn.innerHTML = "Processing...";

            setTimeout(function() {
                var newRes = {
                    name: document.getElementById('resName').value,
                    cuisine: document.getElementById('resCuisine').value,
                    tables: parseInt(document.getElementById('resTables').value),
                    address: document.getElementById('resAddress').value,
                    city: document.getElementById('resCity').value,
                    pincode: pincodeVal,
                    managerName: document.getElementById('resManagerName').value,
                    managerEmail: emailVal,
                    license: fssaiVal,
                    timeSlots: document.getElementById('resTimeSlots').value,
                    status: document.getElementById('resStatus').value,
                    activeReservations: 0, 
                    lastActive: "Just now"
                };

                var editingId = document.getElementById('resId').value;
                var isNew = true;
                let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5'));

                if (editingId !== "") {
                    for (var i = 0; i < resData.length; i++) {
                        if (resData[i].id === editingId) {
                            newRes.id = editingId;
                            newRes.activeReservations = resData[i].activeReservations;
                            resData[i] = newRes; 
                            isNew = false; break;
                        }
                    }
                } else {
                    newRes.id = "RES-" + Math.floor(Math.random() * 9000 + 1000);
                    resData.push(newRes); 
                }

                localStorage.setItem('dt_admin_res_v5', JSON.stringify(resData));
                closeRestaurantModal();
                renderGlobalTable();
                saveBtn.innerHTML = "Save Restaurant";
                showToast(isNew ? "Restaurant added to platform." : "Restaurant updated.", "success");
                addAuditLog(isNew ? "Created new restaurant " + newRes.name : "Modified restaurant " + newRes.name);
            }, 400);
        };
    }

    // Setup User Form
    var userForm = document.getElementById('userForm');
    if(userForm) {
        userForm.onsubmit = function(event) {
            event.preventDefault();
            
            // STRICT JS EMAIL VALIDATION
            const userEmailVal = document.getElementById('userEmail').value;
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmailVal)) {
                showToast("Invalid user email format.", "error");
                return;
            }
            
            var newUser = {
                name: document.getElementById('userName').value,
                email: userEmailVal,
                role: document.getElementById('userRole').value,
                node: document.getElementById('userRole').value === 'Diner' ? 'N/A' : document.getElementById('userNode').value,
                status: document.getElementById('userStatus').value
            };

            var editingId = document.getElementById('userId').value;
            let usrData = JSON.parse(localStorage.getItem('dt_admin_usr_v5'));
            var isNew = true;

            if (editingId !== "") {
                for (var i = 0; i < usrData.length; i++) {
                    if (usrData[i].id === editingId) {
                        newUser.id = editingId;
                        usrData[i] = newUser; 
                        isNew = false; break;
                    }
                }
            } else {
                newUser.id = "USR-" + Math.floor(Math.random() * 900 + 100);
                usrData.push(newUser); 
            }

            localStorage.setItem('dt_admin_usr_v5', JSON.stringify(usrData));
            closeUserModal();
            renderUsersTable();
            showToast(isNew ? "User added successfully." : "User details updated.", "success");
            addAuditLog(isNew ? "Created new user account for " + newUser.email : "Modified user account " + newUser.email);
        };
    }

    // Setup Reservation Form
    var reservationForm = document.getElementById('reservationForm');
    if(reservationForm) {
        reservationForm.onsubmit = function(event) {
            event.preventDefault();
            
            var resSelect = document.getElementById('bkgRestaurant');
            var selectedResName = resSelect.options[resSelect.selectedIndex].text;
            var selectedResId = resSelect.value; 

            var newBkg = {
                dinerName: document.getElementById('bkgDinerName').value,
                dinerId: document.getElementById('bkgDinerId').value || "GUEST",
                restaurantName: selectedResName,
                restaurantId: selectedResId,
                date: document.getElementById('bkgDate').value,
                time: document.getElementById('bkgTime').value,
                party: parseInt(document.getElementById('bkgParty').value),
                status: document.getElementById('bkgStatus').value
            };

            var editingId = document.getElementById('bkgId').value;
            let bkgData = JSON.parse(localStorage.getItem('dt_admin_bkg_v5')) || [];
            var isNew = true;

            if (editingId !== "") {
                for (var i = 0; i < bkgData.length; i++) {
                    if (bkgData[i].id === editingId) {
                        newBkg.id = editingId;
                        bkgData[i] = newBkg; 
                        isNew = false; break;
                    }
                }
            } else {
                newBkg.id = "BKG-" + Math.floor(Math.random() * 90000 + 10000);
                bkgData.push(newBkg); 
            }

            localStorage.setItem('dt_admin_bkg_v5', JSON.stringify(bkgData));
            closeReservationModal();
            renderReservationsTable();
            updateAllKPIs(); 
            showToast(isNew ? "Reservation added successfully." : "Reservation updated.", "success");
            addAuditLog(isNew ? "Created reservation for " + newBkg.dinerName : "Modified reservation " + newBkg.id);
        };
    }
};

// --- KPI MASTER SYNC ---
window.updateAllKPIs = function() {
    let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5')) || [];
    let usrData = JSON.parse(localStorage.getItem('dt_admin_usr_v5')) || [];

    var totalTables = 0, totalResvs = 0, pendingApps = 0;

    for (var i = 0; i < resData.length; i++) {
        totalTables += parseInt(resData[i].tables || 0);
        totalResvs += parseInt(resData[i].activeReservations || 0);
        if(resData[i].status === 'Pending') pendingApps++;
    }
    for (var j = 0; j < usrData.length; j++) {
        if(usrData[j].status === 'Pending') pendingApps++;
    }

    var totalRev = totalResvs * 850;
    var totalSeats = totalTables * 4; 

    var dBook = document.getElementById('dashTotalBookings');
    var dUsr = document.getElementById('dashTotalUsers');
    var dRes = document.getElementById('dashTotalRes');
    var dRev = document.getElementById('dashTotalRev');
    var dPend = document.getElementById('dashPendingApps');

    if(dBook) dBook.innerHTML = totalResvs.toLocaleString();
    if(dUsr) dUsr.innerHTML = (usrData.length + 31).toLocaleString(); 
    if(dRes) dRes.innerHTML = resData.length;
    if(dRev) dRev.innerHTML = "₹" + totalRev.toLocaleString('en-IN');
    if(dPend) dPend.innerHTML = pendingApps;

    var rRes = document.getElementById('resTabTotalRes');
    var rBook = document.getElementById('resTabActiveBooks');
    var rTab = document.getElementById('resTabTotalCapacity');

    if(rRes) rRes.innerHTML = resData.length;
    if(rBook) rBook.innerHTML = totalResvs;
    if(rTab) rTab.innerHTML = totalSeats + " <span style='font-size: 1rem; color: #666; font-weight: 500;'>seats</span>";
}

// --- RESTAURANTS CRUD & SEARCH ---
window.renderGlobalTable = function() {
    var tableBody = document.getElementById('globalRestaurantsBody');
    if (!tableBody) return;
    
    let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5'));
    updateAllKPIs(); 
    
    var searchQuery = document.getElementById('resDirectorySearch') ? document.getElementById('resDirectorySearch').value.toLowerCase() : '';
    var statusFilter = document.getElementById('resStatusFilter') ? document.getElementById('resStatusFilter').value : '';
    
    var filteredRes = resData.filter(function(r) {
        var matchesSearch = searchQuery === '' || r.name.toLowerCase().includes(searchQuery) || 
               r.city.toLowerCase().includes(searchQuery) || 
               r.id.toLowerCase().includes(searchQuery);
        var matchesStatus = statusFilter === '' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    tableBody.innerHTML = ""; 
    
    for (var i = 0; i < filteredRes.length; i++) {
        var res = filteredRes[i];
        var isVerified = (res.status === 'Verified');
        var statusColor = isVerified ? "#2E7D32" : (res.status === 'Pending' ? "#E65100" : "#C62828");

        var row = document.createElement('tr');
        row.innerHTML = 
            "<td><div style='font-weight: 800; font-size: 0.95rem; color: var(--text-dark);'>" + res.name + "</div><div style='font-size: 0.75rem; color: #666; margin-top: 4px;'><code style='background: #f0f0f0; padding: 2px 4px; border-radius: 4px;'>" + res.id + "</code> • " + res.city + "</div></td>" +
            "<td><div style='font-weight: 600; color: #1976D2;'>" + res.activeReservations + " Bookings</div><div style='font-size: 0.75rem; color: #888; margin-top: 4px;'>Capacity: " + (res.tables * 4) + " seats<br>Time Slots: " + res.timeSlots + "</div></td>" +
            "<td><div style='font-weight: 600;'>" + res.managerName + "</div><div style='font-size: 0.75rem; color: #666; margin-top: 4px;'>" + res.managerEmail + "</div></td>" +
            "<td><div style='font-weight: 700; color: " + statusColor + "; display: flex; align-items: center; gap: 6px;'><i class='fa-solid fa-circle' style='font-size: 0.5rem;'></i> " + res.status + "</div></td>" +
            "<td style='text-align: right; vertical-align: middle;'>" +
                "<div style='display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem;'>" +
                    "<button class='btn-outline btn-sm' style='color: #E67E22; border-color: #E67E22; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;' onclick='editRes(\"" + res.id + "\")' title='View / Edit'><i class='fa-solid fa-eye'></i></button>" +
                    "<button class='btn-outline btn-sm' style='color: #C62828; border-color: #ffcdd2; background: #FFEBEE; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;' onclick='deleteRes(\"" + res.id + "\", \"" + res.name.replace(/"/g, '&quot;') + "\")' title='Remove Node'><i class='fa-solid fa-trash'></i></button>" +
                "</div>" +
            "</td>";
        tableBody.appendChild(row);
    }
}

window.openRestaurantModal = function() {
    document.getElementById('superForm').reset();
    document.getElementById('resId').value = "";
    document.getElementById('superModalTitle').innerHTML = "Add Restaurant";
    document.getElementById('superModal').style.display = "flex";
}
window.closeRestaurantModal = function() { document.getElementById('superModal').style.display = "none"; }

window.editRes = function(id) {
    let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5'));
    var target = resData.find(r => r.id === id);
    if (target) {
        document.getElementById('resId').value = target.id;
        document.getElementById('resName').value = target.name;
        document.getElementById('resCuisine').value = target.cuisine;
        document.getElementById('resTables').value = target.tables;
        document.getElementById('resAddress').value = target.address;
        document.getElementById('resCity').value = target.city;
        document.getElementById('resPincode').value = target.pincode;
        document.getElementById('resManagerName').value = target.managerName;
        document.getElementById('resManagerEmail').value = target.managerEmail;
        document.getElementById('resLicense').value = target.license;
        document.getElementById('resTimeSlots').value = target.timeSlots || "10 AM - 10 PM";
        document.getElementById('resStatus').value = target.status;
        document.getElementById('superModalTitle').innerHTML = "View / Edit Restaurant";
        document.getElementById('superModal').style.display = "flex";
    }
}

function showConfirmModal(title, message, onConfirm) {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-message');
    const btnCancel = document.getElementById('btnModalCancel');
    const btnConfirm = document.getElementById('btnModalConfirm');

    titleEl.innerText = title;
    msgEl.innerText = message;
    overlay.style.display = 'flex';

    const closeModal = () => {
        overlay.style.display = 'none';
        btnConfirm.onclick = null;
        btnCancel.onclick = null;
    };

    btnConfirm.onclick = () => {
        onConfirm();
        closeModal();
    };
    btnCancel.onclick = closeModal;
    overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

window.deleteRes = function(id, name) {
    showConfirmModal(
        "Delete Restaurant",
        "CRITICAL WARNING: Removing [" + name + "] is irreversible. This will purge all associated data. Proceed?",
        () => {
            let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5'));
            resData = resData.filter(function(res) { return res.id !== id; });
            localStorage.setItem('dt_admin_res_v5', JSON.stringify(resData));
            renderGlobalTable();
            showToast("Restaurant removed.", "error");
            addAuditLog("Deleted restaurant " + name);
        }
    );
}

// --- USERS CRUD & SEARCH ---
window.renderUsersTable = function() {
    var tbody = document.getElementById('globalUsersBody');
    if (!tbody) return;
    
    let usrData = JSON.parse(localStorage.getItem('dt_admin_usr_v5'));
    let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5')) || [];
    updateAllKPIs(); 
    
    var searchQuery = document.getElementById('userDirectorySearch') ? document.getElementById('userDirectorySearch').value.toLowerCase() : '';
    var roleFilter = document.getElementById('userRoleFilter') ? document.getElementById('userRoleFilter').value : '';
    var statusFilter = document.getElementById('userStatusFilter') ? document.getElementById('userStatusFilter').value : '';
    
    var filteredUsers = usrData.filter(function(u) {
        var matchesSearch = searchQuery === '' || u.name.toLowerCase().includes(searchQuery) || 
               u.email.toLowerCase().includes(searchQuery) || 
               u.role.toLowerCase().includes(searchQuery) ||
               u.id.toLowerCase().includes(searchQuery);
        var matchesRole = roleFilter === '' || u.role === roleFilter;
        var matchesStatus = statusFilter === '' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    tbody.innerHTML = "";
    
    for(var i=0; i < filteredUsers.length; i++) {
        var u = filteredUsers[i];
        var badgeClass = u.role === "Diner" ? "badge-blue" : (u.role === "Restaurant Manager" ? "badge-yellow" : "badge-purple");
        var statusColor = u.status === "Active" ? "#2E7D32" : (u.status === "Pending" ? "#E65100" : "#C62828");
        
        let resObj = resData.find(r => r.name === u.node);
        let resDisplay = u.node === "N/A" ? "N/A" : (resObj ? `<code style='background: #f0f0f0; padding: 2px 4px; border-radius: 4px; color: var(--text-muted); font-size: 0.7rem;'>${resObj.id}</code><br><b style='display:inline-block; margin-top:4px;'>${u.node}</b>` : `<b>${u.node}</b>`);

        var row = document.createElement('tr');
        row.innerHTML = 
            "<td><code style='color:var(--text-muted); background: #f0f0f0; padding: 2px 4px; border-radius: 4px; font-size: 0.7rem;'>" + u.id + "</code><br><b style='display:inline-block; margin-top:4px;'>" + u.name + "</b><br><span style='font-size:0.75rem; color:#666;'>" + u.email + "</span></td>" +
            "<td><span class='badge " + badgeClass + "'>" + u.role + "</span></td>" +
            "<td>" + resDisplay + "</td>" +
            "<td style='color:" + statusColor + "; font-weight:bold;'>" + u.status + "</td>" +
            "<td style='text-align: right; vertical-align: middle;'>" +
                "<div style='display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem;'>" +
                    "<button class='btn-outline btn-sm' style='color: #E67E22; border-color: #E67E22; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;' onclick='editUser(\"" + u.id + "\")' title='View / Edit'><i class='fa-solid fa-eye'></i></button>" +
                    "<button class='btn-outline btn-sm' style='color: #C62828; border-color: #ffcdd2; background: #FFEBEE; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;' onclick='deleteUser(\"" + u.id + "\", \"" + u.email + "\")' title='Delete User'><i class='fa-solid fa-trash'></i></button>" +
                "</div>" +
            "</td>";
        tbody.appendChild(row);
    }
}

window.openUserModal = function() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = "";
    document.getElementById('userModalTitle').innerHTML = "Add User";
    toggleRestaurantField();
    document.getElementById('userModal').style.display = "flex";
}
window.closeUserModal = function() { document.getElementById('userModal').style.display = "none"; }

window.toggleRestaurantField = function() {
    var role = document.getElementById('userRole').value;
    var nodeGroup = document.getElementById('userRestaurantGroup');
    var nodeSelect = document.getElementById('userNode');
    
    if (role === 'Diner') {
        nodeGroup.style.display = 'none';
    } else {
        nodeGroup.style.display = 'block';
        let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5'));
        nodeSelect.innerHTML = '<option value="N/A">Select Restaurant...</option>';
        for(let r of resData) {
            nodeSelect.innerHTML += `<option value="${r.name}">${r.name}</option>`;
        }
    }
}

window.editUser = function(id) {
    let usrData = JSON.parse(localStorage.getItem('dt_admin_usr_v5'));
    var target = usrData.find(u => u.id === id);
    if (target) {
        document.getElementById('userId').value = target.id;
        document.getElementById('userName').value = target.name;
        document.getElementById('userEmail').value = target.email;
        document.getElementById('userRole').value = target.role;
        toggleRestaurantField();
        document.getElementById('userNode').value = target.node;
        document.getElementById('userStatus').value = target.status;
        
        document.getElementById('userModalTitle').innerHTML = "View / Edit User";
        document.getElementById('userModal').style.display = "flex";
    }
}

window.deleteUser = function(id, email) {
    showConfirmModal(
        "Delete Account",
        "Are you sure you want to delete the account for " + email + "? This action is permanent.",
        () => {
            let usrData = JSON.parse(localStorage.getItem('dt_admin_usr_v5'));
            usrData = usrData.filter(u => u.id !== id);
            localStorage.setItem('dt_admin_usr_v5', JSON.stringify(usrData));
            renderUsersTable();
            showToast("User deleted.", "error");
            addAuditLog("Deleted user account " + email);
        }
    );
}

// --- NEW: RESERVATIONS CRUD & SEARCH ---
window.renderReservationsTable = function() {
    var tbody = document.getElementById('globalReservationsBody');
    if (!tbody) return;
    
    var filterType = document.getElementById('resFilterType') ? document.getElementById('resFilterType').value : 'restaurantName';
    var searchQuery = document.getElementById('resSearchQuery') ? document.getElementById('resSearchQuery').value.toLowerCase() : '';
    var searchDate = document.getElementById('resSearchDate') ? document.getElementById('resSearchDate').value : '';
    var bookingStatusFilter = document.getElementById('resBookingStatusFilter') ? document.getElementById('resBookingStatusFilter').value : '';
    
    let bkgData = JSON.parse(localStorage.getItem('dt_admin_bkg_v5'));
    tbody.innerHTML = "";
    
    var filteredRes = bkgData.filter(function(r) {
        if (searchDate !== "" && r.date !== searchDate) return false;
        var matchesStatus = bookingStatusFilter === '' || r.status === bookingStatusFilter;
        if (!matchesStatus) return false;
        if (searchQuery === "") return true;
        if (filterType === "restaurantName") return r.restaurantName.toLowerCase().includes(searchQuery);
        if (filterType === "restaurantId") return r.restaurantId.toLowerCase().includes(searchQuery);
        if (filterType === "dinerName") return r.dinerName.toLowerCase().includes(searchQuery);
        if (filterType === "dinerId") return r.dinerId.toLowerCase().includes(searchQuery);
        return true;
    });

    for(var i=0; i < filteredRes.length; i++) {
        var r = filteredRes[i];
        var badgeHTML = "";
        if(r.status === "Booking") badgeHTML = "<span class='badge badge-blue'><i class='fa-solid fa-calendar'></i> Booking</span>";
        else if(r.status === "Customer Check-In") badgeHTML = "<span class='badge badge-green'><i class='fa-solid fa-check'></i> Check-In</span>";
        else if(r.status === "No-Show") badgeHTML = "<span class='badge badge-red'><i class='fa-solid fa-triangle-exclamation'></i> No-Show</span>";

        var row = document.createElement('tr');
        row.innerHTML = 
            "<td><code style='color:var(--text-muted)'>" + r.id + "</code><br><span style='font-size:0.75rem;'>" + r.date + " " + r.time + "</span></td>" +
            "<td><code style='background: #f0f0f0; padding: 2px 4px; border-radius: 4px; color: var(--text-muted); font-size: 0.7rem;'>" + r.dinerId + "</code><br><b style='display:inline-block; margin-top:4px;'>" + r.dinerName + "</b></td>" +
            "<td><code style='background: #f0f0f0; padding: 2px 4px; border-radius: 4px; color: var(--text-muted); font-size: 0.7rem;'>" + r.restaurantId + "</code><br><b style='display:inline-block; margin-top:4px;'>" + r.restaurantName + "</b></td>" +
            "<td>" + r.party + "</td>" +
            "<td>" + badgeHTML + "</td>" +
            "<td style='text-align: right; vertical-align: middle;'>" +
                "<div style='display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem;'>" +
                    "<button class='btn-outline btn-sm' style='color: #E67E22; border-color: #E67E22; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;' onclick='editReservation(\"" + r.id + "\")' title='View / Edit'><i class='fa-solid fa-eye'></i></button>" +
                    "<button class='btn-outline btn-sm' style='color: #C62828; border-color: #ffcdd2; background: #FFEBEE; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; padding: 0;' onclick='deleteReservation(\"" + r.id + "\", \"" + r.dinerName + "\")' title='Delete Reservation'><i class='fa-solid fa-trash'></i></button>" +
                "</div>" +
            "</td>";
        tbody.appendChild(row);
    }
}

window.openReservationModal = function() {
    document.getElementById('reservationForm').reset();
    document.getElementById('bkgId').value = "";
    document.getElementById('reservationModalTitle').innerHTML = "Add Reservation";
    
    // --- UPDATED: Restrict Date to Today and Any Future Date ---
    const today = new Date();
    // Format to YYYY-MM-DD for HTML5 date input
    const todayStr = today.toISOString().split('T')[0];

    const dateInput = document.getElementById('bkgDate');
    dateInput.min = todayStr;
    dateInput.removeAttribute('max'); // Removes the "tomorrow" limit
    // -----------------------------------------------------------

    let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5')) || [];
    let resSelect = document.getElementById('bkgRestaurant');
    resSelect.innerHTML = '<option value="">Select Restaurant...</option>';
    resData.forEach(r => {
        resSelect.innerHTML += `<option value="${r.id}">${r.name}</option>`;
    });
    
    document.getElementById('reservationModal').style.display = "flex";
}

window.closeReservationModal = function() { 
    document.getElementById('reservationModal').style.display = "none"; 
}

window.editReservation = function(id) {
    let bkgData = JSON.parse(localStorage.getItem('dt_admin_bkg_v5')) || [];
    var target = bkgData.find(r => r.id === id);
    if (target) {
        document.getElementById('bkgId').value = target.id;
        document.getElementById('bkgDinerName').value = target.dinerName;
        document.getElementById('bkgDinerId').value = target.dinerId;
        
        let resData = JSON.parse(localStorage.getItem('dt_admin_res_v5')) || [];
        let resSelect = document.getElementById('bkgRestaurant');
        resSelect.innerHTML = '<option value="">Select Restaurant...</option>';
        resData.forEach(r => {
            resSelect.innerHTML += `<option value="${r.id}" ${r.id === target.restaurantId ? 'selected' : ''}>${r.name}</option>`;
        });
        
        document.getElementById('bkgDate').value = target.date;
        document.getElementById('bkgTime').value = target.time;
        document.getElementById('bkgParty').value = target.party;
        document.getElementById('bkgStatus').value = target.status;
        
        document.getElementById('reservationModalTitle').innerHTML = "View / Edit Reservation";
        document.getElementById('reservationModal').style.display = "flex";
    }
}

window.deleteReservation = function(id, dinerName) {
    showConfirmModal(
        "Delete Reservation",
        "Are you sure you want to delete the reservation for " + dinerName + "?",
        () => {
            let bkgData = JSON.parse(localStorage.getItem('dt_admin_bkg_v5')) || [];
            bkgData = bkgData.filter(r => r.id !== id);
            localStorage.setItem('dt_admin_bkg_v5', JSON.stringify(bkgData));
            renderReservationsTable();
            updateAllKPIs();
            showToast("Reservation deleted.", "error");
            addAuditLog("Deleted reservation for " + dinerName);
        }
    );
}

// --- PAYMENTS ---
function renderPaymentsTable() {
    var tbody = document.getElementById('globalPaymentsBody');
    if (!tbody) return;
    tbody.innerHTML = "";
    
    let payData = JSON.parse(localStorage.getItem('dt_admin_pay_v5'));
    for(var i=0; i < payData.length; i++) {
        var p = payData[i];
        var badgeClass = p.status === "Success" ? "badge-green" : (p.status === "Failed" ? "badge-red" : "badge-yellow");
        var row = document.createElement('tr');
        row.innerHTML = 
            "<td><code style='color:var(--text-muted)'>" + p.id + "</code></td>" +
            "<td><code style='background: #f0f0f0; padding: 2px 4px; border-radius: 4px; color: var(--text-muted); font-size: 0.7rem;'>" + p.userId + "</code><br><b style='display:inline-block; margin-top:4px;'>" + p.user + "</b></td>" +
            "<td><code style='background: #f0f0f0; padding: 2px 4px; border-radius: 4px; color: var(--text-muted); font-size: 0.7rem;'>" + p.restaurantId + "</code><br><b style='display:inline-block; margin-top:4px;'>" + p.restaurant + "</b></td>" +
            "<td style='font-weight:700;'>" + p.amount + "</td>" +
            "<td>" + p.method + "</td>" +
            "<td><span class='badge " + badgeClass + "'>" + p.status + "</span></td>";
        tbody.appendChild(row);
    }
}

// --- AUDIT LOGS ---
function renderAuditLogs() {
    var container = document.getElementById('auditLogsContainer');
    if (!container) return;
    container.innerHTML = "";
    
    let logData = JSON.parse(localStorage.getItem('dt_admin_log_v5'));
    for(var i = logData.length - 1; i >= 0; i--) {
        var log = logData[i];
        var div = document.createElement('div');
        div.style = "display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light);";
        div.innerHTML = 
            "<div style='font-family: monospace; color: var(--text-muted); width: 80px; flex-shrink: 0; font-size: 0.8rem;'>" + log.time + "</div>" +
            "<div style='color: var(--text-dark); font-size: 0.9rem;'>" + log.message + "</div>";
        container.appendChild(div);
    }
}

function addAuditLog(msg) {
    let logData = JSON.parse(localStorage.getItem('dt_admin_log_v5'));
    let now = new Date();
    let timeStr = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0') + ":" + now.getSeconds().toString().padStart(2, '0');
    logData.push({ time: timeStr, message: msg });
    localStorage.setItem('dt_admin_log_v5', JSON.stringify(logData));
    renderAuditLogs(); 
}

// --- REPORTS ---
window.generateReport = function() {
    var scope = document.getElementById('reportScope').value;
    var searchInput = document.getElementById('reportRestaurantSearch').value.toLowerCase();
    
    var filteredData = JSON.parse(localStorage.getItem('dt_admin_res_v5'));
    
    if (scope !== "platform") filteredData = filteredData.filter(function(res) { return res.city === scope; });
    if (searchInput !== "") filteredData = filteredData.filter(function(res) { return res.name.toLowerCase().includes(searchInput); });

    if (filteredData.length === 0) {
        showToast("No records match your filters.", "warning");
        return;
    }

    var totalRev = 0, totalBooks = 0, totalTables = 0;
    var cuisineStats = {};

    for(var i=0; i<filteredData.length; i++) {
        var node = filteredData[i];
        totalRev += node.activeReservations * 850; 
        totalBooks += node.activeReservations;
        totalTables += node.tables;
        if (!cuisineStats[node.cuisine]) cuisineStats[node.cuisine] = 0;
        cuisineStats[node.cuisine] += node.activeReservations;
    }

    document.getElementById('repNodes').innerHTML = filteredData.length;
    document.getElementById('repBook').innerHTML = totalBooks;
    document.getElementById('repRev').innerHTML = "₹" + totalRev.toLocaleString('en-IN');
    document.getElementById('repCap').innerHTML = (totalTables > 0 ? Math.min(Math.round((totalBooks / (totalTables * 4)) * 100), 100) : 0) + "%";

    var cuisineHtml = "";
    var colors = ["var(--primary-green)", "#1976D2", "#F57F17", "#8E24AA", "#D32F2F"]; 
    var cuisineArray = Object.keys(cuisineStats).map(function(key) { return { name: key, bookings: cuisineStats[key] }; }).sort(function(a, b) { return b.bookings - a.bookings; });
    var maxBooks = totalBooks > 0 ? totalBooks : 1;

    for (var j = 0; j < Math.min(cuisineArray.length, 5); j++) { 
        var c = cuisineArray[j];
        if (c.bookings === 0) continue; 
        var percentage = Math.round((c.bookings / maxBooks) * 100);
        
        cuisineHtml += "<div style='margin-bottom: 0.5rem;'><div style='display: flex; justify-content: space-between; margin-bottom: 8px;'><span style='color: var(--text-dark); font-weight: 600; font-size: 0.85rem;'>" + c.name + "</span><span style='color: var(--text-muted); font-size: 0.8rem; font-weight: 500;'>" + c.bookings + " (" + percentage + "%)</span></div><div style='width: 100%; background: #F1F5F9; height: 8px; border-radius: 4px; overflow: hidden;'><div style='width: " + percentage + "%; background: " + colors[j % colors.length] + "; height: 100%; border-radius: 4px; transition: width 1s ease-out;'></div></div></div>";
    }
    
    document.getElementById('cuisineBarsContainer').innerHTML = cuisineHtml || "<p style='color: var(--text-muted); font-size: 0.85rem;'>No active bookings.</p>";

    var revenueHtml = "";
    var sortedNodes = [...filteredData].sort(function(a, b) { return b.activeReservations - a.activeReservations; });
    
    for (var k = 0; k < Math.min(sortedNodes.length, 5); k++) { 
        var r = sortedNodes[k];
        var nodeRev = r.activeReservations * 850;
        if (nodeRev === 0) continue;
        revenueHtml += "<div style='display: flex; justify-content: space-between; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-light);'><div style='display: flex; align-items: center; gap: 1rem;'><div style='width: 40px; height: 40px; background: var(--bg-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; border: 1px solid var(--border-light); color: var(--primary-green);'><i class='fa-solid fa-utensils'></i></div><div><div style='color: var(--text-dark); font-size: 0.9rem; font-weight: 700; margin-bottom: 2px;'><code style='background: #f0f0f0; padding: 2px 4px; border-radius: 4px; color: var(--text-muted); font-size: 0.7rem; font-weight: normal; margin-right: 6px;'>" + r.id + "</code>" + r.name + "</div><div style='color: var(--text-muted); font-size: 0.75rem;'>" + r.activeReservations + " Bookings</div></div></div><div style='color: #2E7D32; font-weight: 800; font-size: 0.95rem;'>₹" + nodeRev.toLocaleString('en-IN') + "</div></div>";
    }
    
    document.getElementById('revenueListContainer').innerHTML = revenueHtml || "<p style='color: var(--text-muted); font-size: 0.85rem;'>No revenue generated yet.</p>";
    document.getElementById('reportResults').style.display = "block";
    addAuditLog("Generated system report for Region: " + scope);
}

// --- BROADCAST ---
window.sendBroadcast = function(event) {
    event.preventDefault();
    showToast("Broadcast message sent successfully.", "success");
    addAuditLog("Sent broadcast message to selected users");
    event.target.reset();
}

window.logoutSuperAdmin = function() {
    localStorage.removeItem('super_auth_status');
    window.location.href = "login.html";
}

// --- UTILS & ROUTING ---
window.switchTab = function(tabName) {
    var views = document.querySelectorAll('.dashboard-view');
    for (var i = 0; i < views.length; i++) views[i].style.display = 'none';

    var navItems = document.querySelectorAll('.sidebar .nav-item');
    for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove('active');
    }

    document.getElementById('view-' + tabName).style.display = 'block';
    var targetNav = document.querySelector(`.nav-item[onclick*="${tabName}"]`);
    if(targetNav) targetNav.classList.add('active');

    var tbTitle = document.getElementById('topbar-title');
    var tbSub = document.getElementById('topbar-sub');
    if (tbTitle && TITLES[tabName]) {
        tbTitle.innerHTML = TITLES[tabName][0];
        tbSub.innerHTML = TITLES[tabName][1];
    }
    
    localStorage.setItem('dt_active_tab_v5', tabName);
}

function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if(!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<i class="fa-solid fa-circle-info"></i> ' + message;
    container.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() { toast.classList.remove('show'); setTimeout(function() { toast.remove(); }, 300); }, 3000);
}