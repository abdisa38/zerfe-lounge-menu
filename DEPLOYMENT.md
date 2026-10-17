# GebetaQR Deployment Guide: Vercel (Frontend) & Render (Backend)

This project is fully structured and prepared for production deployment on **Vercel** and **Render**.

---

## 1. Push to GitHub (Secrets Protected)

Your secrets and database credentials are fully protected:
- `.gitignore` is configured at the root, frontend, and backend levels.
- All `.env` and `.env.local` files are strictly ignored and will never be pushed to GitHub.
- Large `node_modules` directories are removed from Git tracking.

To push to your GitHub repository:
```bash
git add .
git commit -m "feat: prepare for Vercel and Render deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## 2. Deploy Backend on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Fill in the configuration:
   - **Name**: `gebeta-qr-backend`
   - **Region**: Frankfurt (EU Central) or closest region
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `PORT` | `10000` |
   | `MONGO_URI` | `mongodb+srv://abdisaawel313_db_user:PnnmIMzD3fZjjgBq@cluster0.nyu4si0.mongodb.net/gebeta_qr?retryWrites=true&w=majority` |
   | `CORS_ORIGIN` | `*` |
   | `CHAPA_SECRET_KEY` | `CHASECK_TEST-your-chapa-key` |
6. Click **Create Web Service**.
7. Once deployed, Render will provide a live URL, for example:
   `https://gebeta-qr-backend.onrender.com`
8. Test the live health endpoint by visiting:
   `https://gebeta-qr-backend.onrender.com/api/health`

---

## 3. Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the project setup screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`
5. Open the **Environment Variables** section and add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://gebeta-qr-backend.onrender.com/api` |
   *(Replace with your actual Render URL, ending with `/api`)*
6. Click **Deploy**.
7. In under a minute, Vercel will deploy your site at:
   `https://gebeta-qr.vercel.app`

---

## 4. Single-Page Application (SPA) Routing & Mobile Responsiveness

- `frontend/vercel.json` contains SPA rewrite rules so client-side navigation (`/admin`, `#orders`, `#tracking`) reloads without 404 errors.
- The entire interface (both Diner Menu and Restaurant Admin Dashboard) includes responsive styles for smartphones (360px - 480px), tablets (768px - 1024px), and desktop.

