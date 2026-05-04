const API_BASE = (window.DINETIME_CONFIG && window.DINETIME_CONFIG.API_BASE) || 'http://localhost:3000';
const API_ROLE = 'super_user';
const STORAGE_KEYS = {
  activeTab: 'dt_active_tab_v6',
};



const ROLE_LABELS = {
  diner: 'Diner',
  manager: 'Restaurant Manager',
  staff: 'Restaurant Staff',
  super_user: 'Super User',
};

const ROLE_VALUES = {
  Diner: 'diner',
  'Restaurant Manager': 'manager',
  'Restaurant Staff': 'staff',
};

const state = {
  restaurants: [],
  users: [],
  reservations: [],
  payments: [],
  notifications: [],
  tables: [],
  timeslots: [],
  tableSlots: [],
  locations: {},
  auditLog: [],
  refreshTimer: null,
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readJson(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJson(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
}

function getAuditLog() {
  return state.auditLog;
}

function addAuditLog(message) {
  state.auditLog.push({
    time: new Date().toLocaleTimeString('en-GB'),
    message,
  });
  renderAuditLogs();
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      role: API_ROLE,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = Array.isArray(body.message) ? body.message.join(', ') : (body.message || message);
    } catch (_error) {
    }
    throw new Error(message);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function formatCurrency(amount) {
  return `INR ${Number(amount || 0).toLocaleString('en-IN')}`;
}

function mapRestaurantStatus(status) {
  return status === 'active' ? 'Verified' : 'Pending';
}

function mapUserStatus(status) {
  return status === 'active' ? 'Active' : 'Suspended';
}

function mapPaymentStatus(status) {
  if (status === 'paid') return 'Success';
  if (status === 'failed') return 'Failed';
  return 'Pending';
}

function mapReservationStatus(status) {
  if (status === 'checked_in') return 'Customer Check-In';
  if (status === 'cancelled' || status === 'no_show') return 'No-Show';
  if (status === 'completed') return 'Completed';
  return 'Booking';
}

function toBackendReservationStatus(label) {
  if (label === 'Customer Check-In') return 'checked_in';
  if (label === 'No-Show') return 'no_show';
  if (label === 'Completed') return 'completed';
  return 'reserved';
}

function toBackendAccountStatus(label) {
  return label === 'Active' ? 'active' : 'inactive';
}

function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}

function locationForRestaurant(restaurant) {
  return state.locations[restaurant.location_id] || null;
}

function restaurantsById() {
  return Object.fromEntries(state.restaurants.map((restaurant) => [restaurant.id, restaurant]));
}

function usersById() {
  return Object.fromEntries(state.users.map((user) => [user.id, user]));
}

function getRestaurantDisplay(restaurant) {
  const manager = state.users.find((user) => user.id === restaurant.manager_id);
  const location = locationForRestaurant(restaurant);
  const tables = state.tables.filter((table) => table.restaurant_id === restaurant.id);
  const reservations = state.reservations.filter((reservation) => reservation.restaurant_id === restaurant.id);
  const slots = state.timeslots
    .filter((slot) => slot.restaurant_id === restaurant.id)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));

  const timeSlots = Array.from(
    new Set(slots.map((slot) => `${String(slot.start_time).slice(0, 5)}-${String(slot.end_time).slice(0, 5)}`)),
  ).slice(0, 3).join(', ');

  return {
    id: restaurant.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine_type,
    tables: tables.length || Number(restaurant.total_tables) || 0,
    address: location?.address || 'Address not set',
    city: location?.city || 'Unknown',
    pincode: location?.pincode || '',
    managerName: manager?.name || 'Unassigned',
    managerEmail: manager?.email || '',
    license: manager?.business_license_number || '',
    timeSlots: timeSlots || 'Not configured',
    status: mapRestaurantStatus(restaurant.status),
    activeReservations: reservations.filter((reservation) =>
      !['cancelled', 'completed', 'no_show'].includes(reservation.reservation_status)).length,
    manager_id: restaurant.manager_id,
    location_id: restaurant.location_id,
  };
}

function getUserDisplay(user) {
  const restaurant = user.role === 'manager'
    ? state.restaurants.find((item) => item.manager_id === user.id)
    : state.restaurants.find((item) => item.id === user.restaurant_id);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: roleLabel(user.role),
    node: restaurant?.name || 'N/A',
    status: mapUserStatus(user.status),
    restaurant_id: restaurant?.id || user.restaurant_id || '',
    business_license_number: user.business_license_number || '',
    location_id: user.location_id || restaurant?.location_id || '',
  };
}

function getReservationDisplay(reservation) {
  const user = state.users.find((item) => item.id === reservation.user_id);
  const restaurant = state.restaurants.find((item) => item.id === reservation.restaurant_id);
  const slot = state.timeslots.find((item) => item.id === reservation.slot_id);
  return {
    id: reservation.id,
    dinerName: user?.name || 'Guest',
    dinerId: reservation.user_id,
    restaurantName: restaurant?.name || 'Restaurant',
    restaurantId: reservation.restaurant_id,
    date: slot?.slot_date || '',
    time: String(slot?.start_time || '').slice(0, 5),
    party: reservation.guest_count,
    status: mapReservationStatus(reservation.reservation_status),
    raw: reservation,
  };
}

function getPaymentDisplay(payment) {
  const reservation = state.reservations.find((item) => item.id === payment.reservation_id);
  const user = state.users.find((item) => item.id === reservation?.user_id);
  const restaurant = state.restaurants.find((item) => item.id === reservation?.restaurant_id);
  return {
    id: payment.id,
    user: user?.name || 'Guest',
    userId: reservation?.user_id || 'N/A',
    restaurant: restaurant?.name || 'Restaurant',
    restaurantId: reservation?.restaurant_id || 'N/A',
    amount: formatCurrency(payment.amount),
    method: payment.payment_method,
    status: mapPaymentStatus(payment.payment_status),
  };
}

