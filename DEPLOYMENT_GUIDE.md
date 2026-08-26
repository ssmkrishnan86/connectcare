# ConnectCare - Complete Cloud Production Deployment Guide

This guide describes how to deploy **both the application and the PostgreSQL database** directly into a standalone free cloud environment with a clean database and admin login.

---

## 🎯 1-Click Unified Cloud Deployment (Web App + Cloud Database)

Using the included ender.yaml Blueprint, Render automatically creates:
1. **Cloud PostgreSQL Database** (connectcare-db) on Render cloud servers.
2. **Cloud Web Application** (connectcare-app) running the unified ASP.NET Core API + React 19 Frontend.
3. Automatic database connection linking, automated schema creation, and default Admin initialization.

---

### Step-by-Step Deployment:

1. Go to **[Render.com](https://render.com)** and log in with your GitHub account.
2. Click **New +** (top right) → Select **Blueprint**.
3. Select the repository: **ssmkrishnan86/connectcare**.
4. Render will detect ender.yaml and display:
   - **Service**: connectcare-app (Web Service - Free Docker container)
   - **Database**: connectcare-db (PostgreSQL - Free Cloud Database)
5. Click **Apply**.

Render will automatically provision the PostgreSQL database in the cloud and deploy the web application.

---

## 🌐 Live Cloud Production URLs

Once the build finishes (~2 to 3 minutes):
* **Web Portal URL**: https://connectcare-app.onrender.com
* **Swagger API Docs**: https://connectcare-app.onrender.com/swagger

---

## 🔑 Login Credentials & Clean Database Guarantee

* **Admin Username**: dmin
* **Admin Password**: dmin123
* **Database State**: Pristine, clean state containing only system permissions and the administrator account. All clinical lists (Patients, Doctors, Nurses, Vitals, Tasks) start at 0.
