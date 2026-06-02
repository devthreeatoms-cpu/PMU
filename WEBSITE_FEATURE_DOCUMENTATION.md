# Ecommerce Website - Feature Documentation

## 1) Project Overview
This ecommerce platform is designed for modern online selling with a complete customer storefront, secure checkout experience, account management, and a full admin control panel for business operations, marketing, and analytics.

## 2) Customer-Facing Features

### A. Storefront & Navigation
- Premium homepage with hero banners, featured products, category collections, gallery sections, and trust highlights.
- Dynamic homepage content managed from admin without code changes.
- Fully responsive navigation for desktop and mobile.
- Dynamic announcement strip for active promotions and offers.
- Category-first browsing architecture.

### B. Product Catalog
- SEO-friendly server-rendered product listing pages.
- Product filtering by:
  - Category
  - In-stock availability
  - Price range
- Product sorting by:
  - Alphabetical (A-Z / Z-A)
  - Price (Low-High / High-Low)
- Pagination for large catalogs.
- Curated category sampling / collection spotlight mode.

### C. Product Detail Experience
- Multi-image product gallery with thumbnail selection and swipe support.
- Variant-based products (size/color/type/options) with variant-level pricing and stock handling.
- Real-time stock state (in stock / sold out).
- Quantity selector and add-to-cart flow.
- Recommended products section for cross-sell.

### D. Cart & Checkout
- Slide-out cart drawer with:
  - Quantity update
  - Item removal
  - Live subtotal
- Persistent cart synced to user profile.
- Login-protected checkout with return URL support.
- Multi-step checkout (shipping details -> review & payment).
- Coupon validation and discount application.
- Tax and convenience/handling fee calculations per product.
- Payment gateway integration (Razorpay currently; extendable to others).
- Payment signature verification for security.
- Auto order creation and status updates.
- Post-payment confirmation screen.
- Downloadable invoice (PDF generation).

### E. User Accounts
- Email/password registration and login.
- Google sign-in support.
- Password reset flow.
- Session management using secure cookies.
- User profile dashboard with:
  - Order history
  - Order status tracking
  - Default shipping address management
  - Account logout

### F. Reviews & Social Proof
- Product ratings and written reviews.
- Verified purchase badge logic.
- Review moderation workflow (admin approval).
- Customer photo uploads for reviews.
- Helpful votes on reviews.
- Admin replies visible under published reviews.

### G. Utility & Trust Pages
- About page
- Contact page and contact form
- Affiliate page
- Privacy policy
- Terms & conditions
- Shipping policy
- Return policy
- Disclaimer

## 3) Admin Panel Features

### A. Access, Roles & Permissions
- Admin login (including Google auth support).
- Role-based access control (RBAC).
- Module-level permissions (view/create/edit/delete).
- User role management (customer/admin/staff patterns supported).

### B. Dashboard & Operations
- Live dashboard with period filters (today, 7d, 30d, 90d, 12m, all-time).
- KPI monitoring (orders, users, revenue, stock alerts, activity feed).
- CSV export for dashboard data.

### C. Catalog Management
- Full product CRUD.
- Product active/inactive status toggles.
- Product variant and option management.
- Category management (create/delete categories).
- Real-time product list sync via database listeners.

### D. Order Management
- Order listing with status tabs and search.
- Update order status lifecycle:
  - pending, paid, processing, shipped, delivered, cancelled, refunded
- Order detail views.
- Manual order creation workflow UI.
- Order CSV export.
- Order deletion control (permission-gated).

### E. Coupon & Promotion Engine
- Coupon CRUD.
- Coupon types:
  - Percentage
  - Flat amount
  - Free shipping mode support
- Coupon controls:
  - Active/inactive
  - Expiry date
  - Usage limit
  - Minimum order value
- Active coupon propagation to storefront announcement bar.

### F. Content & Merchandising
- Homepage hero manager.
- Banner manager (create/update/delete/reorder).
- Results/media/content manager with ordering controls.
- Shop-all design/settings controls (card style/grid settings).

### G. Reviews Moderation
- Pending/approved review management.
- Approve/reject/delete reviews.
- Add manual reviews.
- Reply to customer reviews.
- Helpful count tracking.

### H. User Management
- Full user directory with search.
- Register users from admin.
- Role updates.
- Permission matrix editor.
- User data export (CSV).

### I. Notifications & Campaigns
- Admin notifications center with read/unread management.
- Campaign panel for promotional outreach (sale and flash campaign actions).

### J. Advanced Analytics
- Revenue, AOV, and conversion metrics.
- Top products by revenue.
- Revenue by category.
- Order status distribution.
- City/geography performance breakdown.
- Coupon performance analytics.
- Event funnel analytics:
  - Product views
  - Add to cart
  - Checkout start
  - Checkout complete

## 4) Automation & System Behaviors
- Stock deduction on successful payment (including variant stock).
- Coupon usage counters increment automatically after successful orders.
- Order confirmation and invoice email triggers.
- Admin notifications generated for new paid orders.
- Event tracking API for customer behavior analytics.
- Periodic auto-refresh in dashboard views for live operations.

## 5) Technical Stack (High-Level)
- Frontend: Next.js 16 + React 19 + Tailwind CSS
- Backend/API: Next.js route handlers + server actions
- Database/Auth/Storage: Firebase (Firestore, Firebase Auth, Storage)
- Payments: Razorpay
- Emails: Resend-based email flows
- State management: Zustand (cart)
- Charts/BI UI: Recharts
