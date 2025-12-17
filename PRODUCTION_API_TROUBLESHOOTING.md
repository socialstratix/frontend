# Production API URI Troubleshooting

## Problem: Wrong API URI in Production

If you're seeing incorrect API URLs in production (like `https://backend-stratix.vercel.app/auth/login` instead of `https://backend-stratix.vercel.app/api/v1/auth/login`), follow these steps:

## Common Causes

### 1. Environment Variable Not Set in Vercel

**Vite requires environment variables to be available at BUILD TIME, not runtime.**

#### Check in Vercel:
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Verify `VITE_API_BASE_URL` is set:
   - ✅ **Correct:** `https://backend-stratix.vercel.app`
   - ❌ **Wrong:** `https://backend-stratix.vercel.app/api/v1` (don't include /api/v1)
3. Make sure it's set for **Production** environment
4. **Redeploy** after adding/changing environment variables

### 2. Environment Variable Format Issues

**In Vercel Dashboard:**
- **Name:** `VITE_API_BASE_URL`
- **Value:** `https://backend-stratix.vercel.app` (no trailing slash, no /api/v1)
- **Environment:** Select **Production** (and Preview/Development if needed)

### 3. Build Cache Issues

If you changed the environment variable but it's still wrong:

1. **Clear Vercel build cache:**
   - Go to Vercel project → **Settings** → **General**
   - Scroll to "Build & Development Settings"
   - Click "Clear Build Cache"
   - Redeploy

2. **Or redeploy with force:**
   ```bash
   vercel --prod --force
   ```

## How to Verify

### Check Browser Console

After deploying, open your production site and check the browser console. You should see:

```
🔧 API Configuration: {
  VITE_API_BASE_URL: "https://backend-stratix.vercel.app",
  API_BASE: "https://backend-stratix.vercel.app",
  API_VERSION: "v1",
  API_BASE_URL: "https://backend-stratix.vercel.app/api/v1"
}
```

### Check Network Tab

1. Open browser DevTools → **Network** tab
2. Try to login
3. Look for the login request
4. Check the **Request URL** - it should be:
   - ✅ `https://backend-stratix.vercel.app/api/v1/auth/login`
   - ❌ `https://backend-stratix.vercel.app/auth/login` (missing /api/v1)

## Step-by-Step Fix

### Step 1: Set Environment Variable in Vercel

1. Go to [vercel.com](https://vercel.com) → Your Project
2. **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `https://backend-stratix.vercel.app`
   - **Environment:** Select **Production** (and others if needed)
5. Click **Save**

### Step 2: Redeploy

**Option A: Via Vercel Dashboard**
- Go to **Deployments** tab
- Click **⋯** (three dots) on latest deployment
- Click **Redeploy**

**Option B: Via Git**
```bash
git commit --allow-empty -m "Trigger redeploy with new env vars"
git push origin main
```

### Step 3: Verify

1. Wait for deployment to complete
2. Visit your production site
3. Open browser console (F12)
4. Check the API Configuration log
5. Try logging in
6. Check Network tab for correct API URL

## Expected Behavior

### Correct API URL Construction:

```
VITE_API_BASE_URL = "https://backend-stratix.vercel.app"
API_VERSION = "v1" (default)

Final URL = "https://backend-stratix.vercel.app/api/v1"
Login endpoint = "/auth/login"
Full URL = "https://backend-stratix.vercel.app/api/v1/auth/login" ✅
```

### Wrong API URL (if env var includes /api/v1):

```
VITE_API_BASE_URL = "https://backend-stratix.vercel.app/api/v1" ❌

Code removes /api/v1 → "https://backend-stratix.vercel.app"
Then adds /api/v1 → "https://backend-stratix.vercel.app/api/v1" ✅
(Actually works, but not recommended)
```

### Wrong API URL (if env var not set):

```
VITE_API_BASE_URL = undefined
Falls back to → "http://localhost:5000"
Final URL = "http://localhost:5000/api/v1" ❌
(Will fail in production)
```

## Debugging Commands

### Check what Vercel sees:

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Verify the variable is listed
3. Check which environments it's set for

### Check build logs:

1. Go to **Deployments** → Click on a deployment
2. Check **Build Logs**
3. Look for any warnings about environment variables

## Quick Test

After setting the environment variable and redeploying, check the browser console. You should see:

```javascript
🔧 API Configuration: {
  VITE_API_BASE_URL: "https://backend-stratix.vercel.app",  // Should show your backend URL
  API_BASE: "https://backend-stratix.vercel.app",
  API_VERSION: "v1",
  API_BASE_URL: "https://backend-stratix.vercel.app/api/v1"  // This is what's used
}
```

If `VITE_API_BASE_URL` shows `NOT SET` or `undefined`, the environment variable is not configured correctly in Vercel.

## Still Not Working?

1. **Double-check the variable name:** Must be exactly `VITE_API_BASE_URL` (case-sensitive)
2. **Check for typos:** No extra spaces, correct URL
3. **Verify environment:** Make sure it's set for Production
4. **Clear cache and redeploy:** Sometimes Vercel caches builds
5. **Check build logs:** Look for any errors during build