async function syncAdminState() {
  const endpoints = [
    '/restaurants',
    '/users',
    '/reservations',
    '/payments',
    '/tables',
    '/timeslots',
    '/tableslots',
    '/notifications',
  ];

  const settled = await Promise.allSettled(endpoints.map((path) => apiRequest(path)));
  const payloads = settled.map((result) => (result.status === 'fulfilled' ? result.value : null));
  const [
    restaurantsRes,
    usersRes,
    reservationsRes,
    paymentsRes,
    tablesRes,
    timeslotsRes,
    tableSlotsRes,
    notificationsRes,
  ] = payloads;

  state.restaurants = restaurantsRes?.data || state.restaurants;
  state.users = usersRes?.data || state.users;
  state.reservations = reservationsRes?.data || state.reservations;
  state.payments = paymentsRes?.data || state.payments;
  state.tables = tablesRes?.data || state.tables;
  state.timeslots = timeslotsRes?.data || state.timeslots;
  state.tableSlots = tableSlotsRes?.data || state.tableSlots;
  state.notifications = notificationsRes?.data || state.notifications;

  const locationIds = Array.from(new Set(state.restaurants.map((restaurant) => restaurant.location_id).filter(Boolean)));
  const locationEntries = await Promise.all(locationIds.map(async (locationId) => {
    try {
      const response = await apiRequest(`/restaurants/locations/${locationId}`);
      return [locationId, response?.data || null];
    } catch (_error) {
      return [locationId, null];
    }
  }));

  state.locations = Object.fromEntries(locationEntries);

  renderAll();
}

