// payment_method.js

var paymentMethods = [
  {
    id: 'card',
    name: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, RuPay',
    icon: 'fa-regular fa-credit-card',
    badges: [
      { label: 'VISA', cls: 'badge-visa' },
      { label: 'MC', cls: 'badge-mc' }
    ]
  },
  {
    id: 'upi',
    name: 'UPI',
    sub: 'Google Pay, PhonePe, Paytm',
    icon: 'fa-solid fa-mobile-screen',
    badges: []
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    sub: 'All major banks supported',
    icon: 'fa-solid fa-building-columns',
    badges: []
  },
  {
    id: 'wallet',
    name: 'Wallets',
    sub: 'Paytm, Amazon Pay, PhonePe',
    icon: 'fa-solid fa-wallet',
    badges: []
  }
];

var banksList = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'Yes Bank'
];

var upiApps = [
  { label: 'GPay', icon: 'fa-brands fa-google-pay' },
  { label: 'PhonePe', icon: 'fa-solid fa-p' },
  { label: 'Paytm', icon: 'fa-solid fa-wallet' }
];

var walletOptions = [
  { id: 'paytm', label: 'Paytm', icon: 'fa-solid fa-wallet' },
  { id: 'amazon', label: 'Amazon Pay', icon: 'fa-brands fa-amazon' },
  { id: 'phonepe', label: 'PhonePe', icon: 'fa-solid fa-p' }
];

var activeMethod = null;
var selectedWallet = null;
var selectedUpiApp = null;

function getUrlParam(key) {
  var params = new URLSearchParams(window.location.search);
  return params.get(key);
}

function getTotal() {
  var t = parseInt(getUrlParam('total'));
  return isNaN(t) ? 236 : t;
}

function buildCardForm() {
  return '<div class="method-divider"></div>' +
    '<div class="field-group">' +
      '<label>Card Number</label>' +
      '<input type="text" class="field-input" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" />' +
    '</div>' +
    '<div class="field-group">' +
      '<label>Cardholder Name</label>' +
      '<input type="text" class="field-input" id="cardName" placeholder="Name as on card" />' +
    '</div>' +
    '<div class="field-row">' +
      '<div class="field-group">' +
        '<label>Expiry Date</label>' +
        '<input type="text" class="field-input" id="cardExpiry" placeholder="MM / YY" maxlength="7" />' +
      '</div>' +
      '<div class="field-group">' +
        '<label>CVV</label>' +
        '<input type="text" class="field-input" id="cardCvv" placeholder="•••" maxlength="3" />' +
      '</div>' +
    '</div>';
}

function buildUpiForm() {
  var appBtns = upiApps.map(function(app) {
    return '<button class="upi-app-btn" data-app="' + app.label + '">' +
      '<i class="' + app.icon + '"></i>' + app.label +
    '</button>';
  }).join('');

  return '<div class="method-divider"></div>' +
    '<div class="upi-apps" id="upiApps">' + appBtns + '</div>' +
    '<div class="field-group">' +
      '<label>Or enter UPI ID</label>' +
      '<input type="text" class="field-input" id="upiId" placeholder="yourname@upi" />' +
    '</div>';
}

function buildNetBankingForm() {
  var options = banksList.map(function(bank) {
    return '<option value="' + bank + '">' + bank + '</option>';
  }).join('');

  return '<div class="method-divider"></div>' +
    '<div class="field-group">' +
      '<label>Select Bank</label>' +
      '<select class="field-select" id="bankSelect">' +
        '<option value="" disabled selected>Choose your bank</option>' +
        options +
      '</select>' +
    '</div>' +
    '<div class="field-group">' +
      '<label>Customer ID / Username</label>' +
      '<input type="text" class="field-input" id="netbankUser" placeholder="Enter your net banking ID" />' +
    '</div>';
}

function buildWalletForm() {
  var opts = walletOptions.map(function(w) {
    return '<div class="wallet-option" data-wallet="' + w.id + '">' +
      '<i class="' + w.icon + '"></i>' +
      '<span>' + w.label + '</span>' +
      '<div class="radio-dot"></div>' +
    '</div>';
  }).join('');

  return '<div class="method-divider"></div>' +
    '<div class="wallet-options" id="walletOptions">' + opts + '</div>';
}

function getFormForMethod(id) {
  if (id === 'card') return buildCardForm();
  if (id === 'upi') return buildUpiForm();
  if (id === 'netbanking') return buildNetBankingForm();
  if (id === 'wallet') return buildWalletForm();
  return '';
}

function renderMethods() {
  var list = document.getElementById('methodsList');
  if(!list) return;

  list.innerHTML = paymentMethods.map(function(m) {
    var badgeHtml = m.badges.map(function(b) {
      return '<span class="badge ' + b.cls + '">' + b.label + '</span>';
    }).join('');

    var rightSide = badgeHtml
      ? '<div class="method-badges">' + badgeHtml + '</div>'
      : '';
    rightSide += '<i class="fa-solid fa-chevron-down method-arrow"></i>';

    return '<div class="method-row" data-id="' + m.id + '">' +
      '<div class="method-header">' +
        '<div class="method-icon"><i class="' + m.icon + '"></i></div>' +
        '<div class="method-label">' +
          '<span class="method-name">' + m.name + '</span>' +
          '<span class="method-sub">' + m.sub + '</span>' +
        '</div>' +
        rightSide +
      '</div>' +
      '<div class="method-body" id="body-' + m.id + '">' +
        getFormForMethod(m.id) +
      '</div>' +
    '</div>';
  }).join('');

  list.querySelectorAll('.method-row').forEach(function(row) {
    row.querySelector('.method-header').addEventListener('click', function() {
      toggleMethod(row.dataset.id);
    });
  });
}

