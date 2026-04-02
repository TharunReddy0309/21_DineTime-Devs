// Mock data for 20 tables
let tableList = [];
let currentFilter = 'All';
let editingTableId = null;

// Auth Guard
function checkAuth() {
    const session = localStorage.getItem('dinetime_session');
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    loadProfileName();
    loadTablesFromStorage();
    setupEventListeners();
    updateStats();
    renderTables();
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

function loadTablesFromStorage() {
    const storedData = localStorage.getItem('dinetime_tables');
    if (storedData) {
        tableList = JSON.parse(storedData);
    } else {
        tableList = [
            { id: 1, seats: 2, status: 'Available' },
            { id: 2, seats: 4, status: 'Occupied', guests: 2, time: '15 min ago' },
            { id: 3, seats: 4, status: 'Available' },
            { id: 4, seats: 6, status: 'Reserved' },
            { id: 5, seats: 8, status: 'Available' },
            { id: 6, seats: 4, status: 'Occupied', guests: 3, time: '28 min ago' },
            { id: 7, seats: 6, status: 'Reserved' },
            { id: 8, seats: 4, status: 'Available' },
            { id: 9, seats: 2, status: 'Occupied', guests: 2, time: '42 min ago' },
            { id: 10, seats: 4, status: 'Available' },
            { id: 11, seats: 6, status: 'Occupied', guests: 5, time: '12 min ago' },
            { id: 12, seats: 2, status: 'Available' },
            { id: 13, seats: 4, status: 'Reserved' },
            { id: 14, seats: 6, status: 'Available' },
            { id: 15, seats: 2, status: 'Occupied', guests: 2, time: '8 min ago' },
            { id: 16, seats: 8, status: 'Reserved' },
            { id: 17, seats: 4, status: 'Available' },
            { id: 18, seats: 6, status: 'Occupied', guests: 6, time: '35 min ago' },
            { id: 19, seats: 2, status: 'Available' },
            { id: 20, seats: 4, status: 'Occupied', guests: 3, time: '19 min ago' }
        ];
        saveTablesToStorage();
    }
}

function saveTablesToStorage() {
    localStorage.setItem('dinetime_tables', JSON.stringify(tableList));
}

// Update the summary counts based on the current tableList
function updateStats() {
    const total = tableList.length;
    const available = tableList.filter(t => t.status === 'Available').length;
    const reserved = tableList.filter(t => t.status === 'Reserved').length;
    const occupied = tableList.filter(t => t.status === 'Occupied').length;

    document.getElementById('total-tables').innerText = total;
    document.getElementById('available-count').innerText = available;
    document.getElementById('reserved-count').innerText = reserved;
    document.getElementById('occupied-count').innerText = occupied;
}

// Bind event listeners for the filter chips and modal
function setupEventListeners() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            currentFilter = chip.getAttribute('data-status');
            renderTables();
        });
    });

    const modal = document.getElementById('status-modal');
    const closeBtn = document.getElementById('close-status-modal');
    const cancelBtn = document.getElementById('cancel-status-btn');
    const saveBtn = document.getElementById('save-status-btn');

    const closeModal = () => modal.classList.remove('active');

    if (closeBtn && cancelBtn && modal) {
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (editingTableId === null) return;
            
            const newStatus = document.getElementById('new-status-select').value;
            const tableIndex = tableList.findIndex(t => t.id === editingTableId);
            
            if (tableIndex !== -1) {
                tableList[tableIndex].status = newStatus;
                
                // Assign mock guests/time if manually switched to Occupied
                if (newStatus === 'Occupied' && !tableList[tableIndex].guests) {
                   tableList[tableIndex].guests = Math.max(1, Math.floor(tableList[tableIndex].seats / 2));
                   tableList[tableIndex].time = 'Just now';
                }
                
                saveTablesToStorage();
                updateStats();
                renderTables();
                closeModal();
            }
        });
    }
}

// Render the 20 table cards into the floor-map grid
function renderTables() {
    const container = document.getElementById('floor-map');
    if (!container) return;

    container.innerHTML = '';

    const filteredTables = tableList.filter(t => 
        currentFilter === 'All' || t.status === currentFilter
    );

    filteredTables.forEach(table => {
        const card = document.createElement('div');
        const statusClass = table.status.toLowerCase();
        card.className = `table-card ${statusClass}`;

        // Details hidden for all statuses as requested
        let detailHtml = '';

        card.innerHTML = `
            <div class="table-header">
                <span class="table-number">Table ${table.id}</span>
                <span class="table-seats"><i class="fa-solid fa-users"></i> ${table.seats} Seats</span>
            </div>
            <div class="table-body">
                <span class="table-status-label">${table.status}</span>
                ${detailHtml}
            </div>
        `;

        card.addEventListener('click', () => {
            editingTableId = table.id;
            document.getElementById('modal-table-num').innerText = `Table ${table.id}`;
            document.getElementById('modal-table-seats').innerText = `${table.seats} Seats`;
            document.getElementById('modal-table-status').innerText = table.status;
            document.getElementById('new-status-select').value = table.status;
            
            document.getElementById('status-modal').classList.add('active');
        });

        container.appendChild(card);
    });
}