function startAutoRefresh() {
  if (state.refreshTimer) {
    clearInterval(state.refreshTimer);
  }

  state.refreshTimer = setInterval(() => {
    syncAdminState().catch(() => {});
  }, 15000);

  window.addEventListener('focus', () => {
    syncAdminState().catch(() => {});
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      syncAdminState().catch(() => {});
    }
  });
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${escapeHtml(message)}`;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showConfirmModal(title, message, onConfirm) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const messageEl = document.getElementById('modal-message');
  const confirmBtn = document.getElementById('btnModalConfirm');
  const cancelBtn = document.getElementById('btnModalCancel');
  if (!overlay || !titleEl || !messageEl || !confirmBtn || !cancelBtn) return;

  titleEl.textContent = title;
  messageEl.textContent = message;
  overlay.style.display = 'flex';

  const close = () => {
    overlay.style.display = 'none';
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
  };

  cancelBtn.onclick = close;
  confirmBtn.onclick = async () => {
    close();
    await onConfirm();
  };
}

function updateAllKPIs() {
  const activeReservations = state.reservations.filter((reservation) =>
    !['cancelled', 'completed', 'no_show'].includes(reservation.reservation_status));
  const totalRevenue = state.payments
    .filter((payment) => payment.payment_status === 'paid')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const pendingRestaurants = state.restaurants.filter((restaurant) => restaurant.status !== 'active').length;
  const dinerCount = state.users.filter((user) => user.role === 'diner').length;
  const successCount = state.payments.filter((payment) => payment.payment_status === 'paid').length;
  const failedCount = state.payments.filter((payment) => payment.payment_status === 'failed').length;
  const refundTotal = state.payments
    .filter((payment) => payment.payment_status === 'refunded')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const byId = (id) => document.getElementById(id);
  if (byId('dashTotalBookings')) byId('dashTotalBookings').textContent = String(activeReservations.length);
  if (byId('dashTotalUsers')) byId('dashTotalUsers').textContent = String(dinerCount);
  if (byId('dashTotalRes')) byId('dashTotalRes').textContent = String(state.restaurants.length);
  if (byId('dashTotalRev')) byId('dashTotalRev').textContent = formatCurrency(totalRevenue);
  if (byId('dashPendingApps')) byId('dashPendingApps').textContent = String(pendingRestaurants);
  if (byId('resTabTotalRes')) byId('resTabTotalRes').textContent = String(state.restaurants.length);
  if (byId('resTabActiveBooks')) byId('resTabActiveBooks').textContent = String(activeReservations.length);
  if (byId('resTabTotalCapacity')) {
    byId('resTabTotalCapacity').textContent = String(
      state.tables.length || state.restaurants.reduce((sum, restaurant) => sum + Number(restaurant.total_tables || 0), 0),
    );
  }
  if (byId('paySuccessCount')) byId('paySuccessCount').textContent = String(successCount);
  if (byId('payFailedCount')) byId('payFailedCount').textContent = String(failedCount);
  if (byId('payRefundTotal')) byId('payRefundTotal').textContent = formatCurrency(refundTotal);
}

function renderGlobalTable() {
  const tbody = document.getElementById('globalRestaurantsBody');
  if (!tbody) return;

  const query = (document.getElementById('resDirectorySearch')?.value || '').trim().toLowerCase();
  const statusFilter = document.getElementById('resStatusFilter')?.value || '';

  const rows = state.restaurants
    .map(getRestaurantDisplay)
    .filter((restaurant) => {
      const matchesQuery = !query
        || restaurant.name.toLowerCase().includes(query)
        || restaurant.city.toLowerCase().includes(query)
        || restaurant.id.toLowerCase().includes(query)
        || restaurant.managerName.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || restaurant.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

  tbody.innerHTML = '';
  rows.forEach((restaurant) => {
    const statusColor = restaurant.status === 'Verified' ? '#2E7D32' : '#F57F17';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <code style="color:var(--text-muted)">${escapeHtml(restaurant.id)}</code><br>
        <b style="display:inline-block; margin-top:4px;">${escapeHtml(restaurant.name)}</b><br>
        <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(restaurant.cuisine)} • ${escapeHtml(restaurant.city)}</span>
      </td>
      <td>${escapeHtml(String(restaurant.tables))} tables<br><span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(String(restaurant.activeReservations))} active bookings</span></td>
      <td>${escapeHtml(restaurant.managerName)}<br><span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(restaurant.managerEmail)}</span></td>
      <td style="color:${statusColor}; font-weight:700;">${escapeHtml(restaurant.status)}</td>
      <td style="text-align:right;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button class="btn-outline btn-sm" style="color:#E67E22; border-color:#E67E22; width:32px; height:32px; padding:0;" onclick="editRestaurant('${escapeHtml(restaurant.id)}')" title="View / Edit"><i class="fa-solid fa-eye"></i></button>
          <button class="btn-outline btn-sm" style="color:#C62828; border-color:#ffcdd2; background:#FFEBEE; width:32px; height:32px; padding:0;" onclick="deleteRestaurant('${escapeHtml(restaurant.id)}', '${escapeHtml(restaurant.name)}')" title="Delete Restaurant"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderUsersTable() {
  const tbody = document.getElementById('globalUsersBody');
  if (!tbody) return;

  const query = (document.getElementById('userDirectorySearch')?.value || '').trim().toLowerCase();
  const roleFilter = document.getElementById('userRoleFilter')?.value || '';
  const statusFilter = document.getElementById('userStatusFilter')?.value || '';

  const rows = state.users
    .filter((user) => user.role !== 'super_user')
    .map(getUserDisplay)
    .filter((user) => {
      const matchesQuery = !query
        || user.id.toLowerCase().includes(query)
        || user.name.toLowerCase().includes(query)
        || user.email.toLowerCase().includes(query)
        || user.role.toLowerCase().includes(query);
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });

  tbody.innerHTML = '';
  rows.forEach((user) => {
    const statusColor = user.status === 'Active' ? '#2E7D32' : '#C62828';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <code style="color:var(--text-muted)">${escapeHtml(user.id)}</code><br>
        <b style="display:inline-block; margin-top:4px;">${escapeHtml(user.name)}</b><br>
        <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(user.email)}</span>
      </td>
      <td>${escapeHtml(user.role)}</td>
      <td>${escapeHtml(user.node)}</td>
      <td style="color:${statusColor}; font-weight:700;">${escapeHtml(user.status)}</td>
      <td style="text-align:right;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button class="btn-outline btn-sm" style="color:#E67E22; border-color:#E67E22; width:32px; height:32px; padding:0;" onclick="editUser('${escapeHtml(user.id)}')" title="View / Edit"><i class="fa-solid fa-eye"></i></button>
          <button class="btn-outline btn-sm" style="color:#C62828; border-color:#ffcdd2; background:#FFEBEE; width:32px; height:32px; padding:0;" onclick="deleteUser('${escapeHtml(user.id)}', '${escapeHtml(user.email)}')" title="Delete User"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderReservationsTable() {
  const tbody = document.getElementById('globalReservationsBody');
  if (!tbody) return;

  const filterType = document.getElementById('resFilterType')?.value || 'restaurantName';
  const query = (document.getElementById('resSearchQuery')?.value || '').trim().toLowerCase();
  const dateFilter = document.getElementById('resSearchDate')?.value || '';
  const statusFilter = document.getElementById('resBookingStatusFilter')?.value || '';

  const rows = state.reservations
    .map(getReservationDisplay)
    .filter((reservation) => {
      if (dateFilter && reservation.date !== dateFilter) return false;
      if (statusFilter && reservation.status !== statusFilter) return false;
      if (!query) return true;
      const haystacks = {
        restaurantName: reservation.restaurantName.toLowerCase(),
        restaurantId: reservation.restaurantId.toLowerCase(),
        dinerName: reservation.dinerName.toLowerCase(),
        dinerId: reservation.dinerId.toLowerCase(),
      };
      return (haystacks[filterType] || '').includes(query);
    });

  tbody.innerHTML = '';
  rows.forEach((reservation) => {
    let badge = '<span class="badge badge-blue"><i class="fa-solid fa-calendar"></i> Booking</span>';
    if (reservation.status === 'Customer Check-In') {
      badge = '<span class="badge badge-green"><i class="fa-solid fa-check"></i> Check-In</span>';
    } else if (reservation.status === 'No-Show') {
      badge = '<span class="badge badge-red"><i class="fa-solid fa-triangle-exclamation"></i> No-Show</span>';
    } else if (reservation.status === 'Completed') {
      badge = '<span class="badge badge-green"><i class="fa-solid fa-flag-checkered"></i> Completed</span>';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="color:var(--text-muted)">${escapeHtml(reservation.id)}</code><br><span style="font-size:0.75rem;">${escapeHtml(reservation.date)} ${escapeHtml(reservation.time)}</span></td>
      <td><code style="background:#f0f0f0; padding:2px 4px; border-radius:4px; color:var(--text-muted); font-size:0.7rem;">${escapeHtml(reservation.dinerId)}</code><br><b style="display:inline-block; margin-top:4px;">${escapeHtml(reservation.dinerName)}</b></td>
      <td><code style="background:#f0f0f0; padding:2px 4px; border-radius:4px; color:var(--text-muted); font-size:0.7rem;">${escapeHtml(reservation.restaurantId)}</code><br><b style="display:inline-block; margin-top:4px;">${escapeHtml(reservation.restaurantName)}</b></td>
      <td>${escapeHtml(String(reservation.party))}</td>
      <td>${badge}</td>
      <td style="text-align:right;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button class="btn-outline btn-sm" style="color:#E67E22; border-color:#E67E22; width:32px; height:32px; padding:0;" onclick="editReservation('${escapeHtml(reservation.id)}')" title="View / Edit"><i class="fa-solid fa-eye"></i></button>
          <button class="btn-outline btn-sm" style="color:#C62828; border-color:#ffcdd2; background:#FFEBEE; width:32px; height:32px; padding:0;" onclick="deleteReservation('${escapeHtml(reservation.id)}', '${escapeHtml(reservation.dinerName)}')" title="Cancel Reservation"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPaymentsTable() {
  const tbody = document.getElementById('globalPaymentsBody');
  if (!tbody) return;

  const rows = state.payments.map(getPaymentDisplay);
  tbody.innerHTML = '';
  rows.forEach((payment) => {
    const badgeClass = payment.status === 'Success'
      ? 'badge-green'
      : payment.status === 'Failed'
        ? 'badge-red'
        : 'badge-yellow';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><code style="color:var(--text-muted)">${escapeHtml(payment.id)}</code></td>
      <td><code style="background:#f0f0f0; padding:2px 4px; border-radius:4px; color:var(--text-muted); font-size:0.7rem;">${escapeHtml(payment.userId)}</code><br><b style="display:inline-block; margin-top:4px;">${escapeHtml(payment.user)}</b></td>
      <td><code style="background:#f0f0f0; padding:2px 4px; border-radius:4px; color:var(--text-muted); font-size:0.7rem;">${escapeHtml(payment.restaurantId)}</code><br><b style="display:inline-block; margin-top:4px;">${escapeHtml(payment.restaurant)}</b></td>
      <td style="font-weight:700;">${escapeHtml(payment.amount)}</td>
      <td>${escapeHtml(payment.method)}</td>
      <td><span class="badge ${badgeClass}">${escapeHtml(payment.status)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderAuditLogs() {
  const container = document.getElementById('auditLogsContainer');
  if (!container) return;

  const logData = getAuditLog();
  container.innerHTML = '';
  for (let index = logData.length - 1; index >= 0; index -= 1) {
    const log = logData[index];
    const div = document.createElement('div');
    div.style = 'display:flex; align-items:flex-start; gap:1rem; padding:1rem 1.25rem; border-bottom:1px solid var(--border-light);';
    div.innerHTML = `
      <div style="font-family:monospace; color:var(--text-muted); width:80px; flex-shrink:0; font-size:0.8rem;">${escapeHtml(log.time)}</div>
      <div style="color:var(--text-dark); font-size:0.9rem;">${escapeHtml(log.message)}</div>
    `;
    container.appendChild(div);
  }
}

function generateReport() {
  const scope = document.getElementById('reportScope')?.value || 'platform';
  const query = (document.getElementById('reportRestaurantSearch')?.value || '').trim().toLowerCase();

  const restaurants = state.restaurants
    .map(getRestaurantDisplay)
    .filter((restaurant) => {
      const matchesScope = scope === 'platform' || restaurant.city === scope;
      const matchesQuery = !query || restaurant.name.toLowerCase().includes(query);
      return matchesScope && matchesQuery;
    });

  if (document.getElementById('repNodes')) {
    document.getElementById('repNodes').textContent = String(restaurants.length);
  }

  const restaurantIds = new Set(restaurants.map((restaurant) => restaurant.id));
  const filteredReservations = state.reservations.filter((reservation) => restaurantIds.has(reservation.restaurant_id));
  const filteredPayments = state.payments.filter((payment) => {
    const reservation = state.reservations.find((item) => item.id === payment.reservation_id);
    return reservation && restaurantIds.has(reservation.restaurant_id) && payment.payment_status === 'paid';
  });
  const filteredTables = state.tables.filter((table) => restaurantIds.has(table.restaurant_id));
  const revenue = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const bookings = filteredReservations.length;
  const capacityPct = filteredTables.length
    ? Math.min(Math.round((bookings / filteredTables.length) * 100), 100)
    : 0;

  if (document.getElementById('repBook')) document.getElementById('repBook').textContent = String(bookings);
  if (document.getElementById('repRev')) document.getElementById('repRev').textContent = formatCurrency(revenue);
  if (document.getElementById('repCap')) document.getElementById('repCap').textContent = `${capacityPct}%`;

  const cuisineStats = {};
  restaurants.forEach((restaurant) => {
    cuisineStats[restaurant.cuisine] = (cuisineStats[restaurant.cuisine] || 0) + restaurant.activeReservations;
  });

  const cuisineBarsContainer = document.getElementById('cuisineBarsContainer');
  if (cuisineBarsContainer) {
    const colors = ['var(--primary-green)', '#1976D2', '#F57F17', '#C62828', '#00897B'];
    const maxCount = Math.max(1, ...Object.values(cuisineStats), 1);
    const rows = Object.entries(cuisineStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], index) => {
        const pct = Math.round((count / maxCount) * 100);
        return `
          <div style="margin-bottom:0.75rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <span style="color:var(--text-dark); font-weight:600; font-size:0.85rem;">${escapeHtml(name)}</span>
              <span style="color:var(--text-muted); font-size:0.8rem;">${escapeHtml(String(count))}</span>
            </div>
            <div style="width:100%; background:#F1F5F9; height:8px; border-radius:4px; overflow:hidden;">
              <div style="width:${pct}%; background:${colors[index % colors.length]}; height:100%; border-radius:4px;"></div>
            </div>
          </div>
        `;
      });
    cuisineBarsContainer.innerHTML = rows.join('') || '<p style="color:var(--text-muted); font-size:0.85rem;">No data available.</p>';
  }

  const revenueListContainer = document.getElementById('revenueListContainer');
  if (revenueListContainer) {
    const items = restaurants
      .map((restaurant) => {
        const total = filteredPayments
          .filter((payment) => {
            const reservation = state.reservations.find((item) => item.id === payment.reservation_id);
            return reservation?.restaurant_id === restaurant.id;
          })
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        return { restaurant, total };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(({ restaurant, total }) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 0; border-bottom:1px solid var(--border-light);">
          <div>
            <div style="font-weight:700; color:var(--text-dark);">${escapeHtml(restaurant.name)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(restaurant.city)} • ${escapeHtml(String(restaurant.activeReservations))} active bookings</div>
          </div>
          <div style="color:#2E7D32; font-weight:800;">${escapeHtml(formatCurrency(total))}</div>
        </div>
      `);
    revenueListContainer.innerHTML = items.join('') || '<p style="color:var(--text-muted); font-size:0.85rem;">No revenue generated yet.</p>';
  }
}

