# 🚀 FleetFlow System

Modular Fleet & Logistics Management System built with Node.js, Express, Prisma, and React.

## 🏗️ Architecture

- **Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL.
- **Frontend:** React 18, Vite, Framer Motion, Lucide Icons.
- **Database:** PostgreSQL (Relation structure for Vehicles, Drivers, Trips, etc.)

## 🚀 Getting Started

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fleetflow?schema=public"
   ```
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## 🛠️ Features

- **Command Center:** Real-time KPI tracking (Active Fleet, Utilization, Maintenance).
- **Vehicle Registry:** Complete lifecycle management for fleet assets.
- **Trip Dispatcher:** Validated trip creation (Weight capacity, license expiry).
- **Driver Profiles:** Safety scores and compliance monitoring.
- **Real-time Logic:** Automatic vehicle status updates based on trip/maintenance activity.

## 📁 Structure

- `/backend/src/services`: Core business logic (Validation, KPI calculations).
- `/backend/src/routes`: RESTful API endpoints.
- `/frontend/src/pages`: Interactive UI views with premium dark theme.
- `/resources`: Requirement documents and design mockups.