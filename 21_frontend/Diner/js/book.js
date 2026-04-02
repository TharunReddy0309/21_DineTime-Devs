// book.js

// Data fetched from DinetimeStore

let selectedTable = null;
let displayTables = [];

function getUrlId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id')) || 1;
}

function getRestaurant(id) {
  const allRestaurants = DinetimeStore.getRestaurants();
  return allRestaurants.find(r => r.id === id) || allRestaurants[0];
}

function renderBanner(restaurant) {
  const banner = document.querySelector('#restaurantBanner');
  banner.innerHTML = `
    <img src="${restaurant.image}" alt="${restaurant.name}" class="banner-img" id="bannerPhoto" style="cursor: pointer;" />
    <div class="banner-info">
      <h2>${restaurant.name}</h2>
      <p class="banner-subtitle">${restaurant.subtitle}</p>
      <div class="banner-meta">
        <span><i class="fa-solid fa-location-dot loc-icon"></i> ${restaurant.location}</span>
        <span><i class="fa-solid fa-star star-icon"></i> ${restaurant.rating}</span>
      </div>
    </div>
  `;

  document.querySelector('#bannerPhoto').addEventListener('click', () => {
    window.location.href = `restaurant.html?id=${restaurant.id}`;
  });
}

function renderTables() {
  const grid = document.querySelector('#tableGrid');
  const section = document.querySelector('#availabilitySection');
  
  const dateInput = document.querySelector('#dateInput');
  const timeInput = document.querySelector('#timeInput');
  const guestsInput = document.querySelector('#guestsInput');

  // Show section only when Date and Time are selected
  if (section) {
    if (dateInput.value && timeInput.value) {
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  }

  const allTables = DinetimeStore.getTables();

  if (selectedTable) {
    displayTables = [selectedTable];
  } else if (dateInput && timeInput && dateInput.value && timeInput.value) {
    const minSeats = parseInt(guestsInput.value) || 0; 
    displayTables = allTables.filter(t => t.status === 'available' && t.seats >= minSeats);
  } else {
    displayTables = allTables;
  }

  if (grid) {
      grid.innerHTML = displayTables.map(t => `
        <div class="table-tile ${t.status} ${selectedTable && t.id === selectedTable.id ? 'selected' : ''}" data-id="${t.id}" data-status="${t.status}">
          <i class="fa-solid fa-people-group tile-icon"></i>
          <span class="tile-name">${t.name}</span>
          <span class="tile-seats">${t.seats} Seats</span>
        </div>
      `).join('');

      grid.querySelectorAll('.table-tile').forEach(tile => {
        tile.addEventListener('click', () => handleTileClick(tile));
      });
  }
}

function handleTileClick(tile) {
  const status = tile.dataset.status;
  const id = parseInt(tile.dataset.id);

  if (status === 'reserved') {
    showToast('This table is currently reserved by another guest.', 'warn');
    return;
  }

  if (status === 'unavailable') {
    showToast('This table is unavailable at the selected time.', 'error');
    return;
  }

  const newSelection = DinetimeStore.getTables().find(t => t.id === id);

  if (selectedTable && selectedTable.id === newSelection.id) {
    selectedTable = null;
  } else {
    selectedTable = newSelection;
  }
  
  renderTables();
  renderSummary();
}

function renderSummary() {
  const body = document.querySelector('#summaryBody');
  const btn = document.querySelector('#confirmBtn');
  const hint = document.querySelector('#summaryHint');
  const restaurant = getRestaurant(getUrlId());

  const dateInput = document.querySelector('#dateInput');
  const timeInput = document.querySelector('#timeInput');
  const guestsInput = document.querySelector('#guestsInput');

  const isDetailsFilled = dateInput && timeInput && dateInput.value && timeInput.value;

  if (!selectedTable) {
    if (isDetailsFilled) {
      if(body) body.innerHTML = '<p class="summary-empty">Please pick an available table to complete your reservation.</p>';
    } else {
      if(body) body.innerHTML = '<p class="summary-empty">Set your date and time to see available tables.</p>';
    }
    if(btn) btn.disabled = true;
    if(hint) hint.textContent = 'Select a table to continue';
    return;
  }

  const dateVal = dateInput.value;
  let displayDate = 'Not selected';
  if (dateVal) {
    // Add time component to prevent timezone shifting
    const d = new Date(dateVal + 'T12:00:00');
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    displayDate = `${months[d.getMonth()]} ${d.getDate()}`;
  }

  if (body) {
      body.innerHTML = `
        <div class="summary-row">
          <i class="fa-solid fa-utensils"></i>
          <div>
            <span class="summary-label">Restaurant</span>
            <span class="summary-value">${restaurant.name}</span>
          </div>
        </div>
        <div class="summary-row">
          <i class="fa-regular fa-calendar"></i>
          <div>
            <span class="summary-label">Date</span>
            <span class="summary-value">${displayDate}</span>
          </div>
        </div>
        <div class="summary-row">
          <i class="fa-regular fa-clock"></i>
          <div>
            <span class="summary-label">Time</span>
            <span class="summary-value">${timeInput.value}</span>
          </div>
        </div>
        <div class="summary-row">
          <i class="fa-solid fa-people-group"></i>
          <div>
            <span class="summary-label">Guests</span>
            <span class="summary-value">${guestsInput.value || selectedTable.seats} People</span>
          </div>
        </div>
        <div class="summary-row">
          <i class="fa-solid fa-chair"></i>
          <div style="flex: 1;">
            <span class="summary-label">Table</span>
            <span class="summary-value">${selectedTable.name} (${selectedTable.seats} Seats)</span>
          </div>
          <button class="change-link" id="changeTableBtn">Change</button>
        </div>
      `;

      document.querySelector('#changeTableBtn').onclick = () => {
        selectedTable = null;
        renderTables();
        renderSummary();
      };
  }

  if(btn) btn.disabled = false;
  if(hint) hint.textContent = '';
}

function showToast(message, type) {
  const toast = document.querySelector('#toast');
  const msg = document.querySelector('#toastMsg');

  if(toast && msg) {
      toast.className = 'toast show ' + type;
      msg.textContent = message;

      setTimeout(() => {
        toast.className = 'toast hidden';
      }, 2500);
  }
}

function setMinDate() {
  const dateInput = document.querySelector('#dateInput');
  if(dateInput) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      
      dateInput.min = todayStr;
      if (!dateInput.value) {
        dateInput.value = todayStr;
      }
  }
}

