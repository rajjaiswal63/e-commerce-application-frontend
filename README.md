# Full-Stack E-Commerce Application — Frontend

This repository contains the React/Vite web application for the full-stack e-commerce project.

**Start with the backend repository** to understand the API, security rules, database and payment flow. The backend is the primary project repository:

- **Primary backend:** https://github.com/rajjaiswal63/full-stack-e-commerce-application
- **This frontend:** https://github.com/rajjaiswal63/e-commerce-application-frontend

The frontend depends on the Spring Boot API from the backend repository. Start and configure the backend before testing login, cart, checkout, orders or admin/seller screens.

## What the frontend includes

- Store home page and product catalog with search, category filters and pagination.
- Product details and shopping cart.
- Customer registration, sign-in and sign-out screens.
- Address selection and checkout flow.
- Razorpay Standard Checkout and an order confirmation page.
- Customer order history with purchased products, quantities, totals and order statuses.
- Admin dashboard pages for products, categories, sellers and orders.
- Seller product/order screens subject to backend role and ownership checks.
- Responsive interface built from reusable React components and shared state.

## Technology

- React 19 and Vite
- React Router for navigation
- Redux Toolkit and React Redux for application state
- Axios for backend requests
- Material UI, Tailwind CSS and Emotion for UI styling
- React Hook Form for forms
- React Hot Toast, React Icons and Swiper for supporting UI
- Razorpay Standard Checkout script loaded by the browser; no Razorpay secret is included in the frontend

Dependencies are listed in package.json and package-lock.json.

## Run locally

### Requirements

- Node.js and npm compatible with the Vite version in package.json
- The backend repository running locally at http://localhost:8080
- A Razorpay public Key ID for online test checkout

### Install

From this repository directory:

    npm ci

Copy .env.example to .env if .env does not exist, then set the frontend values:

    VITE_BACK_END_URL=http://localhost:8080
    VITE_RAZORPAY_KEY_ID=rzp_test_your_public_key_id

VITE_BACK_END_URL is the backend origin only; the API client adds /api. VITE_RAZORPAY_KEY_ID is the public Razorpay Key ID. Never put RAZORPAY_KEY_SECRET in this frontend environment file.

The backend CORS setting FRONTEND_URL must match the actual frontend origin exactly. Vite uses http://localhost:5173 by default.

### Start the development server

    npm run dev

Open the URL printed by Vite, normally:

    http://localhost:5173

For a production build, run npm run build. To preview a build locally, run npm run preview.

## Routes and access

| Route | Purpose | Access |
|---|---|---|
| / | Home/storefront | Public |
| /products | Product catalog | Public |
| /about and /contact | Informational pages | Public |
| /cart | Shopping cart | Public UI; checkout requires sign-in |
| /login and /register | Customer authentication | Signed-out users |
| /checkout | Address, payment method and order summary | Signed-in users |
| /order-confirm | Razorpay confirmation and order result | Checkout flow |
| /profile/orders | Customer's orders, purchased items and status | Signed-in customer |
| /admin | Dashboard | ADMIN |
| /admin/products | Product management | ADMIN or SELLER, with backend ownership checks |
| /admin/categories | Category management | ADMIN |
| /admin/sellers | Seller management | ADMIN |
| /admin/orders | Order management | ADMIN or SELLER, with backend order rules |

## Source structure

- src/main.jsx mounts the React application and Redux store.
- src/App.jsx declares routes and access wrappers.
- src/api/api.js configures Axios with the backend URL and cookie credentials.
- src/store/actions contains async API operations and Redux actions.
- src/store/reducers contains authentication, product, cart, order, seller and error state.
- src/components/home and src/components/products implement the storefront and catalog.
- src/components/cart implements cart views and quantity changes.
- src/components/checkout implements addresses, payment, summary and callback confirmation.
- src/components/profile/MyOrders.jsx loads the signed-in customer's order history.
- src/components/admin contains dashboard, product, category, seller and order screens.
- src/utils contains helpers such as INR price formatting and image URL handling.

## Frontend-to-backend flow

1. A page or component dispatches an async action from src/store/actions.
2. The action uses the shared Axios client in src/api/api.js to call the backend's /api routes.
3. Public catalog requests do not require login. Protected calls send the HttpOnly authentication cookie.
4. The backend checks roles and ownership, applies business rules and persists changes.
5. The action dispatches the response into Redux; React renders the updated state.

### Razorpay checkout

1. The customer signs in, adds products, chooses an address and continues to payment.
2. The frontend requests a Razorpay order from the backend; the backend derives its amount from the stored cart.
3. Razorpay Checkout collects payment and returns a payment ID and signature.
4. The frontend sends the callback data to the backend confirmation endpoint.
5. The backend verifies the signature and captured payment before creating the order and clearing the cart.
6. The confirmation screen shows the order number and initial status. The customer can then open My Orders to review the ordered products and later status updates.

The backend is authoritative for payment verification, checkout totals, stock changes and order ownership. The frontend must not be given the Razorpay Key Secret.

## Related documentation

- [Primary backend repository — start here](https://github.com/rajjaiswal63/full-stack-e-commerce-application)
- [Backend API, environment configuration and class flow](https://github.com/rajjaiswal63/full-stack-e-commerce-application/blob/main/README.md)
- [Frontend repository](https://github.com/rajjaiswal63/e-commerce-application-frontend)