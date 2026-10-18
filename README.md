# NutriChef — AI Powered Healthy Homemade Food Delivery Platform

A full-stack starter implementation with **one unified web frontend** (customer + admin, role-based) and a Node.js backend.

```
nutrichef/
├── backend/    Node.js + Express + MongoDB + Socket.IO API
└── frontend/    React + Vite + Tailwind — single app for customers AND admins (role-based routing)
```

## Quick Start

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # set MONGO_URI at minimum; add SMTP_* for real emails, RAZORPAY_* for real payments
   npm run seed             # creates demo chef/customer/admin accounts + 8 real sample dishes with photos
   npm run dev               # http://localhost:5000
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev   # http://localhost:5173
   ```

## Demo logins

| Role     | Login                        | Password    | Redirects to |
|----------|-------------------------------|-------------|--------------|
| Customer | customer@nutrichef.demo       | password123 | `/home` (mobile-style app) |
| Chef     | sankar73051862@gmail.com      | password123 | `/chef` (chef dashboard) |
| Delivery | sankarnaga005@gmail.com       | password123 | `/delivery` (delivery dashboard) |
| Admin    | srihariram2005@gmail.com      | password123 | `/admin` (admin dashboard) |

One login screen for everyone — after signing in, the app automatically takes you to the right experience based on your account role. You can also log in with Phone + OTP (dev mode shows the OTP on-screen when SMS isn't configured). Any customer can apply to become a Chef or Delivery Partner right from their Profile page.

## What's included

- **Single login, four experiences**: customer app, chef dashboard, delivery dashboard, and admin dashboard — same design language, gated by role
- **Chef onboarding**: "Become a Chef" application form (from Profile) → pending KYC → Chef Dashboard to accept/reject orders and advance status (accepted → preparing → ready)
- **Delivery onboarding**: "Become a Delivery Partner" application form → Delivery Dashboard with online/offline toggle, live "order ready for pickup" notifications (Socket.IO), accept delivery, mark as delivered
- **Real food photography**: 8 dishes seeded with the actual food images you provided (overnight oats, chickpea feta salad, avocado toast, buddha bowl, smoothie bowl, grilled salmon, poke bowl, grilled chicken) — each with price, nutrition info, and dietary tags
- **Orders & Payments**: cart → checkout → order placement, with Razorpay integration (create-order + signature verification) that automatically falls back to a working mock-payment flow when no Razorpay keys are configured, plus Wallet and Cash on Delivery
- **My Orders / Reorder**: order history with one-tap reorder of a past order's items
- **Addresses & Profile**: multiple labeled addresses (Home/Work/Other), add/delete, default address selection at checkout
- **OTP login**: phone-based OTP login/signup flow (shows the OTP on-screen in dev mode when Twilio isn't configured)
- **Email notifications**: welcome email on signup, order confirmation email, order status update emails — sent via real SMTP if configured, otherwise logged to the console so the flow still completes in local dev
- **AI nutrition assistant**: BMI/BMR/TDEE calculator, AI meal recommendations, AI chat — works out of the box in a rule-based fallback mode, or plug in `OPENAI_API_KEY` for full AI responses
- **Admin tools**: dashboard stats, user activation/deactivation, chef KYC verification, order monitoring, coupon creation
- Real-time order status + delivery notifications via Socket.IO
- JWT auth (access + refresh tokens), role-based access control (customer, chef, delivery, admin, superadmin)

## What's not included (scope note)

This is a solid **MVP-grade scaffold**, not the full 50+ feature enterprise spec (native mobile app, delivery-partner app, push notifications, subscriptions, multi-language, dark mode, live GPS map tracking, etc.). The architecture (clean folder structure, role-based APIs, reusable components) is built to extend into those features incrementally.

## Configuring real integrations

- **Email**: set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in `backend/.env` (e.g. Gmail app password or any SMTP provider)
- **Payments**: set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `backend/.env` to enable real Razorpay checkout
- **SMS OTP**: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` (currently OTPs are generated and shown in dev mode — wire up the Twilio send call in `authController.js`'s `sendOtp` to go live)
- **AI**: set `OPENAI_API_KEY` for real AI-generated meal recommendations and chat responses
