# Connected Care / Hospital Admin Portal

This repository contains the complete full-stack enterprise application for the **Connected Care Admin Portal**, separated cleanly into dedicated `frontend` and `backend` directories.

---

## 📁 Repository Structure

```text
ConnectCare/
│
├── frontend/                     <-- React 19 Frontend Codebase
│   ├── src/
│   │   ├── app/                  <-- App Shell, Layouts, Router & Providers
│   │   ├── components/           <-- Shared UI & Common Components
│   │   ├── features/             <-- Feature Modules (Dashboard, Patients, Doctors, Care Teams, etc.)
│   │   ├── store/                <-- Redux Toolkit State Management
│   │   └── styles/               <-- Tailwind CSS Global Styling
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
└── backend/                      <-- ASP.NET Core Web API Clean Architecture
    ├── ConnectedCare.slnx        <-- .NET Solution File
    └── src/
        ├── ConnectedCare.Domain/         <-- Core Entities, Enums & Interfaces
        ├── ConnectedCare.Application/    <-- CQRS / Use Cases & DTOs
        ├── ConnectedCare.Infrastructure/ <-- EF Core DbContext, PostgreSQL & Seeder
        └── ConnectedCare.Api/            <-- REST Controllers, Middleware & Swagger
```

---

## 🚀 Running the Applications

### 1. React Frontend Application (`frontend/`)

```bash
cd frontend
npm install
npm run dev
```

- **Frontend URL**: [http://localhost:5173/](http://localhost:5173/)

---

### 2. ASP.NET Core Web API Backend (`backend/`)

```bash
cd backend
dotnet run --project src/ConnectedCare.Api/ConnectedCare.Api.csproj --launch-profile http
```

- **Backend API URL**: [http://localhost:5231/](http://localhost:5231/)
- **Swagger Documentation**: [http://localhost:5231/swagger](http://localhost:5231/swagger)

---

## 🛠️ Technology Stack Summary

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Redux Toolkit, TanStack Query, React Router, Recharts, Lucide Icons, React Hook Form, Zod.
- **Backend**: C#, .NET Web API, Clean Architecture, Entity Framework Core, Npgsql PostgreSQL Provider, Swashbuckle Swagger, Serilog, FluentValidation.
