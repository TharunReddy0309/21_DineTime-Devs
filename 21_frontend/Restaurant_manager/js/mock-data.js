// Helper to get dynamic dates
const getFormattedDate = (daysAhead = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
};

const _today = getFormattedDate(0);
const _tomorrow = getFormattedDate(1);
const _dayAfter = getFormattedDate(2);
const _yesterday = getFormattedDate(-1);

const initialData = {

    profile: {
        name: "Rahul Sharma",
        email: "rahul.sharma@spicegarden.com",
        phone: "9876543210",
        city: "Bengaluru",
        restaurantName: "Spice Garden",
        memberSince: "January 2025"
    },
    restaurant: {
        name: "Spice Garden",
        about: "Spice Garden offers an authentic Indian dining experience with traditional recipes passed down through generations. Our chefs craft each dish with carefully selected spices and fresh ingredients to bring you the true flavors of India.",
        cuisine: "Indian",
        capacity: "80 seats",
        location: "123 MG Road, Indiranagar, Bengaluru",
        hours: "11:00 AM - 11:00 PM",
        parking: "Valet & Street Parking",
        rating: "4.8",
        dressCode: "Smart Casual",
        price: "200",
        contact: "8012345678"
    },
    policies: [
        { title: "Cancellation Policy", desc: "Free cancellation up to 2 hours before reservation time. Late cancellations may incur a ₹500 fee." },
        { title: "No-Show Policy", desc: "No-shows will be charged ₹1000 per person. This helps us maintain quality service for all guests." },
        { title: "Advance Booking", desc: "Reservations can be made up to 30 days in advance. Same-day reservations accepted based on availability." },
        { title: "Special Occasions", desc: "For birthdays, anniversaries, or celebrations, please inform us at least 24 hours in advance." },
        { title: "Group Reservations", desc: "For parties of 8 or more, please contact us directly. A deposit may be required." },
        { title: "Late Arrival", desc: "We hold tables for 15 minutes past reservation time. Please call if you're running late." }
    ],
    gallery: [
        "images/gallery-1.jpg",
        "images/gallery-2.jpg",
        "images/gallery-3.jpg",
        "images/restaurant_interior.png",
        "images/restaurant_table.png",
        "images/restaurant_exterior.png"
    ],
    activity: {
        reservations: 24,
        availableTables: 12,
        avgRating: 4.5
    },
    reservations: [
        { id: "1", name: "Aditya Patel", status: "Confirmed", date: _today, time: "19:30", guests: 4, table: "T01", email: "aditya.patel@email.com", phone: "9876543210", request: "VIP table for VIP meet" },
        { id: "2", name: "Rajesh Kumar", status: "Confirmed", date: _today, time: "19:00", guests: 2, table: "T02", email: "rajesh.k@email.com", phone: "9876543211", request: "Anniversary dinner" },
        { id: "3", name: "Anita Desai", status: "Confirmed", date: _today, time: "20:00", guests: 6, table: "T03", email: "anita.desai@email.com", phone: "9876543212", request: "None" },
        { id: "4", name: "Vikram Singh", status: "Pending", date: _tomorrow, time: "18:30", guests: 3, table: "T04", email: "vikram.singh@email.com", phone: "9876543213", request: "Allergy: Peanuts" },
        { id: "5", name: "Meera Reddy", status: "Confirmed", date: _tomorrow, time: "21:00", guests: 2, table: "T05", email: "meera.reddy@email.com", phone: "9876543214", request: "Window seat if possible" },
        { id: "6", name: "Arjun Kapoor", status: "Pending", date: _today, time: "19:15", guests: 5, table: "T06", email: "arjun.kapoor@email.com", phone: "9876543215", request: "Kids menu required" },
        { id: "7", name: "Divya Sharma", status: "Confirmed", date: _tomorrow, time: "20:30", guests: 4, table: "T07", email: "divya.sharma@email.com", phone: "9876543216", request: "None" },
        { id: "8", name: "Karan Mehta", status: "No-show", date: _yesterday, time: "19:00", guests: 2, table: "T08", email: "karan.mehta@email.com", phone: "9876543217", request: "None" },
        { id: "9", name: "Sanjay Gupta", status: "Pending", date: _tomorrow, time: "20:00", guests: 4, table: "T09", email: "sanjay.gupta@email.com", phone: "9876543218", request: "Birthday celebration" },
        { id: "10", name: "Lakshmi Iyer", status: "Pending", date: _today, time: "19:30", guests: 2, table: "T10", email: "lakshmi.iyer@email.com", phone: "9876543219", request: "Vegetarian options" },
        { id: "11", name: "Rohan Chatterjee", status: "Confirmed", date: _today, time: "18:00", guests: 3, table: "T11", email: "rohan.chat@email.com", phone: "9876543220", request: "Quiet corner" },
        { id: "12", name: "Sneha Nair", status: "Confirmed", date: _tomorrow, time: "19:45", guests: 5, table: "T12", email: "sneha.nair@email.com", phone: "9876543221", request: "None" },
        { id: "13", name: "Amit Varma", status: "Confirmed", date: _today, time: "21:30", guests: 2, table: "T13", email: "amit.varma@email.com", phone: "9876543222", request: "Late arrival expected" },
        { id: "14", name: "Pooja Joshi", status: "Confirmed", date: _tomorrow, time: "20:15", guests: 4, table: "T14", email: "pooja.joshi@email.com", phone: "9876543223", request: "Business meeting" },
        { id: "15", name: "Naveen Kumar", status: "Pending", date: _dayAfter, time: "19:00", guests: 6, table: "T15", email: "naveen.k@email.com", phone: "9876543224", request: "Cake arrangement" },
        { id: "16", name: "Simran Kaur", status: "Pending", date: _dayAfter, time: "20:30", guests: 2, table: "T16", email: "simran.kaur@email.com", phone: "9876543225", request: "None" },
        { id: "17", name: "Vishal Sharma", status: "Confirmed", date: _today, time: "18:45", guests: 3, table: "T17", email: "vishal.s@email.com", phone: "9876543226", request: "None" },
        { id: "18", name: "Deepa Menon", status: "Confirmed", date: _tomorrow, time: "19:00", guests: 8, table: "T18", email: "deepa.menon@email.com", phone: "9876543227", request: "Family dinner" },
        { id: "19", name: "Ashok Pillai", status: "Confirmed", date: _dayAfter, time: "20:00", guests: 2, table: "T19", email: "ashok.pillai@email.com", phone: "9876543228", request: "None" },
        { id: "20", name: "Priya Singh", status: "Pending", date: _dayAfter, time: "21:00", guests: 4, table: "T20", email: "priya.singh@email.com", phone: "9876543229", request: "None" },
        { id: "21", name: "Manoj Rawat", status: "Cancelled", date: _today, time: "19:30", guests: 2, table: "--", email: "manoj.rawat@email.com", phone: "9876543230", request: "None" },
        { id: "22", name: "Ritu Soni", status: "Confirmed", date: _dayAfter, time: "20:45", guests: 5, table: "T21", email: "ritu.soni@email.com", phone: "9876543231", request: "None" },
        { id: "23", name: "Mohit Agarwal", status: "Pending", date: _dayAfter, time: "19:15", guests: 3, table: "T22", email: "mohit.agarwal@email.com", phone: "9876543232", request: "None" },
        { id: "24", name: "Neha Chawla", status: "Pending", date: _dayAfter, time: "20:00", guests: 2, table: "T23", email: "neha.chawla@email.com", phone: "9876543233", request: "None" },
        { id: "25", name: "Ananda Roy", status: "Confirmed", date: _today, time: "18:00", guests: 4, table: "T24", email: "ananda.roy@email.com", phone: "9876543234", request: "None" }
    ],


    menu: [
        { id: "101", name: "Paneer Tikka", category: "Starters", price: 320, available: true, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c175f0?auto=format&fit=crop&w=400&q=80" },
        { id: "102", name: "Veg Spring Rolls", category: "Starters", price: 280, available: true, image: "../Diner/images/veg_spring_rolls.png" },
        { id: "103", name: "Veg Biryani", category: "Main Course", price: 380, available: true, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80" },
        { id: "104", name: "Paneer Butter Masala", category: "Main Course", price: 420, available: true, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80" },
        { id: "105", name: "Dal Makhani", category: "Main Course", price: 320, available: true, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80" },
        { id: "106", name: "Chocolate Cake", category: "Desserts", price: 180, available: true, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80" },
        { id: "107", name: "Gulab Jamun", category: "Desserts", price: 120, available: true, image: "../Diner/images/gulab_jamun.png" },
        { id: "108", name: "Mango Lassi", category: "Beverages", price: 150, available: true, image: "../Diner/images/mango_lassi.png" },
        { id: "109", name: "Masala Chai", category: "Beverages", price: 80, available: true, image: "../Diner/images/masala_chai.png" }
    ],
    staff: [
        { id: "s1", name: "Rahul Sharma",  initials: "RS", role: "Restaurant Staff", email: "rahul.sharma@email.com",  phone: "9876543210", requestedOn: "Mar 3, 2026",  status: "Pending" },
        { id: "s2", name: "Priya Patel",   initials: "PP", role: "Restaurant Staff", email: "priya.patel@email.com",   phone: "9870543211", requestedOn: "Mar 4, 2026",  status: "Pending" },
        { id: "s3", name: "Amit Kumar",    initials: "AK", role: "Restaurant Staff", email: "amit.kumar@email.com",    phone: "9876543212", requestedOn: "Mar 5, 2026",  status: "Pending" },
        { id: "s4", name: "Sneha Reddy",   initials: "SR", role: "Restaurant Staff", email: "sneha.reddy@email.com",   phone: "9876543213", requestedOn: "Mar 6, 2026",  status: "Pending" },
        { id: "s5", name: "Vikram Singh",  initials: "VS", role: "Restaurant Staff", email: "vikram.singh@email.com",  phone: "9876543214", requestedOn: "Mar 1, 2026",  status: "Approved" },
        { id: "s6", name: "Anjali Desai",  initials: "AD", role: "Restaurant Staff", email: "anjali.desai@email.com",  phone: "9876543215", requestedOn: "Feb 28, 2026", status: "Rejected" }
    ],
    notifications: [
        { id: "n1", type: "reservation", text: "<strong>New Reservation</strong> from John Doe for 4 people at 7:00 PM.", time: "10 mins ago", read: false, icon: "ph-calendar-check", iconColor: "text-green", bgClass: "bg-green-light" },
        { id: "n2", type: "review", text: "<strong>New 5-star review</strong> for Spice Garden!", time: "1 hour ago", read: false, icon: "ph-star", iconColor: "text-orange", bgClass: "bg-orange-light" },
        { id: "n3", type: "system", text: "System maintenance scheduled for tonight at 2:00 AM.", time: "3 hours ago", read: false, icon: "ph-info", iconColor: "text-muted", bgClass: "bg-gray-light" }
    ],
    tables: [
        { id: "tbl-1", number: "Table 1", seats: 2 },
        { id: "tbl-2", number: "Table 2", seats: 4 },
        { id: "tbl-3", number: "Table 3", seats: 4 },
        { id: "tbl-4", number: "Table 4", seats: 2 },
        { id: "tbl-5", number: "Table 5", seats: 6 },
        { id: "tbl-6", number: "Table 6", seats: 4 }
    ],
    blockedTables: [],
    reviews: [
        { id: "rv-1", author: "Amit Verma", initials: "AV", date: "March 14, 2026", rating: 5, comment: "Excellent experience! The paneer tikka was outstanding. Highly recommended for family dinners.", verified: true, status: "Responded", reply: "Thank you Amit! We're glad you enjoyed it." },
        { id: "rv-2", author: "Sania Mirza", initials: "SM", date: "March 12, 2026", rating: 4, comment: "Great food, but the wait time was a bit long on Saturday. The butter chicken was worth it though.", verified: true, status: "Pending", reply: "" },
        { id: "rv-3", author: "Peter Parker", initials: "PP", date: "March 10, 2026", rating: 5, comment: "The service is exceptional. Every dish was a 10/10. Definitely coming back!", verified: true, status: "Responded", reply: "Thanks Peter! Great power comes with great food." },
        { id: "rv-4", author: "Ananya Roy", initials: "AR", date: "March 8, 2026", rating: 5, comment: "Love the ambiance here. It is my favorite spot in the city for authentic Indian food.", verified: true, status: "Responded", reply: "Glad you like it, Ananya!" },
        { id: "rv-5", author: "Rohan Khanna", initials: "RK", date: "March 5, 2026", rating: 3, comment: "Food is good but it was quite noisy today. Hard to have a conversation.", verified: true, status: "Pending", reply: "" },
        { id: "rv-1", author: "Amit Verma", initials: "AV", date: "2026-03-14", rating: 5, comment: "Excellent experience! The paneer tikka was outstanding. Highly recommended for family dinners.", verified: true, status: "Responded", reply: "Thank you Amit! We're glad you enjoyed it." },
        { id: "rv-2", author: "Sania Mirza", initials: "SM", date: "2026-03-12", rating: 4, comment: "Great food, but the wait time was a bit long on Saturday. The butter chicken was worth it though.", verified: true, status: "Pending", reply: "" },
        { id: "rv-3", author: "Peter Parker", initials: "PP", date: "2026-03-10", rating: 5, comment: "The service is exceptional. Every dish was a 10/10. Definitely coming back!", verified: true, status: "Responded", reply: "Thanks Peter! Great power comes with great food." },
        { id: "rv-4", author: "Ananya Roy", initials: "AR", date: "2026-03-08", rating: 5, comment: "Love the ambiance here. It is my favorite spot in the city for authentic Indian food.", verified: true, status: "Responded", reply: "Glad you like it, Ananya!" },
        { id: "rv-5", author: "Rohan Khanna", initials: "RK", date: "2026-03-05", rating: 3, comment: "Food is good but it was quite noisy today. Hard to have a conversation.", verified: true, status: "Pending", reply: "" },
        { id: "rv-6", author: "Sneha Nair", initials: "SN", date: "2026-03-02", rating: 5, comment: "Best Dal Makhani I've ever had. Perfectly creamy and flavorful.", verified: true, status: "Responded", reply: "Thank you Sneha! It's our special recipe." },
        { id: "rv-7", author: "Vikram Singh", initials: "VS", date: "2026-02-28", rating: 4, comment: "Authentic spices and very fresh ingredients. Good value for money.", verified: true, status: "Responded", reply: "We appreciate your kind words, Vikram." },
        { id: "rv-8", author: "Divya Sharma", initials: "DS", date: "2026-02-25", rating: 5, comment: "The mango lassi is to die for! Everything was perfect from start to finish.", verified: true, status: "Pending", reply: "" },
        { id: "rv-9", author: "Arjun Bajaj", initials: "AB", date: "2026-02-20", rating: 4, comment: "Portion sizes are good. Staff is very attentive and polite.", verified: true, status: "Responded", reply: "Thanks for visiting us, Arjun!" },
        { id: "rv-10", author: "Kriti Sanon", initials: "KS", date: "2026-02-15", rating: 5, comment: "Marvelous experience! The dessert menu is particularly impressive.", verified: true, status: "Responded", reply: "We hope to see you again soon, Kriti!" },
        { id: "rv-11", author: "Manish Malhotra", initials: "MM", date: "2026-02-10", rating: 2, comment: "The soup was served lukewarm. Disappointed with the service today.", verified: true, status: "Responded", reply: "We apologize for the oversight, Manish. We'll improve our standards." },
        { id: "rv-12", author: "Kiara Advani", initials: "KA", date: "2026-02-05", rating: 5, comment: "Amazing vibe and even better food. The Garlic Naan is a must-try!", verified: true, status: "Pending", reply: "" }
    ],
    timeSlotsConfig: {
        operatingHours: { open: "11:00", close: "23:00" },
        dates: {
            [_today]: {
                isClosed: false,
                slots: [
                    { id: "ts-1", start: "11:00", end: "12:00", text: "11:00 AM – 12:00 PM", maxTables: 10 },
                    { id: "ts-2", start: "12:00", end: "13:00", text: "12:00 PM – 1:00 PM", maxTables: 10 },
                    { id: "ts-3", start: "13:00", end: "14:00", text: "1:00 PM – 2:00 PM", maxTables: 10 },
                    { id: "ts-l1", start: "14:00", end: "15:00", text: "2:00 PM – 3:00 PM", maxTables: 10 },
                    { id: "ts-d1", start: "17:00", end: "18:00", text: "5:00 PM – 6:00 PM", maxTables: 12 },
                    { id: "ts-4", start: "18:00", end: "19:00", text: "6:00 PM – 7:00 PM", maxTables: 12 },
                    { id: "ts-5", start: "19:00", end: "20:00", text: "7:00 PM – 8:00 PM", maxTables: 12 },
                    { id: "ts-d2", start: "20:00", end: "21:00", text: "8:00 PM – 9:00 PM", maxTables: 12 },
                    { id: "ts-d3", start: "21:00", end: "22:00", text: "9:00 PM – 10:00 PM", maxTables: 12 }
                ]
            },
            [_tomorrow]: {
                isClosed: false,
                slots: [
                    { id: "ts-l2", start: "12:00", end: "13:00", text: "12:00 PM – 1:00 PM", maxTables: 10 },
                    { id: "ts-l3", start: "13:00", end: "14:00", text: "1:00 PM – 2:00 PM", maxTables: 10 },
                    { id: "ts-d4", start: "18:00", end: "19:00", text: "6:00 PM – 7:00 PM", maxTables: 12 },
                    { id: "ts-d5", start: "19:00", end: "20:00", text: "7:00 PM – 8:00 PM", maxTables: 12 },
                    { id: "ts-d6", start: "20:00", end: "21:00", text: "8:00 PM – 9:00 PM", maxTables: 12 },
                    { id: "ts-d7", start: "21:00", end: "22:00", text: "9:00 PM – 10:00 PM", maxTables: 12 }
                ]
            }
        }
    }
};