function renderRecentActivity() {
  const container = document.getElementById('recentActivityContainer');
  if (!container) return;

  const items = [];

  // Pull most recent 3 reservations
  const sortedReservations = [...state.reservations]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 3);

  sortedReservations.forEach((reservation) => {
    const user = state.users.find((u) => u.id === reservation.user_id);
    const restaurant = state.restaurants.find((r) => r.id === reservation.restaurant_id);
    const status = reservation.reservation_status;
    let icon = 'fa-calendar-check';
    let color = '#1976D2';
    let label = 'New reservation';
    if (status === 'cancelled' || status === 'no_show') { icon = 'fa-triangle-exclamation'; color = '#C62828'; label = 'Reservation cancelled'; }
    else if (status === 'completed') { icon = 'fa-flag-checkered'; color = '#2E7D32'; label = 'Reservation completed'; }
    else if (status === 'checked_in') { icon = 'fa-circle-check'; color = '#2E7D32'; label = 'Customer checked in'; }
    const name = user?.name || 'A diner';
    const rest = restaurant?.name || 'a restaurant';
    items.push({ icon, color, text: `${escapeHtml(label)}: ${escapeHtml(name)} at ${escapeHtml(rest)}`, id: reservation.id });
  });

  // Pull most recent 2 payments
  const sortedPayments = [...state.payments]
    .filter((p) => p.payment_status === 'paid')
    .sort((a, b) => new Date(b.payment_time || 0) - new Date(a.payment_time || 0))
    .slice(0, 2);

  sortedPayments.forEach((payment) => {
    const reservation = state.reservations.find((r) => r.id === payment.reservation_id);
    const restaurant = state.restaurants.find((r) => r.id === reservation?.restaurant_id);
    items.push({
      icon: 'fa-indian-rupee-sign',
      color: '#2E7D32',
      text: `Payment received: ${escapeHtml(formatCurrency(payment.amount))} for ${escapeHtml(restaurant?.name || 'a restaurant')}`,
      id: payment.id,
    });
  });

  if (items.length === 0) {
    container.innerHTML = '<div style="padding: 1.25rem; color: var(--text-muted); font-size: 0.875rem;">No recent activity yet.</div>';
    return;
  }

  container.innerHTML = items.map((item, index) => `
    <div style="display: flex; gap: 1rem; padding: 1rem 1.25rem; ${index < items.length - 1 ? 'border-bottom: 1px solid var(--border-light);' : ''} align-items: center;">
      <i class="fa-solid ${escapeHtml(item.icon)}" style="color: ${item.color}; font-size: 1.1rem; width: 20px; text-align: center;"></i>
      <div style="font-weight: 500; font-size: 0.85rem; color: var(--text-dark);">${item.text}</div>
    </div>
  `).join('');
}

