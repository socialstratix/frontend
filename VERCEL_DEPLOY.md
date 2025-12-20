# Deploying to Vercel

## Important Note
**Vercel does NOT use Docker** - it deploys directly from your codebase. The Docker files are for other deployment platforms or local testing.

## Quick Deploy to Vercel

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory:**
   ```bash
   cd frontend
   vercel
   ```

4. **For production deployment:**
   ```bash
   vercel --prod
   ```

### Option 2: Using GitHub Integration (Easiest)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com) and:**
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Vercel will auto-detect Vite framework
   - Click "Deploy"

### Option 3: Using Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`

## Environment Variables

**IMPORTANT:** Set these in Vercel Dashboard after deployment:

1. Go to your project → Settings → Environment Variables
2. Add the following variables:

   - **Name:** `VITE_API_BASE_URL`
     - **Value:** Your backend API base URL (without `/api/v1`)
     - **Example:** `https://backend-stratix.vercel.app`
     - **Environment:** Production, Preview, Development (select all)
   
   - **Name:** `VITE_API_VERSION`
     - **Value:** API version (usually `v1`)
     - **Example:** `v1`
     - **Environment:** Production, Preview, Development (select all)

3. **Redeploy** after adding environment variables

**Note:** The full API URL will be constructed as: `${VITE_API_BASE_URL}/api/${VITE_API_VERSION}`

## Project Structure

Vercel is already configured via `vercel.json`:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Client-side routing support
- ✅ Static asset caching

## After Deployment

1. **Get your deployment URL** from Vercel dashboard
2. **Update your backend CORS** to allow your Vercel domain
3. **Test the deployment** - visit your Vercel URL

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check that `package.json` has all dependencies
- Verify Node.js version (Vercel uses Node 20.x by default)
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Make sure variable name starts with `VITE_`
- Redeploy after adding variables
- Check that variables are set for the correct environment

### Routing Issues
- Already handled by `vercel.json` rewrites
- All routes redirect to `/index.html` for client-side routing

### API Calls Failing
- Check CORS settings on your backend
- Verify `VITE_API_BASE_URL` is set correctly
- Check browser console for errors

## Docker Files (For Other Platforms)

The Docker files (`Dockerfile`, `docker-compose.yml`) are included but **not used by Vercel**. They're useful for:
- Local production testing
- Deploying to other platforms (AWS, DigitalOcean, etc.)
- Containerized deployments

To use Docker locally:
```bash
docker-compose up -d
```

