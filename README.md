# Stratix Frontend (Vite + React)

Frontend application for the **Stratix Influencer Marketing Platform**, built with **React, TypeScript, Vite, and Tailwind CSS**.
This application consumes the Stratix backend API documented in `backend/README.md`.

🌐 **Production URL:** https://www.socialstratix.com/

---

# Tech Stack

* React 19
* TypeScript
* Vite
* React Router
* React Hook Form + Zod
* Tailwind CSS

---

# Project Structure

```
frontend/
├── src/
│   ├── main.tsx               # App entry (Vite)
│   ├── index.css              # Global styles (Tailwind)
│   ├── router/                # React Router configuration
│   ├── pages/                 # Top-level pages (Login, Signup, Pricing)
│   ├── components/
│   │   ├── atoms/             # Basic UI elements
│   │   ├── molecules/         # Reusable components
│   │   ├── organisms/         # Larger feature components
│   │   └── templates/         # Layout components
│   ├── contexts/              # React context providers
│   ├── hooks/                 # Custom hooks
│   ├── services/              # API and domain services
│   ├── utils/                 # Helper functions
│   └── constants/             # Shared constants
│
├── public/                    # Static assets
├── index.html                 # HTML template
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript config
└── vercel.json                # Vercel deployment config
```

---

# Getting Started (Local Development)

## 1. Install Dependencies

```bash
cd frontend
npm install
```

---

## 2. Configure Environment Variables

Create a `.env` file inside the `frontend` directory.

```
VITE_API_BASE_URL=https://backend-yhnh.onrender.com
VITE_API_VERSION=v1
```

### Variables

| Variable          | Description                        |
| ----------------- | ---------------------------------- |
| VITE_API_BASE_URL | Backend base URL without `/api/v1` |
| VITE_API_VERSION  | API version                        |

The final API URL becomes:

```
${VITE_API_BASE_URL}/api/${VITE_API_VERSION}
```

Example:

```
https://backend-yhnh.onrender.com/api/v1
```

---

## 3. Run Development Server

```
npm run dev
```

Default development URL:

```
http://localhost:5173
```

---

## 4. Type Checking & Linting

```
npm run lint
```

---

# Available Scripts

| Script          | Description                            |
| --------------- | -------------------------------------- |
| npm run dev     | Start development server               |
| npm run build   | Type check and build production bundle |
| npm run preview | Preview production build locally       |
| npm run lint    | Run ESLint                             |

---

# Environment Variables (Summary)

All configuration is provided **at build time via Vite**.

Required variables:

### `VITE_API_BASE_URL`

Backend API base URL.

Example:

```
https://backend-yhnh.onrender.com
```

### `VITE_API_VERSION`

API version.

Example:

```
v1
```

---

# Frontend Deployment (Vercel)

The frontend is deployed using **Vercel with GitHub integration**.

A `vercel.json` file is already configured with:

* installCommand → `npm ci`
* buildCommand → `npm run build`
* outputDirectory → `dist`
* SPA rewrites for React Router

---

# Deploy via GitHub (Recommended)

## 1. Push Code to GitHub

```
git add .
git commit -m "Prepare frontend for deployment"
git push origin main
```

---

## 2. Import Project in Vercel

1. Go to **Vercel Dashboard**
2. Click **New Project**
3. Import your **GitHub repository**
4. Set **Root Directory → frontend**

---

## 3. Verify Build Settings

| Setting          | Value         |
| ---------------- | ------------- |
| Framework        | Vite          |
| Root Directory   | frontend      |
| Install Command  | npm ci        |
| Build Command    | npm run build |
| Output Directory | dist          |

---

## 4. Configure Environment Variables

In **Vercel → Project Settings → Environment Variables**

Add:

```
VITE_API_BASE_URL=https://backend-yhnh.onrender.com
VITE_API_VERSION=v1
```

Apply to:

* Production
* Preview
* Development

---

## 5. Deploy

Click **Deploy**.

After build completes, Vercel will provide a URL like:

```
https://your-stratix-frontend.vercel.app
```

---

# Deploy via Vercel CLI (Optional)

Install CLI:

```
npm install -g vercel
```

Login:

```
vercel login
```

Deploy:

```
cd frontend
vercel
```

Production deploy:

```
vercel --prod
```

---

# Backend Deployment (Render)

The Stratix backend is deployed on **Render**.

## Steps

### 1. Push Backend to GitHub

```
git add .
git commit -m "Prepare backend for deployment"
git push origin main
```

---

### 2. Create Render Web Service

1. Go to **Render Dashboard**
2. Click **New**
3. Select **Web Service**
4. Connect your GitHub repository

---

### 3. Configure Service

| Setting       | Value       |
| ------------- | ----------- |
| Environment   | Node        |
| Branch        | main        |
| Build Command | npm install |
| Start Command | npm start   |

Example start command:

```
node server.js
```

---

### 4. Environment Variables

Add required backend variables:

```
PORT=10000
MONGO_URI=your_database_url
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
```

---

### 5. Deploy Backend

Click **Create Web Service**.

Render will:

* Clone the repository
* Install dependencies
* Start the server

Backend URL example:

```
https://backend-yhnh.onrender.com
```

---

# Production URLs

| Service     | URL                               |
| ----------- | --------------------------------- |
| Frontend    | https://www.socialstratix.com     |
| Backend API | https://backend-yhnh.onrender.com |

---

# Verifying Production

After deployment:

1. Open

```
https://www.socialstratix.com
```

2. Open **Browser DevTools → Network**

3. Confirm requests go to:

```
https://backend-yhnh.onrender.com/api/v1/...
```

---

# Troubleshooting

Common issues:

### API not working

Verify:

```
VITE_API_BASE_URL=https://backend-yhnh.onrender.com
```

### Env variables not applied

Trigger a **new deployment** in Vercel after changing environment variables.

### CORS error

Ensure backend allows requests from:

```
https://www.socialstratix.com
```

---

# Notes

* Docker is **not used** for frontend deployment.
* All production builds are handled directly by **Vercel**.

---

# Deployment Completed

Frontend → **Vercel**
Backend → **Render**

Your Stratix platform is now live 🚀
