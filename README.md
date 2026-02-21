# 🚛 FleetFlow Logistics System

**FleetFlow** is a modern, enterprise-grade Fleet & Logistics Management System designed for efficiency, safety, and data-driven decision-making. Featuring a premium glassmorphic UI and a robust modular backend, it empowers logistics managers to oversee their entire fleet lifecycle in real-time.

---

## ✨ Key Features

### 🖥️ Command Center (Intelligent Dashboard)
- **Role-Based Views:** Tailored KPI dashboards for Managers, Dispatchers, Safety Officers, and Analysts.
- **Real-time Metrics:** Track Active Fleet, Utilization Rate, Maintenance Alerts, and Pending Cargo.
- **Financial Analytics:** Monitor ROI, Fuel Efficiency, and Operational Costs at a glance.

### 🚛 Asset & Personnel Management
- **Vehicle Registry:** Complete lifecycle tracking (Acquisition Cost, Odometer, Maintenance Status).
- **Driver Profiles:** Manage certified personnel with Safety Scores, Compliance IDs, and License Expiry monitoring.
- **Dynamic Status:** Automatic status transitions (e.g., Driver becomes "ON DUTY" when a trip is dispatched).

### 📍 Trip & Logic Dispatcher
- **Validated Dispatching:** Ensure cargo weight stays within vehicle capacity and driver licenses are valid.
- **Operational Workflow:** Lifecycle management from Draft → Dispatched → Completed.
- **Maintenance Logs:** Track service history, technician notes, and repair costs.

---

## 🛠️ Technical Stack

- **Frontend:**
  - [React](https://reactjs.org/) (Vite)
  - [Framer Motion](https://www.framer.com/motion/) (Premium Micro-animations)
  - [Lucide React](https://lucide.dev/) (Iconography)
  - [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) (Glassmorphic Design System)
- **Backend:**
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
  - [Prisma ORM](https://www.prisma.io/) (PostgreSQL)
  - [JWT](https://jwt.io/) (Secure Authentication)
- **Design:** Modern Glassmorphism with Dark/Light theme support.

---

## 🏗️ Architecture & Roles

The system implements a strict **Role-Based Access Control (RBAC)** matrix:

| Role | Core Focus | Permissions |
| :--- | :--- | :--- |
| **Manager** | Strategic Overview | Full access to all modules and system settings. |
| **Dispatcher** | Operations | Manage trips, assign drivers, and handle available assets. |
| **Safety Officer** | Compliance | Monitor driver scores, license expiry, and vehicle health. |
| **Analyst** | ROI & Finance | Deep dive into expenses, revenue trends, and efficiency KPIs. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL Database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RadadiyaBrij/odoo-FleetFlow-2026.git
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Configure .env with DATABASE_URL
   npx prisma db push
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📁 Directory Structure

- `backend/src/services`: Core business logic & KPI calculation engines.
- `backend/src/routes`: Express API endpoints (Modular structure).
- `frontend/src/pages`: Interactive React views using the FleetFlow design system.
- `frontend/src/context`: Authentication and Theme state management.
- `resources`: Project documentation and requirement specs.

---

