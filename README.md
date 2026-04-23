# LilCake Commerce System

Launch a customizable e-commerce system with storefront, admin, payments, coupons, and operations in one production-ready base. 🚀

LilCake is not just a store theme. It is a complete, customizable commerce system designed to be adapted to different businesses, catalogs, and operational flows without rebuilding the core from scratch.

[Live Demo](https://lilcake.vercel.app/) · [Versión en Español](./README.es.md) · [Technical Docs](./README.dev.md) · [Guía Técnica en Español](./README.dev.es.md)

## What is this?

LilCake Commerce System is a full e-commerce platform built to help brands launch, manage, and scale online sales with a real operational backbone behind the storefront.

It combines customer-facing shopping flows with an internal admin system, order management, discount controls, transactional emails, reporting, and production-oriented backend validation. The visual identity can be customized for different businesses, while the system logic stays solid and reusable.

The current demo uses a fashion/streetwear brand, but the product is meant to be re-skinned and adapted to many different business models.

## Features

- 🛍️ Storefront ready to sell with catalog, product pages, cart, search, and checkout flow
- 🔐 Flexible authentication with email/password and Google sign-in
- 💳 Real checkout experience with Stripe plus order-safe backend validation
- 📦 Complete order lifecycle with payment states, shipment tracking, and customer visibility
- 🎟️ Advanced coupon engine with global limits, per-customer limits, and admin control
- 🧾 Excel and PDF exports for sales, orders, and customer data
- 📬 Transactional emails for verification, password recovery, purchase updates, and shipping notifications
- 🔎 Dynamic search in both the storefront and the admin panel
- 🧠 Backend-first security logic so prices, discounts, and checkout totals are not trusted from the browser
- ⚙️ Admin panel to manage products, customers, coupons, orders, and business operations

## Live Demo

Explore the live system here:

👉 [https://lilcake.vercel.app/](https://lilcake.vercel.app/)

If you are evaluating the product for a brand, a client project, or a custom commerce build, start with the live storefront and then explore the admin sandbox to see how the system behaves end to end.

## ⚠️ Demo Information

- This public deployment is a demonstration environment.
- Products, customers, orders, and business activity shown in the demo are sample data.
- The goal is to show the system capabilities, navigation, and operational flow.
- Some actions may be simulated or reset as part of the demo experience.
- The demo should be used to evaluate features, not as a real commercial environment.

## 🔒 Admin Demo

A safe admin sandbox is available at:

👉 [https://lilcake.vercel.app/admin-demo](https://lilcake.vercel.app/admin-demo)

- It exposes the admin experience without requiring access to the real admin panel.
- It is isolated from production operations and does not write to the real business data.
- Create, edit, delete, and export actions are simulated to demonstrate the workflow.
- A visible demo banner makes it clear that nothing is permanently stored.
- The real admin remains protected with role-based access, secured sessions, protected write APIs, rate limits, and backend validation.

## Screenshots

### Home Experience
![Home experience](./screenshots/home.png)

### Product Detail
![Product detail](./screenshots/producto2.png)

### Checkout Flow
![Checkout flow](./screenshots/carrito.png)

### Admin Dashboard
![Admin dashboard](./screenshots/Captura%20de%20pantalla%202026-04-22%20191149.png)

### Orders Management
![Orders management](./screenshots/Captura%20de%20pantalla%202026-04-22%20191221.png)

### Coupons Engine
![Coupons engine](./screenshots/Captura%20de%20pantalla%202026-04-22%20191238.png)

## Use Cases

- Fashion brands that want a polished online store with a serious operational backend
- Boutique retailers that need catalog control, secure checkout, and order traceability
- Businesses that run promotions and need coupon rules that do not break margins
- Teams that need admin visibility over customers, orders, shipping, and exports
- Agencies or developers who want a customizable commerce base for multiple clients
- Brands that want to launch fast without starting the entire commerce architecture from zero

## Tech Stack

- Next.js
- React
- PostgreSQL
- Supabase
- Prisma
- NextAuth
- Stripe
- Vercel

## Getting Started

Keep it simple:

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Configure your environment variables.
4. Run the app with `npm run dev`.

If you want the full technical setup, database notes, deployment details, and production configuration, go to [README.dev.md](./README.dev.md).

## Why this project?

Most commerce repos look good on the surface but fall apart in the real business layer.

LilCake stands out because it already includes the parts that usually get skipped:

- real backend validation for checkout, discounts, and pricing
- an admin panel that actually helps operate the business
- coupon rules designed to protect revenue, not just display a promo field
- reporting exports that are useful for operations, accounting, and daily control
- production-oriented architecture with PostgreSQL, email flows, auth, and deployment already in place

In short: this is a customizable commerce system with storefront, operations, and business control in one product-ready base. ✨

## License

This repository is currently private and does not include an open-source license.

If you want to use, customize, or commercialize the system for a business, licensing and implementation terms should be defined separately.