function toggleMethod(id) {
  if (activeMethod === id) {
    collapseAll();
    activeMethod = null;
    return;
  }

  collapseAll();
  activeMethod = id;

  var row = document.querySelector('.method-row[data-id="' + id + '"]');
  if(row) row.classList.add('active');

  attachSubListeners(id);
}

function collapseAll() {
  document.querySelectorAll('.method-row').forEach(function(r) {
    r.classList.remove('active');
  });
  selectedWallet = null;
  selectedUpiApp = null;
}

function attachSubListeners(id) {
  if (id === 'upi') {
    document.querySelectorAll('#upiApps .upi-app-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('#upiApps .upi-app-btn').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        selectedUpiApp = btn.dataset.app;
        var upiInput = document.getElementById('upiId');
        if(upiInput) upiInput.value = '';
      });
    });

    var upiInput = document.getElementById('upiId');
    if (upiInput) {
      upiInput.addEventListener('input', function() {
        document.querySelectorAll('#upiApps .upi-app-btn').forEach(function(b) { b.classList.remove('selected'); });
        selectedUpiApp = null;
      });
    }
  }

  if (id === 'wallet') {
    document.querySelectorAll('#walletOptions .wallet-option').forEach(function(opt) {
      opt.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('#walletOptions .wallet-option').forEach(function(o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        selectedWallet = opt.dataset.wallet;
      });
    });
  }

  if (id === 'card') {
    var cardNum = document.getElementById('cardNumber');
    if (cardNum) {
      cardNum.addEventListener('input', function() {
        var v = cardNum.value.replace(/\D/g, '').substring(0, 16);
        cardNum.value = v.replace(/(.{4})/g, '$1 ').trim();
      });
    }

    var expiry = document.getElementById('cardExpiry');
    if (expiry) {
      expiry.addEventListener('input', function() {
        var v = expiry.value.replace(/\D/g, '').substring(0, 4);
        if (v.length > 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
        expiry.value = v;
      });
    }
  }
}

function validate() {
  if (!activeMethod) {
    showToast('Please select a payment method.', 'error');
    return false;
  }

  if (activeMethod === 'card') {
    var cardNum = document.getElementById('cardNumber');
    var cardName = document.getElementById('cardName');
    var cardExp = document.getElementById('cardExpiry');
    var cardCvv = document.getElementById('cardCvv');
    
    var num = cardNum ? cardNum.value.replace(/\s/g, '') : '';
    var name = cardName ? cardName.value.trim() : '';
    var exp = cardExp ? cardExp.value.trim() : '';
    var cvv = cardCvv ? cardCvv.value.trim() : '';
    
    if (num.length < 16 || !name || exp.length < 4 || cvv.length < 3) {
      showToast('Please fill in all card details.', 'error');
      return false;
    }
  }

  if (activeMethod === 'upi') {
    var upiEl = document.getElementById('upiId');
    var upiId = upiEl ? upiEl.value.trim() : '';
    
    if (!selectedUpiApp && !upiId) {
      showToast('Please enter a UPI ID or select an app.', 'error');
      return false;
    }
    if (upiId && !upiId.includes('@')) {
      showToast('Enter a valid UPI ID (e.g. name@upi).', 'error');
      return false;
    }
  }

  if (activeMethod === 'netbanking') {
    var bankEl = document.getElementById('bankSelect');
    var bank = bankEl ? bankEl.value : '';
    var userEl = document.getElementById('netbankUser');
    var user = userEl ? userEl.value.trim() : '';
    
    if (!bank || !user) {
      showToast('Please select a bank and enter your ID.', 'error');
      return false;
    }
  }

  if (activeMethod === 'wallet') {
    if (!selectedWallet) {
      showToast('Please select a wallet to continue.', 'error');
      return false;
    }
  }

  return true;
}

function showToast(message, type) {
  var toast = document.getElementById('toast');
  var msg = document.getElementById('toastMsg');
  var icon = document.getElementById('toastIcon');

  if(toast && msg && icon) {
      toast.className = 'toast show ' + type;
      msg.textContent = message;
      icon.className = type === 'success'
        ? 'fa-solid fa-circle-check toast-icon'
        : 'fa-solid fa-circle-exclamation toast-icon';

      setTimeout(function() {
        toast.className = 'toast hidden';
      }, 3000);
  }
}

function init() {
  var total = getTotal();

  var payAmountEl = document.getElementById('payAmount');
  if(payAmountEl) payAmountEl.textContent = '\u20B9' + total;
  
  document.title = 'DineTime - Select Payment';

  renderMethods();

  var backLink = document.getElementById('backLink');
  if(backLink) {
      var params = window.location.search;
      backLink.href = 'payment_making.html' + params;
  }

  var btnPay = document.getElementById('btnPay');
  if(btnPay) {
      btnPay.addEventListener('click', function() {
        if (!validate()) return;

        var existing = new URLSearchParams(window.location.search);
        existing.set('method', activeMethod || 'card');
        window.location.href = 'confirmation.html?' + existing.toString();
      });
  }

  document.body.insertAdjacentHTML('beforeend',
    '<div class="toast hidden" id="toast">' +
      '<i class="fa-solid fa-circle-exclamation toast-icon" id="toastIcon"></i>' +
      '<span id="toastMsg"></span>' +
    '</div>'
  );

  toggleMethod('card');
}

document.addEventListener('DOMContentLoaded', init);
