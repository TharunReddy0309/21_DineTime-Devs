document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load from LocalStorage
    const appData = StorageManager.getData();
    UIRenderer.renderAll(appData);

    // ---- Toast Notification System ----
    const toastContainer = document.getElementById('toast-container');
    window.showToast = function(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        let iconClass = type === 'success' ? 'ph-check-circle' : 'ph-info';
        toast.innerHTML = `<i class="ph ${iconClass} toast-icon"></i><span class="toast-message">${message}</span>`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    };

    // ---- Tab Switching Logic ----
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            button.classList.add('active');
            const targetId = button.getAttribute('data-target');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
        });
    });

    // ---- Button visual feedback ----
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousedown', function() { this.style.transform = 'scale(0.98)'; });
        btn.addEventListener('mouseup', function() { this.style.transform = 'scale(1)'; });
        btn.addEventListener('mouseleave', function() { this.style.transform = 'scale(1)'; });
    });

    // ---- File Upload Triggers ----
    const photoUploadInput = document.getElementById('photo-upload-input');
    document.getElementById('upload-photo-btn')?.addEventListener('click', () => photoUploadInput?.click());
    
    document.getElementById('remove-photo-btn')?.addEventListener('click', () => {
        window.showConfirm("Are you sure you want to remove your profile photo?", () => {
            StorageManager.updateProfile({ avatar: null });
            UIRenderer.renderProfile(StorageManager.getData().profile);
            showToast('Profile photo removed.', 'info');
        }, "Remove Photo", "Remove");
    });

    photoUploadInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                StorageManager.updateProfile({ avatar: event.target.result });
                UIRenderer.renderProfile(StorageManager.getData().profile);
                showToast('Profile photo updated successfully!');
            };
            reader.readAsDataURL(file);
        }
    });

    // ---- Restaurant Image Upload Triggers ----
    const restImgUploadInput = document.getElementById('rest-img-upload');
    const restImgRemoveBtn = document.getElementById('rest-img-remove');
    
    restImgUploadInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                const data = StorageManager.getData();
                data.restaurant.image = event.target.result;
                StorageManager.saveData(data);
                UIRenderer.renderRestaurantDetails(data.restaurant);
                showToast('Restaurant profile photo updated!');
            };
            reader.readAsDataURL(file);
        }
    });

    restImgRemoveBtn?.addEventListener('click', () => {
        if (window.showConfirm) {
            window.showConfirm("Are you sure you want to remove the restaurant photo?", () => {
                const data = StorageManager.getData();
                data.restaurant.image = null;
                StorageManager.saveData(data);
                UIRenderer.renderRestaurantDetails(data.restaurant);
                showToast('Restaurant photo removed.', 'info');
            }, "Remove Photo", "Remove");
        }
    });

    const galleryUploadInput = document.getElementById('gallery-upload-input');
    document.getElementById('upload-images-btn')?.addEventListener('click', () => galleryUploadInput?.click());
    galleryUploadInput?.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            let processed = 0;
            const newImages = [];
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(event) {
                    newImages.push(event.target.result);
                    processed++;
                    if (processed === files.length) {
                        const allData = StorageManager.getData();
                        const updatedGallery = [...allData.gallery, ...newImages];
                        allData.gallery = updatedGallery;
                        StorageManager.saveData(allData);
                        if (document.querySelector('.gallery-grid')) {
                            UIRenderer.renderGallery(updatedGallery);
                        }
                        showToast(`${files.length} images added to gallery.`);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    });

    // ---- Edit Profile Logic (Simulated CRUD) ----
    const editProfileBtn = document.getElementById('edit-profile-btn');
    let isEditingProfile = false;

    // Helper to append a cancel button and wrap them in a flex container dynamically
    function attachCancelBtn(saveBtn, discardAction) {
        if (!saveBtn.parentElement.classList.contains('actions-wrapper')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'actions-wrapper';
            wrapper.style.display = 'flex';
            wrapper.style.gap = '8px';
            saveBtn.parentNode.insertBefore(wrapper, saveBtn);
            wrapper.appendChild(saveBtn);
        }
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-small';
        cancelBtn.style.backgroundColor = '#F1F5F9';
        cancelBtn.style.color = 'var(--text-dark)';
        cancelBtn.style.border = '1px solid #E2E8F0';
        cancelBtn.innerHTML = 'Cancel';
        cancelBtn.onclick = () => {
            discardAction();
            cancelBtn.remove();
        };
        saveBtn.parentElement.insertBefore(cancelBtn, saveBtn);
        return cancelBtn;
    }

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            if (!isEditingProfile) {
                // Switch to Edit Mode
                ['profile-name', 'profile-email', 'profile-phone', 'profile-city', 'profile-rest'].forEach(id => {
                    const el = document.getElementById(id);
                    el.innerHTML = `<input type="text" class="editable-input" value="${el.innerText}">`;
                });
                
                editProfileBtn.classList.replace('btn-primary-orange', 'btn-primary-green');
                editProfileBtn.innerHTML = '<i class="ph ph-check"></i><span>Save Profile</span>';
                
                // Add Cancel Option
                editProfileBtn.cancelNode = attachCancelBtn(editProfileBtn, () => {
                    UIRenderer.renderProfile(StorageManager.getData().profile);
                    editProfileBtn.classList.replace('btn-primary-green', 'btn-primary-orange');
                    editProfileBtn.innerHTML = '<i class="ph ph-pencil-simple"></i><span>Edit Profile</span>';
                    isEditingProfile = false;
                });
                
                isEditingProfile = true;
            } else {
                // Save Changes
                const updates = {
                    name: document.getElementById('profile-name').querySelector('input').value,
                    email: document.getElementById('profile-email').querySelector('input').value,
                    phone: document.getElementById('profile-phone').querySelector('input').value,
                    city: document.getElementById('profile-city').querySelector('input').value,
                    restaurantName: document.getElementById('profile-rest').querySelector('input').value
                };
                
                // Save to localStorage
                StorageManager.updateProfile(updates);
                
                // Re-render UI from updated storage
                UIRenderer.renderProfile(StorageManager.getData().profile);
                
                // Remove cancel button
                if (editProfileBtn.cancelNode) editProfileBtn.cancelNode.remove();
                
                // Revert Button Style
                editProfileBtn.classList.replace('btn-primary-green', 'btn-primary-orange');
                editProfileBtn.innerHTML = '<i class="ph ph-pencil-simple"></i><span>Edit Profile</span>';
                isEditingProfile = false;
                showToast('Profile updated successfully!');
            }
        });
    }

    // ---- Edit Restaurant Details Logic (Simulated CRUD) ----
    const editRestBtn = document.getElementById('edit-rest-btn');
    let isEditingRest = false;
    
    if (editRestBtn) {
        editRestBtn.addEventListener('click', () => {
            const fields = [
                {id: 'rest-name'}, {id: 'rest-about-text', isTextArea: true},
                {id: 'rest-cuisine'}, {id: 'rest-capacity'}, {id: 'rest-location'},
                {id: 'rest-hours'}, {id: 'rest-parking'}, {id: 'rest-dress'},
                {id: 'rest-contact'}

            ];
            
            if (!isEditingRest) {
                fields.forEach(field => {
                    const el = document.getElementById(field.id);
                    if (field.isTextArea) {
                        el.innerHTML = `<textarea class="editable-input" style="height: 80px; resize: vertical;">${el.innerText}</textarea>`;
                    } else {
                        el.innerHTML = `<input type="text" class="editable-input" value="${el.innerText}">`;
                    }
                });
                
                editRestBtn.classList.replace('btn-primary-orange', 'btn-primary-green');
                editRestBtn.innerHTML = '<i class="ph ph-check"></i><span>Save Details</span>';
                
                editRestBtn.cancelNode = attachCancelBtn(editRestBtn, () => {
                    UIRenderer.renderRestaurantDetails(StorageManager.getData().restaurant);
                    editRestBtn.classList.replace('btn-primary-green', 'btn-primary-orange');
                    editRestBtn.innerHTML = '<i class="ph ph-pencil-simple"></i><span>Edit Restaurant Details</span>';
                    isEditingRest = false;
                });
                
                isEditingRest = true;
            } else {
                // Collect updates
                const updates = {
                    name: document.getElementById('rest-name').querySelector('input').value,
                    about: document.getElementById('rest-about-text').querySelector('textarea').value,
                    cuisine: document.getElementById('rest-cuisine').querySelector('input').value,
                    capacity: document.getElementById('rest-capacity').querySelector('input').value,
                    location: document.getElementById('rest-location').querySelector('input').value,
                    hours: document.getElementById('rest-hours').querySelector('input').value,
                    parking: document.getElementById('rest-parking').querySelector('input').value,
                    dressCode: document.getElementById('rest-dress').querySelector('input').value,
                    contact: document.getElementById('rest-contact').querySelector('input').value

                };
                
                StorageManager.updateRestaurantDetails(updates);
                UIRenderer.renderRestaurantDetails(StorageManager.getData().restaurant);
                
                if (editRestBtn.cancelNode) editRestBtn.cancelNode.remove();
                
                editRestBtn.classList.replace('btn-primary-green', 'btn-primary-orange');
                editRestBtn.innerHTML = '<i class="ph ph-pencil-simple"></i><span>Edit Restaurant Details</span>';
                isEditingRest = false;
                showToast('Restaurant details saved!');
            }
        });
    }

    // ---- Edit Policies Logic (Simulated CRUD) ----
    const editPoliciesBtn = document.getElementById('edit-policies-btn');
    let isEditingPolicies = false;

    if (editPoliciesBtn) {
        editPoliciesBtn.addEventListener('click', () => {
            const policyItems = document.querySelectorAll('.policy-item');
            
            if (!isEditingPolicies) {
                policyItems.forEach(item => {
                    const p = item.querySelector('p');
                    const h5 = item.querySelector('h5');
                    h5.innerHTML = `<input type="text" class="editable-input" style="font-weight:bold" value="${h5.innerText}">`;
                    p.innerHTML = `<textarea class="editable-input" style="height: 60px; resize: vertical;">${p.innerText}</textarea>`;
                });
                
                editPoliciesBtn.classList.replace('btn-primary-orange', 'btn-primary-green');
                editPoliciesBtn.innerHTML = '<i class="ph ph-check"></i><span>Save Policies</span>';

                // Show delete buttons
                document.querySelectorAll('.delete-policy-btn').forEach(btn => btn.style.display = 'flex');

                
                editPoliciesBtn.cancelNode = attachCancelBtn(editPoliciesBtn, () => {
                    UIRenderer.renderPolicies(StorageManager.getData().policies);
                    document.querySelectorAll('.delete-policy-btn').forEach(btn => btn.style.display = 'none');
                    editPoliciesBtn.classList.replace('btn-primary-green', 'btn-primary-orange');
                    editPoliciesBtn.innerHTML = '<i class="ph ph-pencil-simple"></i><span>Edit Policies</span>';
                    isEditingPolicies = false;
                });

                
                isEditingPolicies = true;
            } else {
                const newPolicies = Array.from(policyItems).map(item => {
                    return {
                        title: item.querySelector('h5 input').value,
                        desc: item.querySelector('p textarea').value
                    };
                });
                
                StorageManager.updatePolicies(newPolicies);
                UIRenderer.renderPolicies(StorageManager.getData().policies);
                document.querySelectorAll('.delete-policy-btn').forEach(btn => btn.style.display = 'none');
                
                if (editPoliciesBtn.cancelNode) editPoliciesBtn.cancelNode.remove();

                
                editPoliciesBtn.classList.replace('btn-primary-green', 'btn-primary-orange');
                editPoliciesBtn.innerHTML = '<i class="ph ph-pencil-simple"></i><span>Edit Policies</span>';
                isEditingPolicies = false;
                showToast('Policies updated successfully!');
            }
        });
    }

    // Add New Policy Logic
    const addPolicyBtn = document.getElementById('add-policy-btn');
    if (addPolicyBtn) {
        addPolicyBtn.addEventListener('click', () => {
            const currentData = StorageManager.getData();
            if (!currentData.policies) currentData.policies = [];
            
            const newPolicy = { title: "New Policy", desc: "Policy description goes here." };
            currentData.policies.push(newPolicy);
            
            // Critical: Save first to ensure the new item is persistent
            StorageManager.updatePolicies(currentData.policies);
            
            // Force pure re-render from storage to clear any stale DOM
            UIRenderer.renderPolicies(StorageManager.getData().policies);
            
            // Enter edit mode specifically for policies

            if (!isEditingPolicies) {
                editPoliciesBtn.click();
            } else {
                // If already editing, we need to refresh the inputs for the new element
                isEditingPolicies = false; 
                editPoliciesBtn.click(); 
            }
            
            showToast('New policy placeholder added. Edit it now!');
        });
    }


    // Global Event Delegation for Dynamic Deletes
    document.addEventListener('click', (e) => {
        if (e.target.closest('.delete-policy-btn')) {
            window.showConfirm("Are you sure you want to remove this policy?", () => {
                const index = parseInt(e.target.closest('.policy-item').getAttribute('data-index'));
                const currentData = StorageManager.getData();
                currentData.policies.splice(index, 1);
                StorageManager.updatePolicies(currentData.policies);
                UIRenderer.renderPolicies(currentData.policies);
                // Re-enter edit mode if we were in it
                if (isEditingPolicies) {
                    isEditingPolicies = false; // reset so click() triggers it correctly
                    editPoliciesBtn.click();
                }
                showToast('Policy removed.', 'info');
            }, "Remove Policy", "Remove");
        }
    });


    // Misc Actions
    document.getElementById('manage-staff-btn')?.addEventListener('click', () => {
        window.location.href = 'staff.html';
    });
    document.querySelectorAll('.header-actions .icon-btn').forEach(icon => {
        if (icon.id === 'notification-btn') return;
        if (icon.getAttribute('aria-label') === 'Logout') {
            icon.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        } else {
            icon.addEventListener('click', () => showToast(`Opening ${icon.getAttribute('aria-label')}...`, 'info'));
        }
    });

    // ---- Notification Dropdown Logic ----
    const notifBtn = document.getElementById('notification-btn');
    const notifDropdown = document.getElementById('notification-dropdown');
    const notifList = document.getElementById('notification-list');
    const notifBadge = notifBtn ? notifBtn.querySelector('.notification-badge') : null;

    function renderNotifications() {
        const notifications = StorageManager.getNotifications();
        if (!notifList) return;

        const unreadCount = notifications.filter(n => !n.read).length;
        if (notifBadge) {
            notifBadge.textContent = unreadCount;
            notifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }

        notifList.innerHTML = notifications.map(n => `
            <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div class="notif-icon ${n.bgClass}">
                    <i class="ph ${n.icon} ${n.iconColor}"></i>
                </div>
                <div class="notif-content">
                    <p>${n.text}</p>
                    <span class="notif-time">${n.time}</span>
                </div>
            </div>
        `).join('');
    }

    // Initial render
    renderNotifications();

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
        });

        // Mark all as read
        const markReadBtn = notifDropdown.querySelector('.mark-read-btn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                StorageManager.markAllNotificationsRead();
                renderNotifications();
            });
        }

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }
        });
    }
});
