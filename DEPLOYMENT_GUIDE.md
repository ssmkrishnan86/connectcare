# ConnectCare - Free Cloud Deployment & Client Demo Guide

This guide outlines how to deploy ConnectCare to a free cloud hosting environment with a clean database and default admin login.

---

## 🎯 Production Architecture Summary

- **App Service**: ASP.NET Core 10 Web API hosting compiled React 19 Frontend in wwwroot (Single-Container Unified SPA Architecture).
- **Database**: Free Managed PostgreSQL (e.g. Neon.tech, Supabase, or Render PostgreSQL).
- **Default Login Credentials**:
  - **Username**: dmin
  - **Password**: dmin123
  - **Clean Database**: Contains system configuration, roles, and permissions only. All clinical lists (Patients, Doctors, Nurses, Vitals, Tasks) start empty and clean for client presentation.

---

## 🚀 Option 1: 1-Click Deploy on Render.com (Recommended Free Tier)

### Step 1: Create a Free PostgreSQL Database (Neon.tech / Supabase)
1. Go to [https://neon.tech](https://neon.tech) and sign up for free (No credit card required).
2. Click **Create Project** -> Name it connectcare-db.
3. Copy the **Connection String** (format: postgres://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require).

### Step 2: Deploy Web Service on Render.com
1. Go to [https://render.com](https://render.com) and sign up / log in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select the repository: ssmkrishnan86/connectcare.
4. Choose:
   - **Environment**: Docker (Render automatically detects ./Dockerfile).
   - **Plan**: Free.
5. Under **Environment Variables**, add:
   - DATABASE_URL: paste the Neon connection string from Step 1.
   - ASPNETCORE_ENVIRONMENT: Production
6. Click **Deploy Web Service**.

Once deployed (approx. 2-3 minutes), Render provides your live HTTPS public URL:
👉 https://connectcare-demo.onrender.com (or your custom service name).

---

## 🚀 Option 2: Deploy on Koyeb (Alternative 100% Free Tier)

1. Go to [https://koyeb.com](https://koyeb.com) and connect GitHub.
2. Click **Create Service** -> **GitHub**.
3. Select connectcare repository.
4. Set Build Type to **Dockerfile**.
5. Add Environment Variable DATABASE_URL with your Neon PostgreSQL URI.
6. Click **Deploy**.

Your live URL will be:
👉 https://<your-app-name>.koyeb.app

---

## 🌐 Instant Public Live Demo Link (Cloudflare Tunnel)

To share a live public link immediately from this workstation:
`powershell
cloudflared tunnel --url http://localhost:5173
`
This prints an instant secure public HTTPS URL (e.g. https://xxxx.trycloudflare.com) accessible anywhere in the world.
