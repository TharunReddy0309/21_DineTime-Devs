// store.js
const DinetimeStore = {
  // Key names
  USER_KEY: 'dinetime_v3_user',
  SETTINGS_KEY: 'dinetime_v3_settings',
  RESERVATIONS_KEY: 'dinetime_v3_reservations',
  CATEGORIES_KEY: 'dinetime_v3_categories',
  RESTAURANTS_KEY: 'dinetime_v3_restaurants',
  MENU_KEY: 'dinetime_v3_menu',
  TABLES_KEY: 'dinetime_v3_tables',
  QR_KEY: 'dinetime_v3_qr',
  SEEDED_KEY: 'dinetime_v3_seeded',

  // Initialize store if empty
  init() {
    // 1. Ensure a user exists (Default to John Doe if first visit)
    if (!localStorage.getItem(this.USER_KEY)) {
      this.setUser({
        name: "John Doe",
        email: "johndoe@gmail.com",
        password: "password123",
        phone: "9876543210",
        location: "HSR Layout, Bangalore",
        city: "Bangalore",
        pincode: "560102",
        country: "India",
        avatar: "../images/icon-profile.png",
        joinDate: "January 2026",
        address: "#123, 27th Main Road, HSR Layout",
        reviews: 24,
        photos: 12
      });
    }

    // 2. Identify the current user
    const user = this.getUser();
    const isJohnDoe = user && user.email === "johndoe@gmail.com";

    // 3. Populate Settings if missing
    if (!localStorage.getItem(this.SETTINGS_KEY)) {
      this.setSettings({ 
        notifications: true, 
        smsAlerts: false, 
        promotions: true, 
        language: "English", 
        currency: "INR (₹)", 
        dietary: "None" 
      });
    }

    // 4. Handle Reservations (Crucial: Empty for new users, Dummy for John Doe)
    if (!localStorage.getItem(this.RESERVATIONS_KEY)) {
      if (isJohnDoe) {
        this.setReservations([
          {
            id: "RES-1049",
            restaurant: "Spice Garden",
            image: "../images/indian.jpg",
            date: "15 April 2026",
            time: "8:00 PM",
            guests: 4,
            status: "Confirmed",
            tableType: "Indoor Seating",
            location: "MG Road, Bangalore"
          },
          {
            id: "RES-2841",
            restaurant: "Green Bowl",
            image: "../images/healthy.jpg",
            date: "20 April 2026",
            time: "1:00 PM",
            guests: 2,
            status: "Confirmed",
            tableType: "Outdoor Seating",
            location: "Jayanagar, Bangalore"
          },
          {
            id: "RES-8291",
            restaurant: "Sushi Master",
            image: "../images/japanese.jpg",
            date: "10 March 2026",
            time: "7:30 PM",
            guests: 2,
            status: "Completed",
            tableType: "Sushi Bar",
            location: "Indiranagar, Bangalore",
            hasRated: true,
            rating: 5,
            reviewText: "Amazing omakase experience! The chef was extremely attentive."
          },
          {
            id: "RES-4452",
            restaurant: "Burger Joint",
            image: "../images/american.jpg",
            date: "02 March 2026",
            time: "8:00 PM",
            guests: 3,
            status: "Completed",
            tableType: "Booth",
            location: "Koramangala, Bangalore",
            hasRated: false,
            rating: 0,
            reviewText: ""
          },
          {
            id: "RES-9122",
            restaurant: "Le Gourmet",
            image: "../images/italian.jpg",
            date: "14 February 2026",
            time: "8:30 PM",
            guests: 2,
            status: "Completed",
            tableType: "Window Seat",
            location: "UB City, Bangalore",
            hasRated: true,
            rating: 4,
            reviewText: "Fantastic atmosphere for Valentine's Day. The pasta was al dente."
          },
          {
            id: "RES-3310",
            restaurant: "Taco Fiesta",
            image: "../images/mexican.jpg",
            date: "05 January 2026",
            time: "9:00 PM",
            guests: 6,
            status: "Cancelled",
            tableType: "Bar Table",
            location: "HSR Layout, Bangalore"
          }
        ]);
      } else {
        // Real registered users start with an empty list
        this.setReservations([]);
      }
    }

    // 5. Global Metadata (Always populated to make the app functional)
    if (!localStorage.getItem(this.CATEGORIES_KEY)) {
      this.setCategories([
        { name: "Italian", image: "../images/italian.jpg" },
        { name: "Chinese", image: "../images/chinese.jpg" },
        { name: "Indian", image: "../images/indian.jpg" },
        { name: "Japanese", image: "../images/japanese.jpg" },
        { name: "American", image: "../images/american.jpg" },
        { name: "Mexican", image: "../images/mexican.jpg" },
        { name: "Healthy", image: "../images/healthy.jpg" },
        { name: "Thai", image: "../images/thai.jpg" }
      ]);
    }
    if (!localStorage.getItem(this.MENU_KEY)) {
      this.setMenu([
        { id: 1, name: "Spicy Edamame", cat: "Starter", price: 6.99, image: "../images/edamame.png" },
        { id: 2, name: "Garlic Bread", cat: "Starter", price: 5.50, image: "../images/italian.jpg" },
        { id: 3, name: "Spring Rolls", cat: "Starter", price: 7.00, image: "../images/starter.png" },
        { id: 4, name: "Grilled Salmon", cat: "Main Course", price: 24.99, image: "../images/healthy.jpg" },
        { id: 5, name: "Ribeye Steak", cat: "Main Course", price: 32.50, image: "../images/main.png", isChefSpecial: true },
        { id: 6, name: "Butter Chicken", cat: "Main Course", price: 18.00, image: "../images/indian.jpg" },
        { id: 7, name: "Pad Thai", cat: "Main Course", price: 16.50, image: "../images/thai.jpg", isChefSpecial: true },
        { id: 8, name: "Tacos Al Pastor", cat: "Main Course", price: 14.00, image: "../images/mexican.jpg" },
        { id: 9, name: "Cheesecake", cat: "Deserts", price: 8.50, image: "../images/dessert.png" },
        { id: 10, name: "Mango Mochi", cat: "Deserts", price: 6.00, image: "../images/japanese.jpg" },
        { id: 11, name: "Lemonade", cat: "Drinks", price: 4.00, image: "../images/drink.png" },
        { id: 12, name: "Craft Beer", cat: "Drinks", price: 7.50, image: "../images/craft-beer.png" }
      ]);
    }
    if (!localStorage.getItem(this.TABLES_KEY)) {
      this.setTables([
        { id: 1, name: "Table 1", seats: 2, status: "unavailable" },
        { id: 2, name: "Table 2", seats: 2, status: "reserved" },
        { id: 3, name: "Table 3", seats: 4, status: "reserved" },
        { id: 4, name: "Table 4", seats: 4, status: "available" },
        { id: 5, name: "Table 5", seats: 4, status: "unavailable" },
        { id: 6, name: "Table 6", seats: 6, status: "available" },
        { id: 7, name: "Table 7", seats: 2, status: "reserved" },
        { id: 8, name: "Table 8", seats: 4, status: "unavailable" },
        { id: 9, name: "Table 9", seats: 6, status: "unavailable" },
        { id: 10, name: "Table 10", seats: 2, status: "available" },
        { id: 11, name: "Table 11", seats: 4, status: "available" },
        { id: 12, name: "Table 12", seats: 4, status: "available" },
        { id: 13, name: "Table 13", seats: 4, status: "available" },
        { id: 14, name: "Table 14", seats: 6, status: "available" },
        { id: 15, name: "Table 15", seats: 6, status: "available" }
      ]);
    }
    if (!localStorage.getItem(this.QR_KEY)) {
      this.setQR({
        'DT-48291': [1,0,1,1,0,1, 0,1,0,0,1,0, 1,0,1,0,1,1, 0,1,0,1,0,0, 1,1,0,0,1,0, 0,0,1,1,0,1],
        'DT-39182': [1,1,0,1,0,1, 0,0,1,0,1,0, 1,0,0,1,0,1, 0,1,1,0,1,1, 1,0,1,0,0,0, 0,1,0,1,1,0],
        'DT-27364': [0,1,1,0,1,1, 1,0,0,1,0,0, 0,1,0,1,1,0, 1,0,1,0,0,1, 0,1,1,0,1,0, 1,1,0,1,0,1],
        'DT-15293': [1,0,0,1,1,0, 0,1,1,0,0,1, 1,1,0,0,1,1, 0,0,1,1,0,0, 1,0,1,0,1,0, 0,1,0,1,0,1],
        'DT-62810': [0,1,0,1,0,1, 1,0,1,0,1,0, 0,0,1,1,0,1, 1,1,0,0,1,1, 0,1,1,0,1,0, 1,0,0,1,0,1],
        'DT-74523': [1,1,1,0,0,1, 0,0,0,1,1,0, 1,0,1,0,1,1, 0,1,0,1,0,0, 1,1,0,1,0,1, 0,0,1,0,1,1]
      });
    }
    if (!localStorage.getItem(this.RESTAURANTS_KEY)) {
      this.setRestaurants([
        {
          id: 1, name: "Spice Garden", cuisine: "Indian", subtitle: "Indian • Vegetarian Friendly", rating: 4.5, reviewCount: 284, distance: 2.1, location: "MG Road, Bangalore", price: "₹500 – ₹650  Price Range", availableSlots: ["7:00 PM", "8:00 PM"], amenities: ["Outdoor Seating", "Vegetarian Options", "Family Friendly"],
          images: ["../images/indian.jpg", "../images/healthy.jpg", "../images/italian.jpg", "../images/mexican.jpg"],
          image: "../images/indian.jpg",
          description: "Spice Garden brings authentic Indian flavors to the heart of Bangalore. Our chefs craft each dish with fresh, locally-sourced ingredients using traditional techniques.",
          phone: "8012345678", openingHours: "11:00 AM – 10:00 PM", parking: "Valet Available", dressCode: "Smart Casual",
          operationalHours: [{ days: "Monday – Friday", hours: "11:00 AM – 10:00 PM", isOpen: true }, { days: "Saturday – Sunday", hours: "10:00 AM – 11:30 PM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Sarah Johnson", avatar: "../images/icon-profile.png", stars: 5, text: "Absolutely outstanding food! The butter chicken was the best I've ever had in the city." },
            { name: "Michael Chen", avatar: "../images/icon-profile.png", stars: 4, text: "Great atmosphere and fantastic service. The thali platter was value for money." }
          ]
        },
        {
          id: 2, name: "Sushi Master", cuisine: "Japanese", subtitle: "Japanese • Fine Dining", rating: 4.8, reviewCount: 412, distance: 3.5, location: "Indiranagar, Bangalore", price: "₹800 – ₹950  Price Range", availableSlots: ["6:00 PM", "7:30 PM", "9:00 PM"], amenities: ["Private Dining", "Sake Bar", "Omakase Menu"],
          images: ["../images/japanese.jpg", "../images/thai.jpg", "../images/chinese.jpg", "../images/healthy.jpg"],
          image: "../images/japanese.jpg",
          description: "Sushi Master is a sanctuary for Japanese cuisine lovers. Our executive chef trained for over a decade in Tokyo and brings authentic omakase experiences.",
          phone: "8098765432", openingHours: "12:00 PM – 11:00 PM", parking: "Street Parking", dressCode: "Smart Casual",
          operationalHours: [{ days: "Monday – Friday", hours: "12:00 PM – 11:00 PM", isOpen: true }, { days: "Saturday – Sunday", hours: "11:00 AM – 11:30 PM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Rohan Mehra", avatar: "../images/icon-profile.png", stars: 5, text: "The omakase was a revelation. Every course was thoughtfully prepared." },
            { name: "Priya Nair", avatar: "../images/icon-profile.png", stars: 5, text: "Best sushi outside of Japan. The ambience is serene and sophisticated." }
          ]
        },
        {
          id: 3, name: "Burger Joint", cuisine: "American", subtitle: "American • Casual Dining", rating: 3.9, reviewCount: 198, distance: 1.2, location: "Koramangala, Bangalore", price: "₹300 – ₹450  Price Range", availableSlots: ["12:00 PM", "1:00 PM"], amenities: ["Live Sports Screening", "Takeaway", "Kids Menu"],
          images: ["../images/american.jpg", "../images/mexican.jpg", "../images/italian.jpg", "../images/healthy.jpg"],
          image: "../images/american.jpg",
          description: "The original smash-burger experience in Bangalore. Burger Joint keeps it simple—top-quality beef, fresh brioche buns, and house-made sauces.",
          phone: "8076543210", openingHours: "11:00 AM – 12:00 AM", parking: "No Parking", dressCode: "Casual",
          operationalHours: [{ days: "Monday – Thursday", hours: "11:00 AM – 12:00 AM", isOpen: true }, { days: "Friday – Sunday", hours: "10:00 AM – 1:00 AM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Amit Khanna", avatar: "../images/icon-profile.png", stars: 4, text: "The smash burger is insanely good. Crispy edges, juicy inside." }
          ]
        },
        {
          id: 4, name: "Le Gourmet", cuisine: "Fine Dining", subtitle: "Italian • Fine Dining", rating: 4.9, reviewCount: 320, distance: 4.0, location: "UB City, Bangalore", price: "₹1200 – ₹1500  Price Range", availableSlots: ["7:00 PM", "9:00 PM"], amenities: ["Outdoor Seating", "Family Friendly", "Vegetarian Options"],
          images: ["../images/italian.jpg", "../images/indian.jpg", "../images/japanese.jpg", "../images/healthy.jpg"],
          image: "../images/italian.jpg",
          description: "Le Gourmet brings authentic Italian cuisine to the heart of Bangalore. Our chef, trained in Naples, crafts each dish with fresh, locally-sourced ingredients.",
          phone: "+91 80 1234 5678", openingHours: "11:00 AM – 10:00 PM", parking: "Valet Available", dressCode: "Smart Casual",
          operationalHours: [{ days: "Monday – Friday", hours: "11:00 AM – 10:00 PM", isOpen: true }, { days: "Saturday – Sunday", hours: "10:00 AM – 11:30 PM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Sarah Johnson", avatar: "../images/icon-profile.png", stars: 5, text: "Simply the best fine dining experience in Bangalore." }
          ]
        },
        {
          id: 5, name: "Taco Fiesta", cuisine: "Mexican", subtitle: "Mexican • Casual Dining", rating: 4.0, reviewCount: 156, distance: 0.8, location: "HSR Layout, Bangalore", price: "₹350 – ₹500  Price Range", availableSlots: ["6:00 PM", "9:00 PM"], amenities: ["Takeaway", "Tequila Bar", "Happy Hours"],
          images: ["../images/mexican.jpg", "../images/american.jpg", "../images/italian.jpg", "../images/indian.jpg"],
          image: "../images/mexican.jpg",
          description: "Taco Fiesta is your neighborhood Mexican joint packed with bold flavors, vibrant colors, and a festive spirit.",
          phone: "8055551234", openingHours: "12:00 PM – 11:00 PM", parking: "Street Parking", dressCode: "Casual",
          operationalHours: [{ days: "Monday – Friday", hours: "12:00 PM – 11:00 PM", isOpen: true }, { days: "Saturday – Sunday", hours: "11:00 AM – 12:00 AM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Andrea Lopez", avatar: "../images/icon-profile.png", stars: 5, text: "Best tacos in Bangalore! The al pastor is exactly how it should be." }
          ]
        },
        {
          id: 6, name: "Dragon Palace", cuisine: "Chinese", subtitle: "Chinese • Dim Sum", rating: 4.6, reviewCount: 340, distance: 5.2, location: "Whitefield, Bangalore", price: "₹600 – ₹750  Price Range", availableSlots: ["7:00 PM", "8:30 PM"], amenities: ["Private Rooms", "Weekend Brunch", "Dim Sum"],
          images: ["../images/chinese.jpg", "../images/japanese.jpg", "../images/thai.jpg", "../images/healthy.jpg"],
          image: "../images/chinese.jpg",
          description: "Dragon Palace is Bangalore's premier destination for authentic Cantonese cuisine and dim sum.",
          phone: "8067890123", openingHours: "10:00 AM – 11:00 PM", parking: "Valet Available", dressCode: "Smart Casual",
          operationalHours: [{ days: "Monday – Friday", hours: "10:00 AM – 11:00 PM", isOpen: true }, { days: "Saturday – Sunday", hours: "9:00 AM – 12:00 AM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Wei Zhang", avatar: "../images/icon-profile.png", stars: 5, text: "Authentic flavors that remind me of home in Hong Kong." }
          ]
        },
        {
          id: 7, name: "Green Bowl", cuisine: "Healthy", subtitle: "Healthy • Vegan Friendly", rating: 4.8, reviewCount: 267, distance: 2.2, location: "Jayanagar, Bangalore", price: "₹400 – ₹550  Price Range", availableSlots: ["12:00 PM", "1:00 PM", "7:00 PM"], amenities: ["Vegan Menu", "Gluten-Free Options", "Organic Produce"],
          images: ["../images/healthy.jpg", "../images/indian.jpg", "../images/thai.jpg", "../images/italian.jpg"],
          image: "../images/healthy.jpg",
          description: "Green Bowl is a celebration of wholesome, plant-forward food. Every ingredient is sourced from certified organic farms.",
          phone: "8022223333", openingHours: "8:00 AM – 9:00 PM", parking: "Street Parking", dressCode: "Casual",
          operationalHours: [{ days: "Monday – Friday", hours: "8:00 AM – 9:00 PM", isOpen: true }, { days: "Saturday – Sunday", hours: "8:00 AM – 10:00 PM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Maya Patel", avatar: "../images/icon-profile.png", stars: 5, text: "Finally a place that makes healthy food exciting!" }
          ]
        },
        {
          id: 8, name: "Prime Steakhouse", cuisine: "Steakhouse", subtitle: "Steakhouse • Fine Dining", rating: 4.9, reviewCount: 388, distance: 3.5, location: "Lavelle Road, Bangalore", price: "₹1500 – ₹2000  Price Range", availableSlots: ["6:00 PM", "8:00 PM"], amenities: ["Dry-Aged Beef", "Whiskey Lounge", "Private Rooms"],
          images: ["../images/indian.jpg", "../images/american.jpg", "../images/italian.jpg", "../images/chinese.jpg"],
          image: "../images/indian.jpg",
          description: "Prime Steakhouse is the pinnacle of carnivore dining in Bangalore. Our USDA dry-aged cuts are paired with an extensive whiskey and wine selection.",
          phone: "8044445555", openingHours: "6:00 PM – 12:00 AM", parking: "Valet Available", dressCode: "Formal",
          operationalHours: [{ days: "Monday – Friday", hours: "6:00 PM – 12:00 AM", isOpen: true }, { days: "Saturday – Sunday", hours: "5:00 PM – 1:00 AM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Robert King", avatar: "../images/icon-profile.png", stars: 5, text: "The ribeye was cooked to absolute perfection." }
          ]
        },
        {
          id: 9, name: "Ocean Catch", cuisine: "Seafood", subtitle: "Seafood • Coastal Cuisine", rating: 4.6, reviewCount: 305, distance: 1.2, location: "Residency Road, Bangalore", price: "₹550 – ₹700  Price Range", availableSlots: ["6:30 PM", "7:30 PM", "8:30 PM"], amenities: ["Fresh Daily Catch", "Outdoor Terrace", "Cocktail Bar"],
          images: ["../images/thai.jpg", "../images/healthy.jpg", "../images/japanese.jpg", "../images/chinese.jpg"],
          image: "../images/thai.jpg",
          description: "Ocean Catch celebrates the bounty of the Indian coastline. Our fish arrives fresh daily from the Kerala and Goa markets.",
          phone: "8033336666", openingHours: "12:00 PM – 11:00 PM", parking: "Street Parking", dressCode: "Smart Casual",
          operationalHours: [{ days: "Monday – Friday", hours: "12:00 PM – 11:00 PM", isOpen: true }, { days: "Saturday – Sunday", hours: "11:00 AM – 12:00 AM", isOpen: false }],
          menuImages: ["../images/menu1.png", "../images/menu2.png"],
          reviews: [
            { name: "Goa Traveller", avatar: "../images/icon-profile.png", stars: 5, text: "The prawn curry tasted exactly like the ones I grew up eating at the Goa beach shacks." }
          ]
        }
      ]);
    }

    localStorage.setItem(this.SEEDED_KEY, 'true');
  },

  getUser() { return JSON.parse(localStorage.getItem(this.USER_KEY)); },
  setUser(data) { localStorage.setItem(this.USER_KEY, JSON.stringify(data)); },

  getSettings() { return JSON.parse(localStorage.getItem(this.SETTINGS_KEY)); },
  setSettings(data) { localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data)); },

  getReservations() { return JSON.parse(localStorage.getItem(this.RESERVATIONS_KEY)) || []; },
  setReservations(data) { localStorage.setItem(this.RESERVATIONS_KEY, JSON.stringify(data)); },

  getCategories() { return JSON.parse(localStorage.getItem(this.CATEGORIES_KEY)) || []; },
  setCategories(data) { localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(data)); },

  getRestaurants() { return JSON.parse(localStorage.getItem(this.RESTAURANTS_KEY)) || []; },
  setRestaurants(data) { localStorage.setItem(this.RESTAURANTS_KEY, JSON.stringify(data)); },

  getMenu() { return JSON.parse(localStorage.getItem(this.MENU_KEY)) || []; },
  setMenu(data) { localStorage.setItem(this.MENU_KEY, JSON.stringify(data)); },

  getTables() { return JSON.parse(localStorage.getItem(this.TABLES_KEY)) || []; },
  setTables(data) { localStorage.setItem(this.TABLES_KEY, JSON.stringify(data)); },

  getQR() { return JSON.parse(localStorage.getItem(this.QR_KEY)) || {}; },
  setQR(data) { localStorage.setItem(this.QR_KEY, JSON.stringify(data)); },

  addReservation(res) {
    const list = this.getReservations();
    list.push(res);
    this.setReservations(list);
  },
  
  cancelReservation(id) {
    const list = this.getReservations();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx].status = 'Cancelled';
      this.setReservations(list);
    }

    try {
      let staffBookings = JSON.parse(localStorage.getItem('dinetime_bookings_v5')) || [];
      const newStaffBookings = staffBookings.filter(b => b.id !== id);
      if (staffBookings.length !== newStaffBookings.length) {
        localStorage.setItem('dinetime_bookings_v5', JSON.stringify(newStaffBookings));
      }
    } catch(e) {}
  },

  // Call this when a new user registers to wipe all personal/user-specific data
  initNewUser() {
    // Clear reservations — new user has none
    this.setReservations([]);
    // Reset settings to defaults
    this.setSettings({
      notifications: true,
      smsAlerts: false,
      promotions: true,
      language: 'English',
      currency: 'INR (\u20b9)',
      dietary: 'None'
    });
    // Remove any saved booking / payment session data
    localStorage.removeItem('dinetime_booking_state');
    localStorage.removeItem('dinetime_payment_method');
    localStorage.removeItem('dinetime_cart');
  }
};

DinetimeStore.init();
