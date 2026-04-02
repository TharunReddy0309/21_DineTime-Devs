// confirmation.js

// Data fetched from DinetimeStore

var methodLabels = {
  card: 'Credit / Debit Card',
  upi: 'UPI',
  netbanking: 'Net Banking',
  wallet: 'Wallet'
};

var methodIcons = {
  card: 'fa-regular fa-credit-card',
  upi: 'fa-solid fa-mobile-screen',
  netbanking: 'fa-solid fa-building-columns',
  wallet: 'fa-solid fa-wallet'
};

function getUrlParam(key) {
  var params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function getRestaurant(id) {
  var allRes = DinetimeStore.getRestaurants();
  return allRes.find(function(r) { return r.id === id; }) || allRes[0];
}

function generateReservationId() {
  var num = Math.floor(10000 + Math.random() * 89999);
  return 'DT-' + num;
}

function formatDate(raw) {
  if (!raw) return 'Friday, 22 March 2026';
  var d = new Date(raw + 'T12:00:00');
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
  return days[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function renderRestaurant(restaurant) {
  var row = document.getElementById('restaurantRow');
  if(!row) return;

  row.innerHTML =
    '<img src="' + restaurant.image + '" alt="' + restaurant.name + '" class="rest-img" onerror="this.src=\'../images/logo.png\'"/>' +
    '<div class="rest-info">' +
      '<span class="rest-name">' + restaurant.name + '</span>' +
      '<span class="rest-cuisine">' + restaurant.cuisine + '</span>' +
      '<div class="rest-meta-row">' +
        '<span class="rest-rating"><i class="fa-solid fa-star star-icon"></i> ' + restaurant.rating + '</span>' +
        '<span class="rest-location"><i class="fa-solid fa-location-dot"></i> ' + restaurant.location + '</span>' +
      '</div>' +
    '</div>';
}

function renderBookingGrid(reservationId, date, time, guests, tableType) {
  var grid = document.getElementById('bookingGrid');
  if(!grid) return;

  grid.innerHTML =
    bookingItem('fa-solid fa-hashtag', 'Reservation ID', reservationId, false) +
    bookingItem('fa-solid fa-people-group', 'Guests', guests + ' People', false) +
    bookingItem('fa-regular fa-calendar', 'Date', date, false) +
    bookingItem('fa-solid fa-chair', 'Table Type', tableType, false) +
    bookingItem('fa-regular fa-clock', 'Time', time, false);
}

function bookingItem(iconClass, label, value, fullWidth) {
  return '<div class="booking-item' + (fullWidth ? ' full-width' : '') + '">' +
    '<div class="booking-item-header">' +
      '<i class="' + iconClass + '"></i>' +
      '<span class="booking-label">' + label + '</span>' +
    '</div>' +
    '<span class="booking-value">' + value + '</span>' +
  '</div>';
}

function renderPaymentBox(total, method) {
  var iconClass = methodIcons[method] || 'fa-regular fa-credit-card';
  var methodLabel = methodLabels[method] || 'Card';

  var box = document.getElementById('paymentConfirmBox');
  if(!box) return;

  box.innerHTML =
    '<div class="payment-status-row">' +
      '<div class="payment-col">' +
        '<span class="payment-col-label">Payment Status</span>' +
        '<span class="payment-col-value paid"><i class="fa-solid fa-check"></i> Paid</span>' +
      '</div>' +
      '<div class="payment-col">' +
        '<span class="payment-col-label">Amount Paid</span>' +
        '<span class="payment-col-value">\u20B9' + total + '</span>' +
      '</div>' +
      '<div class="payment-col">' +
        '<span class="payment-col-label">Payment Method</span>' +
        '<span class="payment-col-value method"><i class="' + iconClass + '"></i>' + methodLabel + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="payment-divider"></div>' +
    '<div class="secure-line">' +
      '<i class="fa-solid fa-lock"></i>' +
      '<span>Secure payment processed</span>' +
    '</div>';
}

function init() {
  var restaurantId = parseInt(getUrlParam('id')) || 1;
  var rawDate     = getUrlParam('date');
  var time        = getUrlParam('time')   || '7:00 PM';
  var guests      = getUrlParam('guests') || '4';
  var tableType   = getUrlParam('table')  || 'Indoor';
  var tableName   = getUrlParam('tableName');
  var total       = getUrlParam('total')  || '236';
  var method      = getUrlParam('method') || 'upi';

  var restaurant   = getRestaurant(restaurantId);
  var reservationId = generateReservationId();
  var formattedDate = formatDate(rawDate);
  var tableNo = tableName || (tableType === 'Window Table' ? 'Table NO-2' : (tableType === 'Large Table' ? 'Table NO-8' : 'Table NO-5'));
  var displayTable = tableName ? tableName + ' (' + tableType + ')' : tableType;

  // Add the reservation to our unified DinetimeStore!
  DinetimeStore.addReservation({
      id: reservationId,
      restaurant: restaurant.name,
      cuisine: restaurant.cuisine,
      image: restaurant.image,
      status: 'Confirmed',
      date: formattedDate,
      time: time,
      guests: guests,
      tableType: tableType,
      tableNo: tableNo,
      location: restaurant.location
  });

  // Sync to Restaurant Staff pipeline via dinetime_bookings_v5
  var user = (typeof DinetimeStore !== 'undefined' && DinetimeStore.getUser()) || { name: 'Guest User', phone: 'Unknown', email: 'guest@example.com' };
  var staffDateStr = rawDate || new Date().toISOString().split('T')[0];
  var staffBookingsStr = localStorage.getItem('dinetime_bookings_v5');
  var staffBookings = staffBookingsStr ? JSON.parse(staffBookingsStr) : [];
  
  staffBookings.unshift({
      id: reservationId,
      name: user.name || 'Guest User',
      phone: user.phone || 'Unknown',
      date: staffDateStr,
      time: time,
      guests: parseInt(guests) || 2,
      email: user.email || 'guest@example.com',
      table: tableNo,
      status: 'Upcoming',
      restaurant: restaurant.name
  });
  localStorage.setItem('dinetime_bookings_v5', JSON.stringify(staffBookings));

  // Sync to Restaurant Manager pipeline via dinetimeData_v2
  try {
      var managerDataStr = localStorage.getItem('dinetimeData_v2');
      if (managerDataStr) {
          var managerData = JSON.parse(managerDataStr);
          if (managerData && managerData.users) {
              for (var key in managerData.users) {
                  var managerUser = managerData.users[key];
                  if (managerUser && managerUser.restaurant && managerUser.restaurant.name === restaurant.name) {
                      if (!managerUser.reservations) managerUser.reservations = [];
                      managerUser.reservations.unshift({
                          id: reservationId,
                          name: user.name || 'Guest User',
                          email: user.email || 'guest@example.com',
                          phone: user.phone || 'Unknown',
                          date: staffDateStr,
                          time: time,
                          guests: guests,
                          table: tableNo,
                          status: 'Confirmed',
                          request: 'Online Booking'
                      });
                  }
              }
              localStorage.setItem('dinetimeData_v2', JSON.stringify(managerData));
          }
      }
  } catch(e) {}

  document.title = 'DineTime - Reservation Confirmed';

  renderRestaurant(restaurant);
  renderBookingGrid(reservationId, formattedDate, time, guests, displayTable);
  renderPaymentBox(total, method);

  var btnExplore = document.getElementById('btnExplore');
  if(btnExplore) {
      btnExplore.addEventListener('click', function() {
        window.location.href = 'browse.html';
      });
  }

  var btnReservations = document.getElementById('btnReservations');
  if(btnReservations) {
      btnReservations.addEventListener('click', function() {
        window.location.href = 'reservations.html';
      });
  }
}

document.addEventListener('DOMContentLoaded', init);