function renderAll() {
  updateAllKPIs();
  renderGlobalTable();
  renderUsersTable();
  renderReservationsTable();
  renderPaymentsTable();
  renderAuditLogs();
  renderRecentActivity();
  generateReport();
}

function ensureRestaurantSelects() {
  const options = state.restaurants.map((restaurant) =>
    `<option value="${escapeHtml(restaurant.id)}">${escapeHtml(restaurant.name)}</option>`);
  const nodeSelect = document.getElementById('userNode');
  const reservationSelect = document.getElementById('bkgRestaurant');
  if (nodeSelect) {
    nodeSelect.innerHTML = '<option value="">Select Restaurant...</option>' + options.join('');
  }
  if (reservationSelect) {
    reservationSelect.innerHTML = '<option value="">Select Restaurant...</option>' + options.join('');
  }
}

function generatedLocationId() {
  return `loc_admin_${Date.now()}`;
}

function parseTimeTo24Hour(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;

  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = match[3].toUpperCase();
  if (suffix === 'AM' && hour === 12) hour = 0;
  if (suffix === 'PM' && hour !== 12) hour += 12;
  return `${String(hour).padStart(2, '0')}:${minute}`;
}

function parseOperatingHours(value) {
  const parts = String(value || '').split('-');
  if (parts.length !== 2) {
    return null;
  }

  const start = parseTimeTo24Hour(parts[0]);
  const end = parseTimeTo24Hour(parts[1]);
  if (!start || !end) {
    return null;
  }

  return { start, end };
}

async function ensureRestaurantInfrastructure(restaurantId, tableCount, hoursLabel) {
  const currentTables = state.tables.filter((table) => table.restaurant_id === restaurantId).length;
  if (currentTables === 0) {
    const capacityPattern = [2, 2, 4, 4, 4, 6, 6, 8];
    for (let index = 0; index < tableCount; index += 1) {
      await apiRequest('/tables', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: restaurantId,
          table_number: index + 1,
          capacity: capacityPattern[index % capacityPattern.length],
        }),
      });
    }
  }

  const currentSlots = state.timeslots.filter((slot) => slot.restaurant_id === restaurantId).length;
  const parsedHours = parseOperatingHours(hoursLabel);
  if (currentSlots === 0 && parsedHours) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const slotDate = date.toISOString().split('T')[0];
      await apiRequest('/timeslots', {
        method: 'POST',
        body: JSON.stringify({
          restaurant_id: restaurantId,
          slot_date: slotDate,
          start_time: parsedHours.start,
          end_time: parsedHours.end,
        }),
      });
    }
  }

  await apiRequest('/tableslots/seed', {
    method: 'POST',
    body: JSON.stringify({ restaurant_id: restaurantId }),
  });
}

