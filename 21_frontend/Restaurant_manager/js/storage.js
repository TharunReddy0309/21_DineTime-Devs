class StorageManager {
    static init() {
        const stored = localStorage.getItem('dinetimeData_v2');
        if (!stored) {
            const initialSet = {
                currentUser: "rahul.sharma@spicegarden.com",
                users: {
                    "rahul.sharma@spicegarden.com": JSON.parse(JSON.stringify(initialData))
                }
            };
            localStorage.setItem('dinetimeData_v2', JSON.stringify(initialSet));
        }

        // Always ensure both manager accounts exist so diner bookings always route correctly
        const full = JSON.parse(localStorage.getItem('dinetimeData_v2'));
        let changed = false;

        // Spice Garden (Rahul)
        const rahul = full.users["rahul.sharma@spicegarden.com"];
        if (rahul) {
            if (!rahul.reviews || rahul.reviews.length < 10) {
                console.log("Restoring FULL demo reviews for Rahul from initialData...");
                rahul.reviews = JSON.parse(JSON.stringify(initialData.reviews));
                changed = true;
            }
            if (!rahul.tables || rahul.tables.length === 0) {
                console.log("Healing Rahul's tables from initialData...");
                rahul.tables = JSON.parse(JSON.stringify(initialData.tables));
                changed = true;
            }
            if (!rahul.timeSlotsConfig) {
                console.log("Seeding Rahul's time slots from initialData...");
                rahul.timeSlotsConfig = JSON.parse(JSON.stringify(initialData.timeSlotsConfig));
                changed = true;
            }
            if (!rahul.gallery || rahul.gallery.length < 6) {
                console.log("Restoring FULL gallery images for Rahul...");
                rahul.gallery = JSON.parse(JSON.stringify(initialData.gallery));
                changed = true;
            }
            if (rahul.menu) {
                rahul.menu.forEach(item => {
                    const sourceItem = initialData.menu.find(m => m.id === item.id);
                    if (sourceItem && sourceItem.id.startsWith("10")) {
                        item.image = sourceItem.image;
                    }
                });
                changed = true;
            }
        }

        // Sushi Master: pre-seed so booking routes always land here
        if (!full.users["manager@sushimaster.com"]) {
            console.log("Pre-seeding Sushi Master manager account...");
            full.users["manager@sushimaster.com"] = this.createEmptyDataSet("manager@sushimaster.com", "Sushi Master");
            full.users["manager@sushimaster.com"].password = "password123";
            full.users["manager@sushimaster.com"].profile.name = "Kenji Tanaka";
            changed = true;
        }

        if (changed) {
            localStorage.setItem('dinetimeData_v2', JSON.stringify(full));
        }
    }



    
    static getRawData() {
        this.init();
        return JSON.parse(localStorage.getItem('dinetimeData_v2'));
    }

    static saveRawData(fullData) {
        localStorage.setItem('dinetimeData_v2', JSON.stringify(fullData));
    }

    static getData() {
        const full = this.getRawData();
        return full.users[full.currentUser] || full.users["rahul.sharma@spicegarden.com"];
    }
    
    static saveData(activeUserData) {
        const full = this.getRawData();
        full.users[full.currentUser] = activeUserData;
        this.saveRawData(full);
    }

    static createEmptyDataSet(email, restaurantName = "My Restaurant") {
        const lowerEmail = email.toLowerCase();
        return {
            profile: {
                name: "New Manager",
                email: lowerEmail,
                avatar: null,
                phone: "+91 00000 00000",
                city: "Unknown City",
                restaurantName: restaurantName,
                memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            },
            restaurant: {
                name: restaurantName,
                about: "Welcome to our restaurant! We haven't added our story yet.",
                cuisine: "Cuisine Not Set",
                capacity: "0 seats",
                location: "Address Not Set",
                hours: "Hours Not Set",
                parking: "Not Set",
                rating: "0.0",
                dressCode: "Not Set",
                price: "0",
                contact: "Contact Not Set",
                image: "images/restaurant.jpg"

            },
            policies: [
                { title: "Cancellation Policy", desc: "Cancellations must be made at least 2 hours in advance." },
                { title: "Late Arrival", desc: "We hold tables for 15 minutes past the reservation time." }
            ],
            gallery: [],

            menu: [],
            reservations: [],
            staff: [
                { id: "s1", name: "New Manager", initials: "NM", role: "Manager", email: lowerEmail, status: "Approved" }
            ],
            notifications: [
                { id: "n1", type: "system", text: "Welcome to DineTime! Start by setting up your profile and menu.", time: "Just now", read: false, icon: "ph-star", iconColor: "text-orange", bgClass: "bg-orange-light" }
            ],
            activity: {
                reservations: 0,
                availableTables: 0,
                avgRating: 0
            },
            tables: [],
            blockedTables: [],
            reviews: [],
            timeSlotsConfig: {
                operatingHours: { open: "11:00", close: "23:00" },
                dates: {
                    // Set up some default slots for "Today" so it's not empty
                    [new Date().toISOString().split('T')[0]]: {
                        isClosed: false,
                        slots: [
                            { id: "def-1", start: "12:00", end: "14:00", text: "12:00 PM – 2:00 PM", maxTables: 10 },
                            { id: "def-2", start: "19:00", end: "21:00", text: "7:00 PM – 9:00 PM", maxTables: 12 }
                        ]
                    }
                }
            }
        };
    }



    // --- Session Management ---
    static login(email) {
        const full = this.getRawData();
        const lowerEmail = email.toLowerCase();
        
        if (!full.users[lowerEmail]) {
            if (lowerEmail === "rahul.sharma@spicegarden.com") {
                full.users[lowerEmail] = JSON.parse(JSON.stringify(initialData));
            } else if (lowerEmail === "manager@sushimaster.com") {
                full.users[lowerEmail] = this.createEmptyDataSet(lowerEmail, "Sushi Master");
                full.users[lowerEmail].password = "password123";
            } else {
                // Unknown user? Create a clean slate, don't leak Spice Garden data!
                full.users[lowerEmail] = this.createEmptyDataSet(lowerEmail);
            }
        }
        
        full.currentUser = lowerEmail;
        this.saveRawData(full);
    }

    static register(email, accountData, restaurantData, locationData) {
        const full = this.getRawData();
        const lowerEmail = email.toLowerCase();
        
        // Use the clean slate helper
        const newDataSet = this.createEmptyDataSet(lowerEmail, restaurantData.name);
        
        // Further customize from registration data
        newDataSet.password = accountData.password;
        newDataSet.profile.name = accountData.name || "New Manager";
        newDataSet.profile.phone = accountData.phone || "+91 00000 00000";
        newDataSet.profile.city = locationData.city || "Unknown City";
        
        newDataSet.restaurant.about = restaurantData.desc || newDataSet.restaurant.about;
        newDataSet.restaurant.cuisine = restaurantData.cuisine;
        newDataSet.restaurant.phone = restaurantData.phone;
        newDataSet.restaurant.address = `${locationData.address}, ${locationData.city}, ${locationData.zip}, ${locationData.country}`;
        newDataSet.restaurant.location = `${locationData.address}, ${locationData.city}`;
        newDataSet.restaurant.contact = restaurantData.phone;
        if (restaurantData.image) newDataSet.restaurant.image = restaurantData.image;

        full.users[lowerEmail] = newDataSet;
        full.currentUser = lowerEmail; // Automatically log in
        this.saveRawData(full);
    }



    static logout() {
        // We don't necessarily clear the current user unless we want to force login page
        // But we keep the data in localStorage
    }

    static getCurrentUser() {
        return this.getRawData().currentUser;
    }
    
    // --- Existing CRUD wrappers (now isolated to active user) ---
    static updateProfile(profileUpdates) {
        const data = this.getData();
        data.profile = { ...data.profile, ...profileUpdates };
        this.saveData(data);
    }
    
    static updateRestaurantDetails(restUpdates) {
        const data = this.getData();
        data.restaurant = { ...data.restaurant, ...restUpdates };
        this.saveData(data);
    }

    static updatePolicies(newPolicies) {
        const data = this.getData();
        data.policies = newPolicies;
        this.saveData(data);
    }

    static getReservations() { return this.getData().reservations || []; }

    static updateReservationStatus(id, newStatus) {
        const data = this.getData();
        const target = data.reservations.find(r => r.id === id);
        if (target) {
            target.status = newStatus;
            this.saveData(data);
        }
    }

    static getMenu() { return this.getData().menu || []; }

    static addMenuItem(item) {
        const data = this.getData();
        data.menu.push(item);
        this.saveData(data);
    }

    static updateMenuItem(id, updatedItem) {
        const data = this.getData();
        const index = data.menu.findIndex(m => m.id === id);
        if (index !== -1) {
            data.menu[index] = { ...data.menu[index], ...updatedItem };
            this.saveData(data);
        }
    }

    static deleteMenuItem(id) {
        const data = this.getData();
        data.menu = data.menu.filter(m => m.id !== id);
        this.saveData(data);
    }


    static toggleMenuAvailability(id, date) {
        const data = this.getData();
        const target = data.menu.find(m => m.id === id);
        if (target) {
            if (!target.dateAvailability) target.dateAvailability = {};
            const currentStatus = target.dateAvailability[date] !== undefined 
                ? target.dateAvailability[date] 
                : (target.available !== undefined ? target.available : true);
            target.dateAvailability[date] = !currentStatus;
            this.saveData(data);
        }
    }

    static getTables() {
        const data = StorageManager.getData();
        const currentUser = StorageManager.getCurrentUser() || "";
        const email = currentUser.toLowerCase();
        
        if (!data.tables || data.tables.length === 0) {
            // Ultimate fallback for demo account
            if (email === "rahul.sharma@spicegarden.com") {
                console.log("Restoring demo tables for Rahul...");
                data.tables = [
                    { id: "tbl-1", number: "Table 1", seats: 2 },
                    { id: "tbl-2", number: "Table 2", seats: 4 },
                    { id: "tbl-3", number: "Table 3", seats: 4 },
                    { id: "tbl-4", number: "Table 4", seats: 2 },
                    { id: "tbl-5", number: "Table 5", seats: 6 },
                    { id: "tbl-6", number: "Table 6", seats: 4 }
                ];
                data.blockedTables = [];
                StorageManager.saveData(data);
                return data.tables;
            }
            data.tables = [];
        }
        return data.tables;
    }





    static saveTableLayout(tablesArray) {
        const data = this.getData();
        data.tables = tablesArray;
        this.saveData(data);
    }

    static getBlockedTables() { return this.getData().blockedTables || []; }

    static blockTable(blockObject) {
        const data = this.getData();
        if(!data.blockedTables) data.blockedTables = [];
        data.blockedTables.push(blockObject);
        this.saveData(data);
    }

    static unblockTable(index) {
        const data = this.getData();
        if(data.blockedTables && data.blockedTables[index]) {
            data.blockedTables.splice(index, 1);
            this.saveData(data);
        }
    }

    static getStaff() { return this.getData().staff || []; }

    static updateStaffStatus(id, newStatus) {
        const data = this.getData();
        const member = data.staff.find(s => s.id === id);
        if (member) {
            member.status = newStatus;
            this.saveData(data);
        }
    }

    static getNotifications() { return this.getData().notifications || []; }

    static markAllNotificationsRead() {
        const data = this.getData();
        if (data.notifications) {
            data.notifications.forEach(n => n.read = true);
            this.saveData(data);
        }
    }

    static getReviews() {
        const data = StorageManager.getData();
        const currentUser = StorageManager.getCurrentUser() || "";
        const email = currentUser.toLowerCase();

        // If it's the demo account, ensure we have the full rich dataset (12 reviews)
        if (email === "rahul.sharma@spicegarden.com") {
            if (!data.reviews || data.reviews.length < 10) {
                console.log("Forcing demo review sync for Rahul...");
                data.reviews = JSON.parse(JSON.stringify(initialData.reviews));
                StorageManager.saveData(data);
            }
            return data.reviews;
        }

        if (!data.reviews) {
            data.reviews = [];
            StorageManager.saveData(data);
        }
        return data.reviews;
    }






    static saveReviewReply(reviewId, replyText) {
        const data = this.getData();
        const review = data.reviews.find(r => r.id === reviewId);
        if(review) {
            review.reply = replyText;
            review.status = "Responded";
            this.saveData(data);
        }
    }

    static deleteReviewReply(reviewId) {
        const data = this.getData();
        const review = data.reviews.find(r => r.id === reviewId);
        if (review) {
            review.reply = null;
            review.status = "Pending";
            this.saveData(data);
        }
    }
}

