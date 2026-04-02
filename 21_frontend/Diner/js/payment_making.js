// payment_making.js

var mockReservation = {
  restaurantId: 1,
  date: "Friday, 22 March",
  time: "7:00 PM",
  guests: 4,
  tableType: "Indoor Table",
  specialRequest: "Window seat if available",
  deposit: 200,
  serviceFee: 20,
  taxes: 36,
  discountPct: 10
};

// Data from DinetimeStore

function getUrlParam(key) {
  var params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function getRestaurant(id) {
  var allRes = DinetimeStore.getRestaurants();
  return allRes.find(function(r) { return r.id === id; }) || allRes[0];
}

function loadReservationState() {
  var id = parseInt(getUrlParam('id')) || 1;
  var date = getUrlParam('date');
  var time = getUrlParam('time');
  var guests = parseInt(getUrlParam('guests')) || 4;
  var tableType = getUrlParam('table') || "Indoor Table";
  var special = getUrlParam('special') || "Window seat if available";

  if (date) {
    var dateObj = new Date(date + 'T12:00:00');
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    mockReservation.date = days[dateObj.getDay()] + ', ' + dateObj.getDate() + ' ' + months[dateObj.getMonth()];
  }
  if (time) mockReservation.time = time;
  if (guests) mockReservation.guests = guests;
  if (tableType) mockReservation.tableType = tableType;
  
  var tableName = getUrlParam('tableName');
  if (tableName) mockReservation.tableName = tableName;
  if (special) mockReservation.specialRequest = special;

  mockReservation.restaurantId = id;
}

function calcCost() {
  var deposit = mockReservation.deposit;
  var service = mockReservation.serviceFee;
  var taxes = mockReservation.taxes;
  var discountAmt = Math.round((deposit + service) * (mockReservation.discountPct / 100));
  var total = deposit + service + taxes - discountAmt;
  return { deposit: deposit, service: service, taxes: taxes, discountAmt: discountAmt, total: total };
}

function renderRestaurant(restaurant) {
  var row = document.getElementById('restaurantRow');
  if(!row) return;

  row.innerHTML =
    '<img src="' + restaurant.image + '" alt="' + restaurant.name + '" class="rest-img" onerror="this.src=\'../images/logo.png\'"/>' +
    '<div class="rest-info">' +
      '<span class="rest-name">' + restaurant.name + '</span>' +
      '<span class="rest-cuisine">' + restaurant.cuisine + '</span>' +
      '<div class="rest-meta">' +
        '<span class="rest-rating"><i class="fa-solid fa-star star-icon"></i> ' + restaurant.rating + '</span>' +
        '<span class="rest-distance"><i class="fa-solid fa-location-dot"></i> ' + restaurant.distance + '</span>' +
      '</div>' +
    '</div>';
}

function renderInfoGrid() {
  var grid = document.getElementById('infoGrid');
  if(!grid) return;

  var r = mockReservation;
  grid.innerHTML =
    infoTile('fa-regular fa-calendar', 'Date', r.date) +
    infoTile('fa-regular fa-clock', 'Time', r.time) +
    infoTile('fa-solid fa-people-group', 'Guests', r.guests + ' People') +
    infoTile('fa-solid fa-chair', 'Table', (r.tableName ? r.tableName + ' (' + r.tableType + ')' : r.tableType));
}

function infoTile(iconClass, label, value) {
  return '<div class="info-tile">' +
    '<i class="' + iconClass + ' info-tile-icon"></i>' +
    '<div class="info-tile-content">' +
      '<span class="info-tile-label">' + label + '</span>' +
      '<span class="info-tile-value">' + value + '</span>' +
    '</div>' +
  '</div>';
}

function renderSpecialRequests() {
  var box = document.getElementById('specialRequestsBox');
  if(!box) return;

  var req = mockReservation.specialRequest;
  if (!req || req.trim() === '') {
    box.style.display = 'none';
    return;
  }
  box.innerHTML =
    '<div class="special-req-label">Special Requests</div>' +
    '<div class="special-req-text">"' + req + '"</div>';
}

function renderCost() {
  var cost = calcCost();

  var lines = document.getElementById('costLines');
  if(lines) {
      lines.innerHTML =
        costLine('Reservation Deposit', '\u20B9' + cost.deposit) +
        costLine('Platform Service Fee', '\u20B9' + cost.service) +
        costLine('Taxes', '\u20B9' + cost.taxes) +
        costLineDiscount('Discount (' + mockReservation.discountPct + '%)', '-\u20B9' + cost.discountAmt);
  }

  var totalRow = document.getElementById('costTotalRow');
  if(totalRow) {
      totalRow.innerHTML =
        '<span class="cost-total-label">Total Amount</span>' +
        '<span class="cost-total-value">\u20B9' + cost.total + '</span>';
  }
}

function costLine(label, value) {
  return '<div class="cost-line">' +
    '<span class="cost-line-label">' + label + '</span>' +
    '<span class="cost-line-value">' + value + '</span>' +
  '</div>';
}

function costLineDiscount(label, value) {
  return '<div class="cost-line">' +
    '<span class="cost-line-label">' + label + '</span>' +
    '<span class="cost-line-value discount">' + value + '</span>' +
  '</div>';
}

function buildModifyLink(restaurantId) {
  var link = document.getElementById('modifyLink');
  if(link) link.href = 'book.html?id=' + restaurantId;
}

function init() {
  loadReservationState();

  var restaurant = getRestaurant(mockReservation.restaurantId);

  document.title = 'DineTime - Review Payment';

  renderRestaurant(restaurant);
  renderInfoGrid();
  renderSpecialRequests();
  renderCost();
  buildModifyLink(mockReservation.restaurantId);

  const btnProceed = document.getElementById('btnProceed');
  if(btnProceed) {
      btnProceed.addEventListener('click', function() {
        var cost = calcCost();
        var existingParams = new URLSearchParams(window.location.search);
        existingParams.set('total', cost.total);
        window.location.href = 'payment_method.html?' + existingParams.toString();
      });
  }
}

document.addEventListener('DOMContentLoaded', init);