async function saveRestaurant(event) {
  event.preventDefault();

  const formData = {
    id: document.getElementById('resId').value,
    name: document.getElementById('resName').value.trim(),
    cuisine: document.getElementById('resCuisine').value.trim(),
    tables: Number(document.getElementById('resTables').value || 0),
    address: document.getElementById('resAddress').value.trim(),
    city: document.getElementById('resCity').value.trim(),
    pincode: document.getElementById('resPincode').value.trim(),
    managerName: document.getElementById('resManagerName').value.trim(),
    managerEmail: document.getElementById('resManagerEmail').value.trim().toLowerCase(),
    license: document.getElementById('resLicense').value.trim(),
    timeSlots: document.getElementById('resTimeSlots').value.trim(),
    status: document.getElementById('resStatus').value,
  };

  const restaurantStatus = formData.status === 'Verified' ? 'active' : 'inactive';
  const verified = formData.status === 'Verified';

  let manager = state.users.find((user) => user.email.toLowerCase() === formData.managerEmail);
  if (manager && manager.role !== 'manager') {
    throw new Error('That email already belongs to a non-manager account');
  }

  if (!manager) {
    const createdManager = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: formData.managerName,
        email: formData.managerEmail,
        password_hash: 'password123',
        role: 'manager',
        status: restaurantStatus,
        location_id: generatedLocationId(),
        business_license_number: formData.license,
        government_id: '',
        verified_status: verified,
      }),
    });
    manager = createdManager?.data;
  } else {
    await apiRequest(`/users/${manager.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: formData.managerName,
        email: formData.managerEmail,
        status: restaurantStatus,
        business_license_number: formData.license,
        verified_status: verified,
      }),
    });
  }

  const existingRestaurant = state.restaurants.find((restaurant) => restaurant.id === formData.id);
  const locationId = existingRestaurant?.location_id || manager.location_id || generatedLocationId();
  await apiRequest('/restaurants/locations', {
    method: 'POST',
    body: JSON.stringify({
      id: locationId,
      latitude: 12.9716,
      longitude: 77.5946,
      city: formData.city,
      pincode: formData.pincode,
      address: formData.address,
      country: 'India',
    }),
  });

  let restaurantId = formData.id;
  const payload = {
    manager_id: manager.id,
    location_id: locationId,
    name: formData.name,
    cuisine_type: formData.cuisine,
    description: `${formData.name} restaurant`,
    total_tables: formData.tables,
    status: restaurantStatus,
    image_urls: existingRestaurant?.image_urls || [],
  };

  if (existingRestaurant) {
    await apiRequest(`/restaurants/${existingRestaurant.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  } else {
    const created = await apiRequest('/restaurants', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    restaurantId = created?.data?.id;
  }

  if (restaurantId) {
    await syncAdminState();
    await ensureRestaurantInfrastructure(restaurantId, formData.tables, formData.timeSlots);
  }

  await syncAdminState();
  closeRestaurantModal();
  showToast(existingRestaurant ? 'Restaurant updated.' : 'Restaurant created.');
  addAuditLog(`${existingRestaurant ? 'Updated' : 'Created'} restaurant ${formData.name}`);
}

async function saveUser(event) {
  event.preventDefault();

  const id = document.getElementById('userId').value;
  const roleLabelValue = document.getElementById('userRole').value;
  const role = ROLE_VALUES[roleLabelValue];
  const restaurantId = document.getElementById('userNode').value;
  const payload = {
    name: document.getElementById('userName').value.trim(),
    email: document.getElementById('userEmail').value.trim().toLowerCase(),
    role,
    status: toBackendAccountStatus(document.getElementById('userStatus').value),
    password_hash: 'password123',
  };

  let result;
  if (id) {
    result = await apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...payload,
        restaurant_id: role === 'staff' ? restaurantId : undefined,
        employee_code: role === 'staff' ? `EMP-${Date.now().toString().slice(-4)}` : undefined,
      }),
    });
  } else {
    result = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        restaurant_id: role === 'staff' ? restaurantId : undefined,
        employee_code: role === 'staff' ? `EMP-${Date.now().toString().slice(-4)}` : undefined,
        role_type: role === 'staff' ? 'service' : undefined,
      }),
    });
  }

  const savedUser = result?.data;
  if (role === 'manager' && restaurantId && savedUser?.id) {
    const restaurant = state.restaurants.find((item) => item.id === restaurantId);
    if (restaurant) {
      await apiRequest(`/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ manager_id: savedUser.id }),
      });
    }
  }

  await syncAdminState();
  closeUserModal();
  showToast(id ? 'User updated.' : 'User created.');
  addAuditLog(`${id ? 'Updated' : 'Created'} user ${payload.email}`);
}

async function createReservationFromForm(baseForm, desiredStatus) {
  const party = Number(baseForm.party);
  const restaurantId = baseForm.restaurantId;
  const dinerId = baseForm.dinerId;
  const slot = state.timeslots.find((item) =>
    item.restaurant_id === restaurantId
    && item.slot_date === baseForm.date
    && String(item.start_time).slice(0, 5) === baseForm.time);

  if (!slot) {
    throw new Error('No matching time slot exists for that restaurant/date/time');
  }

  const availableTableSlot = state.tableSlots.find((tableSlot) => {
    if (tableSlot.slot_id !== slot.id || tableSlot.status !== 'available') {
      return false;
    }

    const table = state.tables.find((item) => item.id === tableSlot.table_id);
    return table && table.restaurant_id === restaurantId && Number(table.capacity) >= party;
  });

  if (!availableTableSlot) {
    throw new Error('No available table matches that reservation');
  }

  const created = await apiRequest('/reservations', {
    method: 'POST',
    body: JSON.stringify({
      user_id: dinerId,
      restaurant_id: restaurantId,
      table_id: availableTableSlot.table_id,
      slot_id: slot.id,
      guest_count: party,
    }),
  });

  const reservation = created?.data;
  if (reservation?.id && desiredStatus && desiredStatus !== 'Booking') {
    await apiRequest(`/reservations/${reservation.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ reservation_status: toBackendReservationStatus(desiredStatus) }),
    });
  }

  return reservation;
}

