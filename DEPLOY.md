# Deployment Guide

This project is set up as a monorepo containing both Client and Server. Follow these steps to deploy the application on Vercel (Frontend) and Railway (Backend).

## 1. Prerequisites

- GitHub Account (push this code to a new repository)
- Vercel Account (for Client)
- Railway Account (for Server)
- MongoDB Atlas Database (Connection String)
- Google Cloud Console Project (for OAuth)

---

## 2. Deploy Backend (Railway)

We will deploy the `server` directory to Railway.

1.  **New Project**: Go to [Railway Dashboard](https://railway.app/) -> "New Project" -> "Deploy from GitHub repo".
2.  **Select Repository**: Choose your `Fluxo` repository.
3.  **Configure Service**:
    *   Click on the new service card.
    *   Go to **Settings** -> **Root Directory**.
    *   Set it to `/server`.
    *   (Optional) Set **Start Command** to `npm start`. Railway usually auto-detects this from `server/package.json`.
4.  **Variables**: Go to **Variables** tab and add:
    *   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb+srv://...`)
    *   `APP_SECRET`: A long random string for JWT security (e.g., `my_super_secret_key_123`)
    *   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
    *   `PORT`: `5000` (Optional, Railway assigns its own port, but setting 5000 is safe)
    *   `NODE_ENV`: `production`
5.  **Generate Domain**:
    *   Go to **Settings** -> **Networking**.
    *   Click "Generate Domain".
    *   **Copy this URL** (e.g., `https://fluxo-server-production.up.railway.app`). This is your **Backend URL**.

---

## 3. Deploy Frontend (Vercel)

We will deploy the `client` directory to Vercel.

1.  **New Project**: Go to [Vercel Dashboard](https://vercel.com/) -> "Add New..." -> "Project".
2.  **Import Git Repository**: Select your `Fluxo` repository.
3.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `client`. **This is very important!**
4.  **Environment Variables**: expand the section and add:
    *   `VITE_API_URL`: Your Railway Backend URL (from Step 2)
        *   Example: `https://fluxo-server-production.up.railway.app/api`
        *   **Important**: Make sure to include `/api` at the end if your backend routes are prefixed with it (which they are).
5.  **Deploy**: Click "Deploy".

---

## 4. Final Configuration

After both are deployed:

1.  **Update Google Cloud Console**:
    *   Go to your Google Cloud Console Credentials.
    *   Add your **Vercel Frontend URL** (e.g., `https://fluxo-app.vercel.app`) to "Authorized JavaScript origins".
    *   Add `https://fluxo-app.vercel.app` (and maybe `https://fluxo-app.vercel.app/authorization/google` depending on your library) to "Authorized redirect URIs".

2.  **Update Backend CORS (Optional but Recommended)**:
    *   In `server/index.js`, the CORS origin list includes specific domains.
    *   If your Vercel domain is different from the ones hardcoded, you may need to add an environment variable for `CLIENT_URL` in the server or update the code to allow your specific Vercel domain.
    *   *Current Code supports*: `['https://fluxo-xi.vercel.app', 'http://localhost:5173', 'http://localhost:3000']`
    *   **Quick Fix**: If your domain is different, add a `CORS_ORIGIN` variable in Railway and update the server code to use `process.env.CORS_ORIGIN`.

---

## 5. Troubleshooting

-   **Backend Connection Error**: Check browser console. If you see CORS errors, check Step 4. If you see 404, check if you added `/api` to `VITE_API_URL`.
-   **Socket.IO Error**: Vercel Serverless (Frontend) connecting to Railway (Backend) should work fine with WebSocket. If issues persist, ensure Railway service allows WebSocket connections (enabled by default).
