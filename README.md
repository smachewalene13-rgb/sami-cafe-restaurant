# Sami Cafe and Restaurant - Web Application

A full-stack, real-time web application built for **Sami Cafe and Restaurant** (Addis Ababa, Ethiopia). Designed according to the complete 24-page system blueprint specification.

---

## 🌟 Highlights & Features

- **Warm Ethiopian Hospitality & Branding**:
  - Custom design tokens: `coffee` (rich roast hues), `leaf` (Ethiopian highland greens), and `cream`.
  - Elegant typography using **Playfair Display** (headings) and **Inter** (interface).
  - Traditional Jebena coffee ceremony feature, fasting (Tsom) dietary filters, and prices in **Ethiopian Birr (ETB)**.
- **Customer Storefront**:
  - Full catalog browsing across 7 categories: Breakfast, Coffee & Tea, Fresh Juices, Main Dishes, Fasting Food (Tsom), Pizza & Pasta, Desserts.
  - Interactive item details modal with prep time, nutritional notes, and user reviews.
  - Slide-over cart drawer with persistent state across reloads.
  - Checkout supporting **Dine-In**, **Takeaway**, and **Delivery** across Addis Ababa.
  - Interactive table booking engine with real-time overlap availability check.
  - Live order tracking stepper with **Socket.IO** updates: `Pending` → `Confirmed` → `Preparing` → `Ready` → `Completed`.
- **Operational Staff Tools**:
  - **Kitchen Display System (KDS)**: Live kitchen queue with timers and 1-click status transitions.
  - **Waiter Order Desk (POS)**: Floor table selection, dish selector, and instant ticket dispatch.
  - **Floor & Table View**: Live interactive seating map with `Free`, `Occupied`, `Reserved`, and `Cleaning` states.
  - **Cashier & Billing Desk**: Bill settlement, split-bill calculator, 15% VAT calculation, and printable receipt.
- **Admin & Manager Control Hub**:
  - Executive KPIs: Today's revenue, order counts, active tables, upcoming bookings, and low-stock alerts.
  - **Recharts** analytics: 7-day revenue trend chart and bestselling dish volume.
  - Full CRUD for Menu items, Categories, Physical Tables, and Promo Codes.
  - Pantry inventory tracking with automated low-stock warnings and restock logging.
  - Staff user management with role assignments and access suspension.
  - Financial reports with 1-click CSV export.

---

## 🏗️ Architecture & Technology Stack

| Area | Technology | Purpose |
| :--- | :--- | :--- |
| **Front End** | React 18 + Vite | Fast Single Page Application (SPA) |
| **Styling** | Tailwind CSS 3 | Responsive mobile-first utility design |
| **Icons** | Lucide React | Clean, lightweight iconography |
| **State** | Zustand + LocalStorage | Persisted cart and user authentication |
| **Charts** | Recharts | Revenue trends and bestselling charts |
| **Back End** | Node.js 20+ / Express.js 4 | RESTful API server |
| **Database** | PostgreSQL 15+ | Relational schema with normalized 3NF tables |
| **Real-time** | Socket.IO | Instant order & table status synchronization |
| **Auth** | JWT + BcryptJS | Secure session tokens and password hashing |

---

## 🔑 Pre-Seeded Accounts (Password: `password123`)

For testing and demonstration, pre-configured accounts with instant 1-click demo login buttons are provided on the login page:

| Role | Email | Password | Primary Functions |
| :--- | :--- | :--- | :--- |
| **Admin / Owner** | `admin@samicafe.com` | `password123` | Full system control, reports, inventory, users, settings |
| **Manager** | `manager@samicafe.com` | `password123` | Operations, orders, kitchen flow, reservations, stock |
| **Kitchen Chef** | `kitchen@samicafe.com` | `password123` | Live Kitchen Display System (KDS), cooking queue |
| **Floor Waiter** | `waiter@samicafe.com` | `password123` | Floor table status, Waiter Order Desk POS |
| **Cashier** | `cashier@samicafe.com` | `password123` | Billing, split bills, receipts, cash/card payment |
| **Customer** | `customer@samicafe.com` | `password123` | Browse menu, order food, track live, reserve tables |

---

## 🚀 Quick Start Guide

### 1. Database Setup (PostgreSQL)

Ensure PostgreSQL 15+ is running locally. The database `sami_cafe` is already configured with schema and seed data.

If setting up on a fresh machine:
```bash
# In PostgreSQL CLI:
psql -U postgres
CREATE DATABASE sami_cafe;
\c sami_cafe
\i server/src/db/schema.sql
\i server/src/db/seeds/seed.sql
```

### 2. Start Backend Server

```bash
cd server
npm install
npm run dev
# Server runs at http://localhost:5000 (API at http://localhost:5000/api/v1)
```

### 3. Start Frontend Client

```bash
cd client
npm install
npm run dev
# Client runs at http://localhost:5173
```

---

## 📁 Repository Structure

```
sami-cafe-restaurant/
|-- client/               # React (Vite) + Tailwind CSS application
|   |-- src/
|   |   |-- api/          # Axios HTTP clients for all endpoints
|   |   |-- components/   # Common buttons, modals, navbar, menu cards, cart
|   |   |-- layouts/      # PublicLayout & DashboardLayout
|   |   |-- pages/        # Public, Customer, Staff POS, Admin pages
|   |   |-- store/        # Zustand authStore and cartStore
|   |   `-- utils/        # ETB Currency and date formatters
|-- server/               # Node.js + Express + PostgreSQL REST API
|   |-- src/
|   |   |-- config/       # PostgreSQL connection pool & env
|   |   |-- controllers/  # Auth, Menu, Order, Reservation, Table, Inventory, Reports
|   |   |-- db/           # Schema definitions and rich seed data
|   |   |-- middleware/   # JWT auth, role authorization, rate limiter, upload
|   |   |-- routes/       # Express v1 routers
|   |   |-- services/     # Order transaction service & availability queries
|   |   `-- sockets/      # Socket.IO real-time events
|-- docs/                 # ERD diagrams and Postman API collection
|-- docker-compose.yml    # Full Docker container orchestration
`-- README.md
```

---

© 2026 Sami Cafe and Restaurant. Bole Medhanialem, Addis Ababa, Ethiopia.
