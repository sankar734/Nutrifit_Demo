# NutriChef Backend

Node.js + Express + MongoDB backend for the NutriChef healthy food delivery platform.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in your MongoDB URI, JWT secrets, API keys
npm run seed            # optional: creates demo chef/customer/admin + sample foods
npm run dev              # starts on http://localhost:5000
```

## Demo logins (after `npm run seed`)

| Role     | Login                       | Password    |
|----------|-----------------------------|-------------|
| Admin    | srihariram2005@gmail.com    | password123 |
| Chef     | sankar73051862@gmail.com    | password123 |
| Delivery | sankarnaga005@gmail.com     | password123 |
| Customer | customer@nutrichef.demo     | password123 |

## Key API groups

- `/api/auth` — register, login, phone OTP, refresh, logout
- `/api/users` — profile, addresses, wishlist, favorite chefs
- `/api/chefs` — chef registration, nearby chefs, chef dashboard
- `/api/foods` — CRUD + search/filter/sort
- `/api/cart` — cart management
- `/api/orders` — place order, track order, chef order management
- `/api/reviews` — ratings & reviews
- `/api/wallet` — wallet balance & transactions
- `/api/ai` — BMI/BMR/TDEE calculator, AI meal recommendation, AI chat assistant
- `/api/admin` — dashboard stats, user/chef/order management, coupons

## Notes

- AI features work in a rule-based fallback mode if `OPENAI_API_KEY` is not set, so the app is usable out of the box.
- Razorpay/Twilio/Cloudinary integrations are wired up as configuration slots — plug in real keys in `.env` to activate them.
- Socket.IO is used for real-time order status updates and delivery partner GPS tracking (see `src/sockets/index.js`).