async function saveReservation(event) {
  event.preventDefault();

  const existingId = document.getElementById('bkgId').value;
  const dinerName = document.getElementById('bkgDinerName').value.trim();
  const enteredDinerId = document.getElementById('bkgDinerId').value.trim();
  const restaurantId = document.getElementById('bkgRestaurant').value;
  const date = document.getElementById('bkgDate').value;
  const time = document.getElementById('bkgTime').value;
  const party = document.getElementById('bkgParty').value;
  const status = document.getElementById('bkgStatus').value;

  const diner = enteredDinerId
    ? state.users.find((user) => user.id === enteredDinerId)
    : state.users.find((user) => user.role === 'diner' && user.name.toLowerCase() === dinerName.toLowerCase());

  if (!diner) {
    throw new Error('Use an existing diner ID or exact diner name');
  }

  const formValues = {
    dinerId: diner.id,
    restaurantId,
    date,
    time,
    party,
  };

  if (!existingId) {
    await createReservationFromForm(formValues, status);
    await syncAdminState();
    closeReservationModal();
    showToast('Reservation created.');
    addAuditLog(`Created reservation for ${diner.name}`);
    return;
  }

  const existing = state.reservations.find((reservation) => reservation.id === existingId);
  const currentDisplay = getReservationDisplay(existing);
  const sameCoreDetails = currentDisplay.dinerId === diner.id
    && currentDisplay.restaurantId === restaurantId
    && currentDisplay.date === date
    && currentDisplay.time === time
    && Number(currentDisplay.party) === Number(party);

  if (sameCoreDetails) {
    await apiRequest(`/reservations/${existingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ reservation_status: toBackendReservationStatus(status) }),
    });
  } else {
    await createReservationFromForm(formValues, status);
    await apiRequest(`/reservations/${existingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ reservation_status: 'cancelled' }),
    });
  }

  await syncAdminState();
  closeReservationModal();
  showToast('Reservation updated.');
  addAuditLog(`Updated reservation ${existingId}`);
}

window.openRestaurantModal = function openRestaurantModal() {
  document.getElementById('superForm').reset();
  document.getElementById('resId').value = '';
  document.getElementById('superModalTitle').textContent = 'Add Restaurant';
  document.getElementById('superModal').style.display = 'flex';
};

window.closeRestaurantModal = function closeRestaurantModal() {
  document.getElementById('superModal').style.display = 'none';
};

window.editRestaurant = function editRestaurant(id) {
  const restaurant = state.restaurants.find((item) => item.id === id);
  if (!restaurant) return;
  const manager = state.users.find((item) => item.id === restaurant.manager_id);
  const location = locationForRestaurant(restaurant);
  const display = getRestaurantDisplay(restaurant);

  document.getElementById('resId').value = restaurant.id;
  document.getElementById('resName').value = restaurant.name || '';
  document.getElementById('resCuisine').value = restaurant.cuisine_type || '';
  document.getElementById('resTables').value = String(display.tables || restaurant.total_tables || 0);
  document.getElementById('resAddress').value = location?.address || '';
  document.getElementById('resCity').value = location?.city || '';
  document.getElementById('resPincode').value = location?.pincode || '';
  document.getElementById('resManagerName').value = manager?.name || '';
  document.getElementById('resManagerEmail').value = manager?.email || '';
  document.getElementById('resLicense').value = manager?.business_license_number || '';
  document.getElementById('resTimeSlots').value = display.timeSlots === 'Not configured' ? '' : display.timeSlots.split(',')[0].replace('-', ' - ');
  document.getElementById('resStatus').value = display.status;
  document.getElementById('superModalTitle').textContent = 'View / Edit Restaurant';
  document.getElementById('superModal').style.display = 'flex';
};

window.deleteRestaurant = function deleteRestaurant(id, name) {
  showConfirmModal(
    'Delete Restaurant',
    `Delete ${name}? This removes it from the shared platform data.`,
    async () => {
      await apiRequest(`/restaurants/${id}`, { method: 'DELETE' });
      await syncAdminState();
      showToast('Restaurant deleted.', 'error');
      addAuditLog(`Deleted restaurant ${name}`);
    },
  );
};

window.openUserModal = function openUserModal() {
  document.getElementById('userForm').reset();
  document.getElementById('userId').value = '';
  document.getElementById('userModalTitle').textContent = 'Add User';
  ensureRestaurantSelects();
  toggleRestaurantField();
  document.getElementById('userModal').style.display = 'flex';
};

window.closeUserModal = function closeUserModal() {
  document.getElementById('userModal').style.display = 'none';
};

window.toggleRestaurantField = function toggleRestaurantField() {
  const role = document.getElementById('userRole').value;
  const group = document.getElementById('userRestaurantGroup');
  ensureRestaurantSelects();
  group.style.display = role === 'Diner' ? 'none' : 'block';
};

window.editUser = function editUser(id) {
  const user = state.users.find((item) => item.id === id);
  if (!user) return;
  const display = getUserDisplay(user);
  ensureRestaurantSelects();
  document.getElementById('userId').value = user.id;
  document.getElementById('userName').value = user.name || '';
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userRole').value = display.role;
  toggleRestaurantField();
  document.getElementById('userNode').value = display.restaurant_id || '';
  document.getElementById('userStatus').value = display.status;
  document.getElementById('userModalTitle').textContent = 'View / Edit User';
  document.getElementById('userModal').style.display = 'flex';
};

