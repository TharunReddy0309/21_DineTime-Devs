document.addEventListener('DOMContentLoaded', () => {
    // Basic elements
    const dateSelector = document.getElementById('date-selector');
    const dateDisplay = document.getElementById('date-display');
    const nonWorkingCheckbox = document.getElementById('non-working-checkbox');
    
    const editHoursBtn = document.getElementById('edit-hours-btn');
    const openTimeInput = document.getElementById('open-time');
    const closeTimeInput = document.getElementById('close-time');

    const addSlotBtn = document.getElementById('add-slot-btn');
    const slotModal = document.getElementById('slot-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const slotForm = document.getElementById('slot-form');
    
    const slotsTbody = document.getElementById('slots-tbody');
    const slotsTable = document.getElementById('slots-table');
    
    // Initialize to today's date if not set
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Set minimum date to today (Prevent selecting past dates)
    dateSelector.setAttribute('min', todayStr);

    if (!dateSelector.value || dateSelector.value === "2026-03-18") {
        dateSelector.value = todayStr;
    }
    let currentDate = dateSelector.value;

    
    // Initialize data in StorageManager if missing
    function initTimeSlotData() {
        const data = StorageManager.getData();
        let changed = false;

        if (!data.timeSlotsConfig) {
            data.timeSlotsConfig = {
                operatingHours: { open: "11:00", close: "23:00" },
                dates: {}
            };
            changed = true;
        }

        if (!data.timeSlotsConfig.dates) {
            data.timeSlotsConfig.dates = {};
            changed = true;
        }
        
        // Ensure today exists if empty
        if (Object.keys(data.timeSlotsConfig.dates).length === 0) {
            data.timeSlotsConfig.dates[todayStr] = {
                isClosed: false,
                slots: [
                    { id: "def-1", start: "12:00", end: "14:00", text: "12:00 PM – 2:00 PM", maxTables: 10 },
                    { id: "def-2", start: "19:00", end: "21:00", text: "7:00 PM – 9:00 PM", maxTables: 12 }
                ]
            };
            changed = true;
        }

        if (changed) {
            StorageManager.saveData(data);
        }
    }

    // Get configuration for specific date
    function getDateConfig(dateStr) {
        initTimeSlotData();
        const data = StorageManager.getData();
        const dates = data.timeSlotsConfig.dates;
        
        if (dates[dateStr]) {
            return dates[dateStr];
        }
        
        return {
            isClosed: false,
            slots: []
        };
    }

    // Save configuration for specific date
    function saveDateConfig(dateStr, dateConfig) {
        initTimeSlotData();
        const data = StorageManager.getData();
        if (!data.timeSlotsConfig.dates) data.timeSlotsConfig.dates = {};
        data.timeSlotsConfig.dates[dateStr] = dateConfig;
        StorageManager.saveData(data);
        showToast("Time slots updated successfully.");
    }
    
    // Save Operating Hours
    function saveOperatingHours(open, close) {
        const data = StorageManager.getData();
        if (!data.timeSlotsConfig) initTimeSlotData();
        data.timeSlotsConfig.operatingHours = { open, close };
        StorageManager.saveData(data);
        showToast("Operating hours updated.");
    }

    // Utility: Format date text
    function formatDateDisplay(dateStr) {
        if (!dateStr) return "Invalid Date";
        const d = new Date(dateStr);
        const adjustedDate = new Date(d.getTime() + Math.abs(d.getTimezoneOffset() * 60000));
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return adjustedDate.toLocaleDateString('en-US', options);
    }
    
    // Utility: Convert 24h time to 12h time string
    function formatTime12h(time24) {
        let [h, m] = time24.split(':');
        h = parseInt(h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${m} ${ampm}`;
    }

    // Render logic
    function renderPage() {
        // Update display text
        dateDisplay.textContent = formatDateDisplay(currentDate);
        
        // Load configurations
        const data = StorageManager.getData();
        const config = getDateConfig(currentDate);
        const opHours = data.timeSlotsConfig.operatingHours || { open: "11:00", close: "23:00" };
        
        // Populate operating hours
        if (!isEditingHours) {
            openTimeInput.value = opHours.open;
            closeTimeInput.value = opHours.close;
        }
        
        // Toggle working day checkbox
        nonWorkingCheckbox.checked = config.isClosed;
        
        // Find cards by their title text for better stability
        const cards = document.querySelectorAll('.card');
        let opCard, tsCard, toggleCard;
        cards.forEach(card => {
            const h4 = card.querySelector('h4');
            if (h4) {
                if (h4.innerText.includes('Operating Hours')) opCard = card;
                else if (h4.innerText.includes('Reservation Time Slots')) tsCard = card;
                else if (h4.innerText.includes('Select Date')) toggleCard = card;
            }
        });
        
        // Render slots
        slotsTbody.innerHTML = '';
        
        // Lock UI components
        if (config.isClosed) {
            // High-visibility locking (Match Screenshot)
            if(opCard) {
                opCard.style.opacity = '0.6';
                opCard.style.pointerEvents = 'none';
            }
            if(tsCard) {
                tsCard.style.opacity = '0.6';
                tsCard.style.pointerEvents = 'none';
            }
            // Always ensure the toggle card is interactive
            if(toggleCard) {
                toggleCard.style.opacity = '1';
                toggleCard.style.pointerEvents = 'auto';
            }
            if(addSlotBtn) {
                addSlotBtn.style.display = 'none'; // Strictly Hide
            }
            if(editHoursBtn) {
                editHoursBtn.style.display = 'none'; // Strictly Hide
            }
            
            if (isEditingHours) {
                isEditingHours = false;
                openTimeInput.disabled = true;
                closeTimeInput.disabled = true;
                openTimeInput.style.backgroundColor = '#F8FAFC';
                closeTimeInput.style.backgroundColor = '#F8FAFC';
                editHoursBtn.innerHTML = '<i class="ph ph-pencil-simple"></i> <span id="edit-hours-text">Edit Operating Hours</span>';
                editHoursBtn.classList.replace('btn-primary-green', 'btn-primary-orange');
            }
            
            slotsTbody.innerHTML = `
                <tr>
                    <td colspan="3" class="closed-table-msg">
                        Restaurant is marked as closed on this day.
                    </td>
                </tr>
            `;
        } else {
            if(opCard) {
                opCard.style.opacity = '1';
                opCard.style.pointerEvents = 'auto';
            }
            if(tsCard) {
                tsCard.style.opacity = '1';
                tsCard.style.pointerEvents = 'auto';
            }
            if(addSlotBtn) {
                addSlotBtn.style.display = 'flex';
                addSlotBtn.style.opacity = '1';
                addSlotBtn.style.pointerEvents = 'auto';
            }
            if(editHoursBtn) {
                editHoursBtn.style.display = 'flex';
            }
            
            if (config.slots.length === 0) {
                slotsTbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; padding: 32px; color: var(--text-muted);">
                            No time slots configured. Click "Add Time Slot" to create one.
                        </td>
                    </tr>
                `;
            } else {
                config.slots.forEach(slot => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = "1px solid var(--border-color)";
                    tr.innerHTML = `
                        <td style="padding: 16px; font-size: 14px; color: #475569;">${slot.text}</td>
                        <td style="padding: 16px; font-size: 14px; color: #475569;">${slot.maxTables}</td>
                        <td style="padding: 16px;">
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-small edit-slot-btn" data-id="${slot.id}" style="background: transparent; border: 1px solid var(--primary-green); color: var(--primary-green); font-weight: 500;"><i class="ph ph-pencil-simple"></i> Edit</button>
                                <button class="btn btn-small del-slot-btn" data-id="${slot.id}" style="background: transparent; border: 1px solid #f87171; color: #ef4444; font-weight: 500;"><i class="ph ph-trash"></i> Delete</button>
                            </div>
                        </td>
                    `;
                    slotsTbody.appendChild(tr);
                });
            }
        }
        
        bindSlotButtons();
    }

    // Bind edit/delete slot buttons
    function bindSlotButtons() {
        document.querySelectorAll('.edit-slot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const config = getDateConfig(currentDate);
                const slot = config.slots.find(s => s.id === id);
                if(slot) {
                    document.getElementById('modal-title').textContent = "Edit Time Slot";
                    document.getElementById('slot-id').value = slot.id;
                    document.getElementById('slot-start').value = slot.start;
                    document.getElementById('slot-end').value = slot.end;
                    document.getElementById('slot-max').value = slot.maxTables;
                    slotModal.style.display = 'flex';
                }
            });
        });

        document.querySelectorAll('.del-slot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                window.showConfirm("Are you sure you want to delete this time slot?", () => {
                    let config = getDateConfig(currentDate);
                    config.slots = config.slots.filter(s => s.id !== id);
                    saveDateConfig(currentDate, config);
                    renderPage();
                });
            });
        });
    }

    // Modal Handling
    function closeSlotModal() {
        slotModal.style.display = 'none';
        slotForm.reset();
        document.getElementById('slot-id').value = '';
    }

    addSlotBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = "Add Time Slot";
        slotForm.reset();
        document.getElementById('slot-id').value = '';
        slotModal.style.display = 'flex';
    });

    closeModalBtn.addEventListener('click', closeSlotModal);
    cancelModalBtn.addEventListener('click', closeSlotModal);

    slotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('slot-id').value;
        const start = document.getElementById('slot-start').value;
        const end = document.getElementById('slot-end').value;
        const maxTables = parseInt(document.getElementById('slot-max').value, 10);
        
        const textStr = `${formatTime12h(start)} – ${formatTime12h(end)}`;
        
        let config = getDateConfig(currentDate);
        
        if (id) {
            // Edit existing
            const index = config.slots.findIndex(s => s.id === id);
            if(index !== -1) {
                config.slots[index] = { id, start, end, text: textStr, maxTables };
            }
        } else {
            // Add new
            const newId = 'ts-' + Date.now();
            config.slots.push({ id: newId, start, end, text: textStr, maxTables });
            // Sort by start time
            config.slots.sort((a, b) => a.start.localeCompare(b.start));
        }
        
        saveDateConfig(currentDate, config);
        closeSlotModal();
        renderPage();
    });

    // Date change listener
    dateSelector.addEventListener('change', (e) => {
        const selected = e.target.value;
        if (!selected) return;
        
        // Ensure the selected date is not in the past
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const selectedDate = new Date(selected);
        selectedDate.setHours(12, 0, 0, 0); // Use noon to avoid timezone issues

        if (selectedDate < now) {
            showToast("Cannot manage past dates.", 'error');
            // Reset to today
            const todayStr = new Date().toISOString().split('T')[0];
            dateSelector.value = todayStr;
            currentDate = todayStr;
        } else {
            currentDate = selected;
        }
        renderPage();
    });

    // Toggle Closed Day
    nonWorkingCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        let config = getDateConfig(currentDate);
        config.isClosed = isChecked;
        
        saveDateConfig(currentDate, config);
        
        // Use a 0ms timeout to allow the browser to settle the checkbox state before we re-render everything
        setTimeout(() => {
            renderPage();
        }, 0);
    });

    // Helper to add cancel button dynamically
    function attachTimeSlotCancelBtn(saveBtn, discardAction) {
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

    // Editing Operating Hours
    let isEditingHours = false;
    editHoursBtn.addEventListener('click', () => {
        if (!isEditingHours) {
            // Enable editing
            isEditingHours = true;
            openTimeInput.disabled = false;
            closeTimeInput.disabled = false;
            openTimeInput.style.backgroundColor = '#FFFFFF';
            closeTimeInput.style.backgroundColor = '#FFFFFF';
            openTimeInput.focus();
            
            editHoursBtn.innerHTML = '<i class="ph ph-check"></i> <span id="edit-hours-text">Save Changes</span>';
            editHoursBtn.classList.remove('btn-primary-orange');
            editHoursBtn.classList.add('btn-primary-green');
            
            editHoursBtn.cancelNode = attachTimeSlotCancelBtn(editHoursBtn, () => {
                isEditingHours = false;
                const data = StorageManager.getData();
                const opHours = data.timeSlotsConfig.operatingHours;
                openTimeInput.value = opHours.open;
                closeTimeInput.value = opHours.close;
                
                openTimeInput.disabled = true;
                closeTimeInput.disabled = true;
                openTimeInput.style.backgroundColor = '#F8FAFC';
                closeTimeInput.style.backgroundColor = '#F8FAFC';
                
                editHoursBtn.innerHTML = '<i class="ph ph-pencil-simple"></i> <span id="edit-hours-text">Edit Operating Hours</span>';
                editHoursBtn.classList.remove('btn-primary-green');
                editHoursBtn.classList.add('btn-primary-orange');
            });
            
        } else {
            // Save editing
            isEditingHours = false;
            openTimeInput.disabled = true;
            closeTimeInput.disabled = true;
            openTimeInput.style.backgroundColor = '#F8FAFC';
            closeTimeInput.style.backgroundColor = '#F8FAFC';
            
            if (editHoursBtn.cancelNode) editHoursBtn.cancelNode.remove();
            
            saveOperatingHours(openTimeInput.value, closeTimeInput.value);
            
            editHoursBtn.innerHTML = '<i class="ph ph-pencil-simple"></i> <span id="edit-hours-text">Edit Operating Hours</span>';
            editHoursBtn.classList.remove('btn-primary-green');
            editHoursBtn.classList.add('btn-primary-orange');
        }
    });

    // Lightweight Toast Notifications
    function showToast(message) {
        let container = document.getElementById('toast-container');
        if(!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '8px';
        toast.innerHTML = `<i class="ph ph-check-circle" style="color: #10B981; font-size: 20px;"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Initialize 
    initTimeSlotData();
    renderPage();
});
