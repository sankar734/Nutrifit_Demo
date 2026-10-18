# NutriChef Frontend (Unified — Customer + Admin)

One React + Vite + Tailwind app that serves **both** the customer-facing mobile-style experience and the admin dashboard, gated by user role. Light purple theme, glassmorphism cards, rounded corners, matching the reference design.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # point VITE_API_URL to your backend
npm run dev              # http://localhost:5173
```

## How role-based routing works

- Everyone logs in from the same `/login` screen (Email/Password or Phone OTP)
- After login, `customer` and `chef` roles are sent to `/home` — the mobile-style app shell (bottom nav: Home, Search, Cart, Nutrition, Profile)
- `admin` and `superadmin` roles are sent to `/admin` — the dashboard shell (sidebar: Dashboard, Users, Chefs, Orders, Coupons)
- Admin routes are protected by `RoleRoute` (`src/components/shared/RoleRoute.jsx`) — non-admins are redirected to `/home` if they try to visit `/admin/*` directly

## Folder structure

```
src/
├── pages/
│   ├── customer/   Splash, Onboarding, Login, Home, Search, FoodDetails, Cart, Checkout, OrderTracking, NutritionDashboard, Profile
│   └── admin/       Dashboard, Users, Chefs, Orders, Coupons
├── components/
│   ├── customer/   MobileLayout, BottomNav, Header, FoodCard, ChefCard
│   ├── admin/       AdminLayout, AdminSidebar, AdminTopbar, StatCard
│   └── shared/      ProtectedRoute, RoleRoute
├── context/          AuthContext, CartContext
└── services/         api.js (customer + shared endpoints), adminApi.js (admin-only endpoints)
```

## Demo logins

| Role     | Login                       | Password    |
|----------|-----------------------------|-------------|
| Admin    | srihariram2005@gmail.com    | password123 |
| Chef     | sankar73051862@gmail.com    | password123 |
| Delivery | sankarnaga005@gmail.com     | password123 |
| Customer | customer@nutrichef.demo     | password123 |

(after running `npm run seed` in the backend)

## Food images

The 8 seeded dishes use real photos placed in `public/food-images/` — these are referenced directly by the backend's seed data (`images: ['/food-images/xxx.jpg']`) and resolved by the browser against the frontend's own origin, so no image hosting/CDN setup is needed for the demo.

## Payments

Checkout supports Razorpay (UPI/Card), Wallet, and Cash on Delivery. Without real `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` configured on the backend, Razorpay payments auto-complete in a mock-success mode so the full order flow still works end-to-end for demos.