window.deleteUser = function deleteUser(id, email) {
  showConfirmModal(
    'Delete Account',
    `Delete the account for ${email}? This action is permanent.`,
    async () => {
      await apiRequest(`/users/${id}`, { method: 'DELETE' });
      await syncAdminState();
      showToast('User deleted.', 'error');
      addAuditLog(`Deleted user ${email}`);
    },
  );
};

window.openReservationModal = function openReservationModal() {
  document.getElementById('reservationForm').reset();
  document.getElementById('bkgId').value = '';
  document.getElementById('reservationModalTitle').textContent = 'Add Reservation';
  ensureRestaurantSelects();
  document.getElementById('bkgDate').min = new Date().toISOString().split('T')[0];
  document.getElementById('reservationModal').style.display = 'flex';
};

window.closeReservationModal = function closeReservationModal() {
  document.getElementById('reservationModal').style.display = 'none';
};

window.editReservation = function editReservation(id) {
  const reservation = state.reservations.find((item) => item.id === id);
  if (!reservation) return;
  const display = getReservationDisplay(reservation);
  ensureRestaurantSelects();
  document.getElementById('bkgId').value = reservation.id;
  document.getElementById('bkgDinerName').value = display.dinerName;
  document.getElementById('bkgDinerId').value = display.dinerId;
  document.getElementById('bkgRestaurant').value = display.restaurantId;
  document.getElementById('bkgDate').value = display.date;
  document.getElementById('bkgTime').value = display.time;
  document.getElementById('bkgParty').value = String(display.party);
  document.getElementById('bkgStatus').value = display.status === 'Completed' ? 'Customer Check-In' : display.status;
  document.getElementById('reservationModalTitle').textContent = 'View / Edit Reservation';
  document.getElementById('reservationModal').style.display = 'flex';
};

window.deleteReservation = function deleteReservation(id, dinerName) {
  showConfirmModal(
    'Delete Reservation',
    `Permanently delete the reservation for ${dinerName}? This cannot be undone.`,
    async () => {
      await apiRequest(`/reservations/${id}`, {
        method: 'DELETE',
      });
      await syncAdminState();
      showToast('Reservation deleted.', 'error');
      addAuditLog(`Deleted reservation ${id}`);
    },
  );
};

window.changeSuperPassword = function changeSuperPassword(event) {
  event.preventDefault();
  const current = document.getElementById('currentMasterPass').value;
  const next = document.getElementById('newMasterPass').value;
  const confirm = document.getElementById('confirmNewMasterPass').value;
  const msg = document.getElementById('passChangeMsg');
  const profile = readJson('super_admin_profile', null);

  if (next.length < 6) {
    msg.textContent = 'New password must be at least 6 characters.';
    msg.style.color = '#C62828';
    msg.style.display = 'inline';
    return;
  }

  if (next !== confirm) {
    msg.textContent = 'Password confirmation does not match.';
    msg.style.color = '#C62828';
    msg.style.display = 'inline';
    return;
  }

  apiRequest('/super-admin/password', {
    method: 'PATCH',
    body: JSON.stringify({
      user_id: profile?.id || '',
      current_password: current,
      new_password: next,
    }),
  })
    .then(() => {
      msg.textContent = 'Security key updated.';
      msg.style.color = '#2E7D32';
      msg.style.display = 'inline';
      document.getElementById('changePasswordForm').reset();
      addAuditLog('Updated super user security key');
    })
    .catch((error) => {
      msg.textContent = error.message || 'Unable to update password.';
      msg.style.color = '#C62828';
      msg.style.display = 'inline';
    });
};

window.sendBroadcast = async function sendBroadcast(event) {
  event.preventDefault();
  const form = event.target;
  const audience = form.querySelector('select').value;
  const message = form.querySelector('textarea').value.trim();
  const roleMap = {
    diners: 'diner',
    managers: 'manager',
    staff: 'staff',
  };

  await apiRequest('/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify({
      role: roleMap[audience],
      message,
      type: 'broadcast',
    }),
  });

  await syncAdminState();
  form.reset();
  showToast('Broadcast message sent successfully.');
  addAuditLog(`Sent broadcast to ${audience}`);
};

window.logoutSuperAdmin = function logoutSuperAdmin() {
  sessionStorage.clear();
  window.location.href = 'login.html';
};

window.switchTab = function switchTab(tabName) {
  document.querySelectorAll('.dashboard-view').forEach((view) => {
    view.style.display = 'none';
  });
  document.querySelectorAll('.sidebar .nav-item').forEach((item) => {
    item.classList.remove('active');
  });

  const view = document.getElementById(`view-${tabName}`);
  if (view) {
    view.style.display = 'block';
  }

  const nav = document.getElementById(`nav-${tabName}`);
  if (nav) {
    nav.classList.add('active');
  }

  writeJson(STORAGE_KEYS.activeTab, tabName);
};

function setupForms() {
  document.getElementById('superForm')?.addEventListener('submit', (event) => {
    saveRestaurant(event).catch((error) => showToast(error.message, 'error'));
  });
  document.getElementById('userForm')?.addEventListener('submit', (event) => {
    saveUser(event).catch((error) => showToast(error.message, 'error'));
  });
  document.getElementById('reservationForm')?.addEventListener('submit', (event) => {
    saveReservation(event).catch((error) => showToast(error.message, 'error'));
  });
}

window.onload = async function onLoad() {
  setupForms();
  getAuditLog();
  renderAuditLogs();
  ensureRestaurantSelects();

  const resSearchDate = document.getElementById('resSearchDate');
  if (resSearchDate) {
    resSearchDate.value = new Date().toLocaleDateString('en-CA');
  }

  try {
    await syncAdminState();
  } catch (error) {
    showToast(error.message || 'Unable to sync admin dashboard.', 'error');
  }

  const savedTab = readJson(STORAGE_KEYS.activeTab, 'dashboard');
  switchTab(savedTab);
  startAutoRefresh();
};