function init() {
  const id = getUrlId();
  const restaurant = getRestaurant(id);

  document.title = 'DineTime - Book A Table';

  renderBanner(restaurant);
  setMinDate();
  renderTables();
  renderSummary();

  const dateInput = document.querySelector('#dateInput');
  const timeInput = document.querySelector('#timeInput');
  const guestsInput = document.querySelector('#guestsInput');

  if(dateInput) {
    dateInput.addEventListener('change', () => { 
      const today = new Date();
      today.setHours(0,0,0,0);
      const selected = new Date(dateInput.value);
      if (selected < today) {
        showToast('Please select a current or future date.', 'error');
        setMinDate();
      }
      selectedTable = null; 
      renderTables(); 
      renderSummary(); 
    });
  }
  if(timeInput) timeInput.addEventListener('change', () => { selectedTable = null; renderTables(); renderSummary(); });
  if(guestsInput) guestsInput.addEventListener('change', () => { selectedTable = null; renderTables(); renderSummary(); });

  const confirmBtn = document.querySelector('#confirmBtn');
  if(confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const dateVal = dateInput.value;
        const timeVal = timeInput.value;
        const guestsVal = guestsInput.value || selectedTable.seats;
        const tableLabel = selectedTable
          ? (selectedTable.seats <= 3 ? 'Window Table' : selectedTable.seats <= 5 ? 'Indoor Table' : 'Large Table')
          : 'Indoor Table';
        const tableNameStr = selectedTable ? selectedTable.name : 'Table NO-5';
        const restaurantId = getUrlId();

        const params = new URLSearchParams({
          id: restaurantId,
          date: dateVal,
          time: timeVal,
          guests: guestsVal,
          table: tableLabel,
          tableName: tableNameStr,
          special: 'Window seat if available'
        });

        window.location.href = `payment_making.html?${params.toString()}`;
      });
  }

  const searchInput = document.querySelector('#globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('click', () => { window.location.href = `search.html`; });
    searchInput.addEventListener('focus', () => { window.location.href = `search.html`;  });
  }
}

document.addEventListener('DOMContentLoaded', init);
