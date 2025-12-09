# Deployment Guide

This project is set up to be deployed with the **Frontend on Vercel** and the **Backend on Render**.

## Prerequisites

- A [GitHub](https://github.com/) account (where your code is hosted).
- A [Vercel](https://vercel.com/) account.
- A [Render](https://render.com/) account.

---

## Part 1: Deploy Backend to Render

The backend must be deployed first because you need its URL to configure the frontend.

1.  **Log in to Render** and go to your **Dashboard**.
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository: `AKHILAKOYADA/MilitaryAssestManagement`.
4.  **Configure the Service**:
    -   **Name**: `military-asset-server` (or similar).
    -   **Root Directory**: `server` (Important! This tells Render the backend code is in the server folder).
    -   **Environment**: `Node`.
    -   **Build Command**: `npm install`.
    -   **Start Command**: `npm start` (or `node server.js`).
5.  **Free Tier Note**:
    -   This project uses **SQLite**. On Render's free tier, the file system is ephemeral. **This means your database will reset every time the server restarts or redeploys.**
    -   *For persistent data*, you would typically use Render's "Disk" feature (paid) or switch to a cloud database like PostgreSQL (e.g., Supabase, Neon).
6.  Click **Create Web Service**.
7.  Wait for the deployment to finish.
8.  **Copy the Backend URL** (e.g., `https://military-asset-server.onrender.com`). You will need this for the frontend.

---

## Part 2: Deploy Frontend to Vercel

1.  **Log in to Vercel** and go to your **Dashboard**.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository: `AKHILAKOYADA/MilitaryAssestManagement`.
4.  **Configure the Project**:
    -   **Framework Preset**: Vite (should be detected automatically).
    -   **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**:
    -   Expand the **Environment Variables** section.
    -   Add a new variable:
        -   **Key**: `VITE_API_URL`
        -   **Value**: Paste your Render Backend URL here (e.g., `https://military-asset-server.onrender.com`).
        -   *Note: Do not add a trailing slash `/` at the end of the URL.*
6.  Click **Deploy**.
7.  Vercel will build and deploy your site. Once finished, you will get a live URL for your frontend.

---

## Troubleshooting

-   **CORS Errors**: If the frontend cannot talk to the backend, check the browser console (`F12`). If you see CORS errors, ensure the Backend is running and the `VITE_API_URL` is correct (no trailing slash). The current backend is configured to allow all origins (`app.use(cors())`), so it should work by default.
-   **Database Reset**: Remember, if your data disappears, it is because of the SQLite + Render ephemeral filesystem limitation described above.
