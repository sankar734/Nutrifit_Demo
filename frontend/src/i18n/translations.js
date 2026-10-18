// Lightweight i18n dictionary. Add more languages by adding a new top-level
// key here — the Settings > Language screen picks up any language listed in
// `languageMeta` automatically.

export const languageMeta = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
];

const translations = {
  en: {
    // Bottom nav
    nav_home: 'Home',
    nav_search: 'Search',
    nav_cart: 'Cart',
    nav_nutrition: 'Nutrition',
    nav_profile: 'Profile',

    // Home
    greeting: 'Good day',
    search_placeholder: 'Search healthy meals, chefs...',
    nearby_chefs: 'Nearby Chefs',
    popular_meals: 'Popular Healthy Meals',
    see_all: 'See all',
    water_intake: 'Water intake',
    water_intake_desc: 'Track your daily hydration goal',
    open: 'Open',

    // Common
    add_to_cart: 'Add to Cart',
    added_to_cart: 'Added to cart',
    my_orders: 'My Orders',
    settings: 'Settings',
    logout: 'Log Out',
    profile: 'Profile',
    checkout: 'Checkout',
    place_order: 'Place Order',
    total: 'Total',
    subtotal: 'Subtotal',
    delivery_fee: 'Delivery Fee',
    tax: 'Tax',
    free: 'Free',

    // Cart
    my_cart: 'My Cart',
    empty_cart: 'Your cart is empty',
    empty_cart_desc: 'Add some healthy meals to get started',
    browse_meals: 'Browse Meals',
    proceed_checkout: 'Proceed to Checkout',

    // Profile / Settings
    wallet_payments: 'Wallet & Payments',
    notifications: 'Notifications',
    become_chef: 'Become a Chef',
    become_delivery: 'Become a Delivery Partner',
    chef_dashboard: 'Chef Dashboard',
    delivery_dashboard: 'Delivery Dashboard',
    switch_to_customer: 'Switch to Customer View',
    saved_addresses: 'Saved Addresses',

    // Login
    welcome_back: 'Welcome back',
    create_account: 'Create account',
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    email_password: 'Password',
    phone_otp: 'Phone OTP',
    email_otp: 'Email OTP',
  },
  ta: {
    nav_home: 'முகப்பு',
    nav_search: 'தேடல்',
    nav_cart: 'கார்ட்',
    nav_nutrition: 'ஊட்டச்சத்து',
    nav_profile: 'சுயவிவரம்',

    greeting: 'வணக்கம்',
    search_placeholder: 'உணவு, சமையல்காரர்களை தேடுங்கள்...',
    nearby_chefs: 'அருகிலுள்ள சமையல்காரர்கள்',
    popular_meals: 'பிரபலமான ஆரோக்கிய உணவுகள்',
    see_all: 'அனைத்தையும் பார்க்க',
    water_intake: 'தண்ணீர் அளவு',
    water_intake_desc: 'தினசரி நீர்ச்சத்து இலக்கை கண்காணிக்கவும்',
    open: 'திற',

    add_to_cart: 'கார்ட்டில் சேர்',
    added_to_cart: 'கார்ட்டில் சேர்க்கப்பட்டது',
    my_orders: 'எனது ஆர்டர்கள்',
    settings: 'அமைப்புகள்',
    logout: 'வெளியேறு',
    profile: 'சுயவிவரம்',
    checkout: 'செக்அவுட்',
    place_order: 'ஆர்டர் செய்யவும்',
    total: 'மொத்தம்',
    subtotal: 'துணை மொத்தம்',
    delivery_fee: 'டெலிவரி கட்டணம்',
    tax: 'வரி',
    free: 'இலவசம்',

    my_cart: 'எனது கார்ட்',
    empty_cart: 'உங்கள் கார்ட் காலியாக உள்ளது',
    empty_cart_desc: 'தொடங்க சில ஆரோக்கிய உணவுகளை சேர்க்கவும்',
    browse_meals: 'உணவுகளை பார்வையிடவும்',
    proceed_checkout: 'செக்அவுட் செய்யவும்',

    wallet_payments: 'வாலட் & பணம் செலுத்துதல்',
    notifications: 'அறிவிப்புகள்',
    become_chef: 'சமையல்காரராக சேரவும்',
    become_delivery: 'டெலிவரி பார்ட்னராக சேரவும்',
    chef_dashboard: 'சமையல்காரர் டாஷ்போர்டு',
    delivery_dashboard: 'டெலிவரி டாஷ்போர்டு',
    switch_to_customer: 'வாடிக்கையாளர் பார்வைக்கு மாறவும்',
    saved_addresses: 'சேமிக்கப்பட்ட முகவரிகள்',

    welcome_back: 'மீண்டும் வரவேற்கிறோம்',
    create_account: 'கணக்கை உருவாக்கவும்',
    sign_in: 'உள்நுழைக',
    sign_up: 'பதிவு செய்க',
    email_password: 'கடவுச்சொல்',
    phone_otp: 'மொபைல் OTP',
    email_otp: 'மின்னஞ்சல் OTP',
  },
};

export default translations;
