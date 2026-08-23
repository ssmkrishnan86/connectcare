# Connected Care / Hospital Admin Portal

An enterprise full-stack healthcare administration platform built with **ASP.NET Core Web API (Clean Architecture)** and **React 19 (TypeScript + Vite + Tailwind CSS)**.

---

## 📋 System Prerequisites

Ensure you have the following installed on your development machine:

* **.NET SDK 10.0+**: [Download .NET SDK](https://dotnet.microsoft.com/download)
* **Node.js 18+ & npm 9+**: [Download Node.js](https://nodejs.org/)
* **PostgreSQL 14+**: [Download PostgreSQL](https://www.postgresql.org/download/)

---

## 🚀 Team Quick-Start Guide

Follow these steps in order to configure and run the application on any team member's system:

### Step 1: Clone or Pull the Latest Code

```bash
git pull origin main
```

### Step 2: Configure Environment Variables

1. **Root & Backend Configuration**:
   Create or update your PostgreSQL database.
   ```sql
   CREATE DATABASE "ConnectCare";
   ```
   Copy `.env.example` to `.env` or verify `backend/src/ConnectedCare.Api/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Port=5432;Database=ConnectCare;Username=postgres;Password=your_password;"
     }
   }
   ```

2. **Frontend Configuration**:
   Copy `frontend/.env.example` to `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5231
   ```

---

### Step 3: Run the Backend API (Automatic Safe Database Setup)

The backend includes a non-destructive database initializer and idempotent seeder that creates all required tables and essential initial system configuration (roles, permissions, admin user, care units) without deleting or overwriting any existing patient or clinical data.

```bash
cd backend
dotnet run --project src/ConnectedCare.Api/ConnectedCare.Api.csproj --launch-profile http
```

* **API Base URL**: `http://localhost:5231`
* **Swagger API Docs**: `http://localhost:5231/swagger`

---

### Step 4: Run the React Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

* **Frontend App URL**: `http://localhost:5173`

---

### Step 5: Log In & Verify

* **Login URL**: `http://localhost:5173/login`
* **Default Admin Username**: `admin`
* **Default Admin Password**: `admin123`

---

## 📁 Repository Structure

```text
ConnectCare/
├── .env.example                      <-- Root Environment Variable Template
├── README.md                         <-- Team Onboarding & Project Documentation
│
├── frontend/                         <-- React 19 Frontend Codebase
│   ├── .env.example                  <-- Frontend Environment Variable Template
│   ├── src/
│   │   ├── app/                      <-- App Shell, Router & Providers
│   │   ├── components/               <-- Shared UI Components & Badges
│   │   ├── features/                 <-- Feature Modules (Patients, Doctors, Nurses, Care Teams, etc.)
│   │   ├── lib/                      <-- API Client, Auth Utilities, Localization Formatters
│   │   ├── store/                    <-- Redux Toolkit State Management
│   │   └── styles/                   <-- Global Tailwind CSS Styling
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
└── backend/                          <-- ASP.NET Core Web API Clean Architecture
    ├── ConnectedCare.slnx            <-- .NET Solution File
    └── src/
        ├── ConnectedCare.Domain/         <-- Core Entities, Enums & Interfaces
        ├── ConnectedCare.Application/    <-- CQRS / Use Cases & DTOs
        ├── ConnectedCare.Infrastructure/ <-- EF Core DbContext, PostgreSQL DDL, Safe Initializer & Idempotent Seeder
        └── ConnectedCare.Api/            <-- REST Controllers, Middleware, Auth & Swagger
```

---

## 🩺 System Standards & Localization

* **USA Localization**:
  * Date Formats: `MM/DD/YYYY` and 12-hour timestamps `hh:mm A`.
  * Currency: US Dollars (`$ USD`).
  * Phone Numbers: Standard US format `(xxx) xxx-xxxx`.
  * Addresses: US addresses (e.g., Austin, TX).
* **Data Integrity**:
  * All business data (patients, doctors, nurses, vital signs, medications, alerts, care teams, units) is fetched dynamically from the database through the API.
  * No placeholder or hardcoded third-party external images; dynamic DB avatars and initials badges are used throughout.
  * Database startups are strictly non-destructive and preserve all user records across server restarts.
