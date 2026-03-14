# CoreInventory — Warehouse Management System

A full-stack inventory management system built for the **Indus Hackathon 2026**. Manage warehouses, locations, products, receipts, deliveries, internal transfers and stock adjustments — all in one place.

---

## Table of Contents

- [Overview](#overview)
- [Demo](#demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Team Members](#team-members)
- [Getting Started](#getting-started)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Seed Demo Data](#seed-demo-data)
- [API Documentation](#api-documentation)
- [Inventory Flow](#inventory-flow)
- [Pages & Routes](#pages--routes)
- [Database Models](#database-models)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

CoreInventory is a modern warehouse management system that tracks every stock movement through a complete ledger trail. It supports multi-warehouse operations, real-time low stock alerts, and a clean dashboard showing all inventory KPIs at a glance.

---

## Demo

### 🎬 Video Walkthrough
[![Watch Demo Video](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)]([https://your-video-link-here](https://drive.google.com/file/d/145mq6nVT3s3YekjPhct1HzRpkRWNXeIz/view?usp=sharing))

### 📊 Presentation
[![View PPT](https://img.shields.io/badge/View-Presentation-orange?style=for-the-badge&logo=microsoftpowerpoint)]([https://your-ppt-link-here](https://drive.google.com/file/d/1vHqwbY70CDkhI6gIJM-EDF3a8nNmXxgB/view?usp=drive_link))

---

### 📸 Screenshots

> **Dashboard — KPIs & Low Stock Alerts**
<!-- Add screenshot here: ![Dashboard](screenshots/dashboard.png) -->
![Dashboard](https://github.com/rdvraval19/odoo_indus_prognosis/blob/f3f66f99af182d7cd3ecf2a17cfa864ac53e1d37/readme_images/Screenshot%202026-03-14%20105012.png)

> **Products — Catalogue with Real-Time Stock Levels**
<!-- Add screenshot here: ![Products](screenshots/products.png) -->

> **Receipts — Incoming Goods Management**
<!-- Add screenshot here: ![Receipts](screenshots/receipts.png) -->

> **Deliveries — Outgoing Goods with Stock Validation**
<!-- Add screenshot here: ![Deliveries](screenshots/deliveries.png) -->

> **Move History — Full Ledger Audit Trail**
<!-- Add screenshot here: ![Move History](screenshots/move-history.png) -->

> **Settings — Warehouse & Location Management**
<!-- Add screenshot here: ![Settings](screenshots/settings.png) -->

> ℹ️ To add screenshots, place your image files in a `screenshots/` folder and uncomment the lines above.

---

## Features

### Core Inventory Flow
- **Receipts** — Record incoming goods from suppliers. Validate to increase stock automatically.
- **Deliveries** — Record outgoing goods to customers. Validates stock availability before deducting.
- **Internal Transfers** — Move stock between locations within warehouses. Total quantity unchanged.
- **Stock Adjustments** — Correct system stock after a physical count. Supports positive and negative deltas.

### Warehouse Management
- Multi-warehouse support with named short codes
- Locations grouped under each warehouse
- Full CRUD for warehouses and locations

### Dashboard
- Live KPI cards — total products, receipts, deliveries, low stock count
- Receipts and deliveries breakdown by status (Draft / Waiting / Done)
- Internal transfer schedule — recent movements with from/to locations
- Low stock alerts panel with OUT badge for zero-stock products

### Products
- Product catalogue with SKU, category, UOM, unit cost
- Real-time stock level calculated from ledger
- Low stock threshold per product
- SKU search and smart filters (category, stock status)

### Move History (Ledger)
- Complete audit trail of every stock movement
- Colour-coded entry types — Receipt, Delivery, Transfer, Adjustment
- Filter by type, search by product or reference
- Sorted newest first

### Other
- JWT authentication with role-based access (Manager / Staff)
- Print receipt functionality with professional PDF layout
- Low stock banner visible across all pages
- Fully responsive UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI, SQLAlchemy, SQLite |
| Auth | JWT (python-jose), bcrypt (passlib) |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| HTTP Client | Axios |
| Icons | Lucide React |
| Routing | React Router DOM v6 |
| Deployment | Railway |

---

## Project Structure

```
odoo_indus_prognosis/
│
├── backend/
│   ├── main.py          # FastAPI app, CORS, route registration
│   ├── database.py      # SQLAlchemy engine and session
│   ├── models.py        # All database models
│   ├── seed.py          # Demo data seeder
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance with JWT interceptor
    │   ├── components/
    │   │   └── LowStockBanner.jsx # Persistent low stock alert bar
    │   ├── context/
    │   │   └── AuthContext.jsx    # JWT token + role state
    │   ├── layouts/
    │   │   └── MainLayout.jsx     # Navbar + banner + page slot
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Receipt.jsx
    │   │   ├── Deliveries.jsx
    │   │   ├── Transfer.jsx
    │   │   ├── Adjustment.jsx
    │   │   ├── MoveHistory.jsx
    │   │   ├── Products.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   └── settings/
    │   │       ├── Settings.jsx
    │   │       ├── WarehouseSettings.jsx
    │   │       └── LocationSettings.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## Team Members

| Member | Role | Responsibilities | LinkedIn |
|---|---|---|---|
| Dipak Raval | Backend | Database models, Auth API, Products API, Stock ops APIs, Ledger, Stats | [![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?logo=linkedin&logoColor=white)](https://linkedin.com/in/rdvraval19) |
| Rahul Khara | Frontend — Shell | React scaffold, Login, Navbar, Layout, Dashboard, Products page | [![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?logo=linkedin&logoColor=white)](https://linkedin.com/in/your-link-here) |
| Simran Patra | Frontend — Operations | Receipts, Deliveries, Move History pages | [![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?logo=linkedin&logoColor=white)]([https://linkedin.com/in/your-link-here](https://www.linkedin.com/in/simran-patra)) |
| Prachi Parmar | Frontend — Settings | Settings, Transfer, Adjustment, Seed data | [![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?logo=linkedin&logoColor=white)]([https://linkedin.com/in/your-link-here](https://www.linkedin.com/in/prachiparmar737)) |

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- pip
- npm

### Clone the repository

```bash
git clone https://github.com/YOUR_TEAM/odoo_indus_prognosis.git
cd odoo_indus_prognosis
```

---

## Running the Backend

```bash
# Go into the backend folder
cd backend

# Install Python dependencies
pip install fastapi uvicorn sqlalchemy python-jose passlib[bcrypt] requests python-multipart

# Start the server
uvicorn main:app --reload
```

The backend runs at: `http://localhost:8000`

Swagger UI (API docs): `http://localhost:8000/docs`

---

## Running the Frontend

Open a **second terminal**:

```bash
# Go into the frontend folder
cd frontend

# Install npm packages
npm install

# Start the dev server
npm run dev
```

The frontend runs at: `http://localhost:5173`

> Both servers must be running at the same time for the app to work.

---

## Seed Demo Data

After both servers are running, populate the database with demo data:

```bash
cd backend
python seed.py
```

This creates:

| Data | Count |
|---|---|
| Warehouses | 2 (Main Warehouse, Cold Storage) |
| Locations | 4 (Rack A, Rack B, Cold Zone 1, Cold Zone 2) |
| Products | 10 (2 intentionally low-stock: Butter, Cheese) |
| Receipts | 3 (created and validated) |
| Deliveries | 2 (created and validated) |
| Transfers | 1 (Rice: Rack A → Rack B) |
| Adjustments | 1 (Rice: -3 correction) |

**Demo login credentials:**
```
Email:    admin@demo.com
Password: demo1234
```

> Run seed.py only once per database. To re-seed, delete `backend/prod.db` and restart the server first.

---

## API Documentation

Full interactive docs available at `http://localhost:8000/docs` when the backend is running.

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Create new user account |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/products` | List all products with current stock |
| POST | `/receipts` | Create a new receipt |
| POST | `/receipts/{id}/validate` | Validate receipt — stock increases |
| POST | `/deliveries` | Create a new delivery |
| POST | `/deliveries/{id}/validate` | Validate delivery — stock decreases |
| POST | `/transfers` | Create internal transfer |
| POST | `/adjustments` | Create stock adjustment |
| GET | `/ledger` | Full stock movement history |
| GET | `/stats` | Dashboard KPIs and low stock list |
| GET | `/warehouses` | List all warehouses |
| GET | `/locations` | List all locations |

---

## Inventory Flow

```
Step 1 — Receipt
  Goods arrive from supplier
  POST /receipts → POST /receipts/{id}/validate
  Result: stock INCREASES by received qty
  Ledger: type = receipt, qty_delta = +qty

Step 2 — Internal Transfer
  Move stock between locations
  POST /transfers
  Result: total stock UNCHANGED, location changes
  Ledger: two rows — source -qty, destination +qty

Step 3 — Delivery
  Goods leave to customer
  POST /deliveries → POST /deliveries/{id}/validate
  Result: stock DECREASES by delivered qty
  Ledger: type = delivery, qty_delta = -qty

Step 4 — Adjustment
  Correct stock after physical count
  POST /adjustments
  Result: stock corrected by ± delta
  Ledger: type = adjustment, qty_delta = ± delta
```

Every action writes to the **StockLedger** table — the Move History page shows the complete audit trail.

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/login` | Login | JWT login form |
| `/` | Dashboard | KPIs, transfer schedule, low stock alerts |
| `/products` | Products | Product catalogue with stock levels |
| `/receipts` | Receipts | Incoming goods — create and validate |
| `/deliveries` | Deliveries | Outgoing goods — validate with stock check |
| `/transfer` | Transfer | Move stock between locations |
| `/adjustment` | Adjustment | Correct stock after physical count |
| `/move-history` | Move History | Full ledger audit trail |
| `/settings` | Settings | Settings home |
| `/settings/warehouses` | Warehouse Settings | Manage warehouses |
| `/settings/locations` | Location Settings | Manage locations grouped by warehouse |

---

## Database Models

| Model | Description |
|---|---|
| User | Auth — email, hashed password, role (manager/staff) |
| Warehouse | name, short_code, address |
| Location | name, short_code, warehouse_id (FK) |
| Product | name, SKU, category, UOM, unit cost, low_stock_threshold |
| Receipt | reference, supplier, status, lines |
| ReceiptLine | receipt_id, product_id, qty, unit_price |
| Delivery | reference, customer, status, lines |
| DeliveryLine | delivery_id, product_id, qty |
| StockLedger | product_id, from_location, to_location, qty_delta, type, ref_id, timestamp, user_id |

> Stock is never stored directly on the Product — it is always calculated as `SUM(qty_delta)` from the StockLedger. This ensures a complete and tamper-evident audit trail.

---

## Environment Variables

### Frontend — `frontend/.env`

```
VITE_API_URL=http://localhost:8000
```

### Backend — Railway Dashboard Variables

```
DATABASE_URL=sqlite:///./prod.db
SECRET_KEY=your-long-random-secret-key
```

---

## Deployment

The app is deployed on **Railway**. Push to the main branch to trigger automatic deployment.

- Backend service: set `DATABASE_URL` and `SECRET_KEY` in Railway dashboard
- Frontend service: set `VITE_API_URL` pointing to the deployed backend URL

---

## License

Built for **Indus Hackathon 2026**. All rights reserved.