// Global Custom Confirm Modal (same as before)
window.showConfirm = function(message, onConfirm, title = "Confirm Deletion", confirmText = "Delete") {
    const existing = document.querySelector('.custom-confirm-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay custom-confirm-overlay';
    overlay.style.cssText = 'display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: blur(4px);';
    overlay.innerHTML = `
        <div class="modal-content" style="background: white; border-radius: 12px; width: 400px; max-width: 90%; padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 16px 0; font-size: 18px;">${title}</h3>
            <p style="color: #64748B; font-size: 14px; margin-bottom: 24px;">${message}</p>
            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <button class="btn btn-small confirm-cancel-btn" style="background: #F1F5F9; color: #475569; border: none;">Cancel</button>
                <button class="btn btn-small confirm-ok-btn" style="background: #527A59; color: white; border: none;">${confirmText}</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('.confirm-cancel-btn').addEventListener('click', () => overlay.remove());
    overlay.querySelector('.confirm-ok-btn').addEventListener('click', () => { if (onConfirm) onConfirm(); overlay.remove(); });
};

// Global User Info Sync
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init();
    const data = StorageManager.getData();
    if (data && data.profile) {
        document.querySelectorAll('.user-profile-widget').forEach(widget => {
            const nameEl = widget.querySelector('.user-info h4');
            if (nameEl) nameEl.textContent = data.profile.name;
            const avatarEl = widget.querySelector('.avatar-circle-small');
            if (avatarEl && data.profile.avatar) {
                avatarEl.innerHTML = `<img src="${data.profile.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }
        });
    }
});
