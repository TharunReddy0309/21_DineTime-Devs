// restaurant.js

// Data fetched from DinetimeStore

let currentSlide = 0;
let totalSlides = 0;

function getRestaurantById(id) {
  const allRestaurants = DinetimeStore.getRestaurants();
  return allRestaurants.find(r => r.id === id) || allRestaurants[0];
}

function getUrlId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id')) || 1;
}

function renderCarousel(images) {
  const track = document.querySelector('#carouselTrack');
  totalSlides = images.length;
  track.innerHTML = images.map(src =>
    `<div class="carousel-slide"><img src="${src}" alt="Restaurant" /></div>`
  ).join('');
  updateCarouselCounter();
}

function updateCarouselCounter() {
  document.querySelector('#carouselCounter').textContent = `${currentSlide + 1} / ${totalSlides}`;
  document.querySelector('#carouselTrack').style.transform = `translateX(-${currentSlide * 100}%)`;
}

function renderInfo(restaurant) {
  document.querySelector('#restaurantName').textContent = restaurant.name;
  document.querySelector('#restaurantSubtitle').textContent = restaurant.subtitle;
  document.querySelector('#restaurantRating').textContent = restaurant.rating;
  document.querySelector('#restaurantReviews').textContent = `(${restaurant.reviewCount} reviews)`;
  document.querySelector('#restaurantLocation').textContent = restaurant.location;
  document.querySelector('#restaurantPrice').textContent = restaurant.price;

  const amenitiesEl = document.querySelector('#amenitiesList');
  amenitiesEl.innerHTML = restaurant.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('');
}

function renderAbout(restaurant) {
  document.querySelector('#aboutText').textContent = restaurant.description;

  const items = [
    { icon: 'fa-solid fa-phone', label: 'Phone Number', value: restaurant.phone },
    { icon: 'fa-solid fa-clock', label: 'Opening Hours', value: restaurant.openingHours },
    { icon: 'fa-solid fa-square-parking', label: 'Parking', value: restaurant.parking },
    { icon: 'fa-solid fa-shirt', label: 'Dress Code', value: restaurant.dressCode }
  ];

  document.querySelector('#aboutGrid').innerHTML = items.map(item => `
    <div class="about-item">
      <i class="${item.icon} about-item-icon"></i>
      <div class="about-item-text">
        <strong>${item.label}</strong>
        <span>${item.value}</span>
      </div>
    </div>
  `).join('');
}

function renderHours(operationalHours) {
  document.querySelector('#hoursList').innerHTML = operationalHours.map(row => `
    <div class="hours-row">
      <span class="hours-label">
        ${row.days}
        ${row.isOpen ? '<span class="open-badge">Open</span>' : ''}
      </span>
      <span class="hours-time">${row.hours}</span>
    </div>
  `).join('');
}

function renderMenu(menuImages) {
  document.querySelector('#menuGrid').innerHTML = menuImages.map(src => `
    <div class="menu-img-wrapper">
      <img src="${src}" alt="Menu" loading="lazy" />
    </div>
  `).join('');
}

function renderReviews(reviews) {
  document.querySelector('#reviewsGrid').innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="reviewer-row">
        <img src="${r.avatar}" alt="${r.name}" class="reviewer-avatar" />
        <div>
          <div class="reviewer-name">${r.name}</div>
          <div class="review-stars">${'<i class="fa-solid fa-star"></i>'.repeat(r.stars)}</div>
        </div>
      </div>
      <p class="review-text">${r.text}</p>
    </div>
  `).join('');
}

function initCarouselControls() {
  document.querySelector('#prevBtn').addEventListener('click', () => {
    currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    updateCarouselCounter();
  });

  document.querySelector('#nextBtn').addEventListener('click', () => {
    currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    updateCarouselCounter();
  });
}

function init() {
  const id = getUrlId();
  const restaurant = getRestaurantById(id);

  document.title = `${restaurant.name} – DineTime`;

  renderCarousel(restaurant.images);
  renderInfo(restaurant);
  renderAbout(restaurant);
  renderHours(restaurant.operationalHours);
  renderMenu(restaurant.menuImages);
  renderReviews(restaurant.reviews);
  initCarouselControls();

  document.querySelector('#reserveBtn').addEventListener('click', () => {
    window.location.href = `book.html?id=${id}`;
  });

  document.querySelector('#viewMenuBtn').addEventListener('click', () => {
    window.location.href = `menu.html?id=${id}`;
  });

  const searchInput = document.querySelector('#globalSearchInput');
  if (searchInput) {
    searchInput.addEventListener('click', () => {
      window.location.href = `search.html`;
    });
    searchInput.addEventListener('focus', () => {
      window.location.href = `search.html`;
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
