// menu.js

// Data fetched from DinetimeStore

let cart = [];
let currentCategory = 'All';
let searchQuery = '';

function renderCategories() {
  const container = document.getElementById('categoryFilters');
  const cats = ['All', 'Starter', 'Main Course', 'Deserts', 'Drinks'];
  if(container) {
      container.innerHTML = cats.map(c => 
        `<button class="btn-category ${currentCategory === c ? 'active' : ''}" data-cat="${c}">${c}</button>`
      ).join('');

      document.querySelectorAll('.btn-category').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentCategory = e.target.dataset.cat;
          renderCategories();
          renderMenu();
        });
      });
  }
}

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  if(!grid) return;

  const allMenu = DinetimeStore.getMenu();
  const filtered = allMenu.filter(item => {
    const matchCat = currentCategory === 'All' || item.cat === currentCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if(filtered.length === 0) {
    grid.innerHTML = '<p style="padding: 20px; color: #718096;">No items found matching your search.</p>';
    return;
  }

  const specials = filtered.filter(i => i.isChefSpecial);
  const regular = filtered.filter(i => !i.isChefSpecial);

  let html = '';

  if (specials.length > 0) {
    html += '<div class="menu-grid-specials">';
    specials.forEach(item => {
      html += `
        <div class="menu-special-tile">
          <span class="special-badge">Chef's Special</span>
          <img src="${item.image}" alt="${item.name}" class="special-img" onerror="this.src='../images/logo.png'">
          <div class="special-info">
            <div class="special-name-row">
              <h3 class="bar-name">${item.name}</h3>
              <span class="special-price">$${item.price.toFixed(2)}</span>
            </div>
            <button class="btn-add-special" onclick="addToCart(${item.id})">Add to order</button>
          </div>
        </div>`;
    });
    html += '</div>';
  }

  regular.forEach(item => {
    html += `
      <div class="menu-bar-item">
        <img src="${item.image}" alt="${item.name}" class="bar-img" onerror="this.src='../images/logo.png'">
        <div class="bar-info">
          <h3 class="bar-name">${item.name}</h3>
          <span class="bar-price">$${item.price.toFixed(2)}</span>
        </div>
        <button class="btn-add-simple" onclick="addToCart(${item.id})">Add to order</button>
      </div>`;
  });

  grid.innerHTML = html;
}

window.addToCart = function(id) {
  const item = DinetimeStore.getMenu().find(i => i.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({...item, qty: 1});
  }
  renderCart();
};

window.changeQty = function(id, delta) {
  const item = cart.find(c => c.id === id);
  if(!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }
  renderCart();
};

window.removeItem = function(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
};

function renderCart() {
  const cartContainer = document.getElementById('cartItems');
  const cartSummary = document.getElementById('cartSummary');
  const cartEmpty = document.getElementById('cartEmpty');

  if(!cartContainer || !cartSummary || !cartEmpty) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = '';
    cartSummary.classList.add('hidden');
    cartEmpty.classList.remove('hidden');
    return;
  }

  cartEmpty.classList.add('hidden');
  cartSummary.classList.remove('hidden');

  cartContainer.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
      </div>
      <div class="cart-controls">
        <div class="qty-btn-group">
          <button class="btn-qty" onclick="changeQty(${item.id}, -1)">-</button>
          <span class="qty-val">${item.qty}</span>
          <button class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <button class="btn-remove" onclick="removeItem(${item.id})"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  calculateTotals();
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  document.getElementById('cartSubtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('cartTax').textContent = '$' + tax.toFixed(2);
  document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type === 'error' ? 'error' : ''}`;
  const icon = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showConfirmModal(title, message, onConfirm, showCancel = true) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const msgEl = document.getElementById('modal-message');
  const btnCancel = document.getElementById('btnModalCancel');
  const btnConfirm = document.getElementById('btnModalConfirm');

  if(!overlay || !titleEl || !msgEl || !btnCancel || !btnConfirm) return;

  titleEl.innerText = title;
  msgEl.innerText = message;
  
  if (showCancel) {
      btnCancel.style.display = 'inline-block';
      btnConfirm.innerText = 'Confirm';
  } else {
      btnCancel.style.display = 'none';
      btnConfirm.innerText = 'OK';
  }

  overlay.classList.add('show');

  const closeModal = () => {
      overlay.classList.remove('show');
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

function init() {
  const params = new URLSearchParams(window.location.search);
  const resId = params.get('id');

  const reservations = DinetimeStore.getReservations() || [];
  let res = reservations.find(r => r.id === resId);

  // If we came from just viewing the menu without a specific reservation, we can fallback to the first one
  if (!res && reservations.length > 0) {
      res = reservations[0];
  }

  if(res) {
      const imgTarget = document.getElementById('infoResImg');
      if(imgTarget) imgTarget.src = res.image;

      const nameTarget = document.getElementById('infoResName');
      if(nameTarget) nameTarget.textContent = res.restaurant;

      const tableTarget = document.getElementById('infoTableNo');
      if(tableTarget) tableTarget.textContent = res.tableNo || res.tableType;

      const timeTarget = document.getElementById('infoTime');
      if(timeTarget) timeTarget.textContent = res.time || "N/A";

      const guestsTarget = document.getElementById('infoGuests');
      if(guestsTarget) guestsTarget.textContent = `${res.guests} Guests`;

      if(res.status === 'Confirmed') {
          const badge = document.getElementById('resStatusBadge');
          if(badge) {
              badge.style.display = 'flex';
          }
      }
  } else {
     // If not tied to an active reservation, use fallback
     const imgTarget = document.getElementById('infoResImg');
     if(imgTarget) imgTarget.src = '../images/indian.jpg';
     
     const nameTarget = document.getElementById('infoResName');
     if(nameTarget) nameTarget.textContent = resId ? decodeURIComponent(resId) : 'Spice Garden';
  }

  const searchInput = document.getElementById('searchInput');
  if(searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderMenu();
      });
  }

  const btnBackIcon = document.getElementById('btnBackIcon');
  if(btnBackIcon) {
      btnBackIcon.addEventListener('click', () => {
        window.history.back();
      });
  }

  const btnCheckout = document.getElementById('btnCheckout');
  if(btnCheckout) {
      btnCheckout.addEventListener('click', () => {
         showConfirmModal(
           'Order Placed', 
           'Your order has been placed successfully! Returning to your reservations.', 
           () => {
             cart = [];
             renderCart();
             window.location.href = 'reservations.html';
           },
           false
         );
      });
  }

  renderCategories();
  renderMenu();
  renderCart();
}

document.addEventListener('DOMContentLoaded', init);
