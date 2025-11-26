# Step-by-Step Guide to Host Backend on Render and Frontend on Vercel

This guide provides clear, detailed instructions to deploy your full-stack application: Python Flask backend on Render and React frontend on Vercel.

## Prerequisites for Both Deployments
- GitHub account with your project repository pushed (public or private).
- Render account: Sign up at [render.com](https://render.com).
- Vercel account: Sign up at [vercel.com](https://vercel.com).
- Ensure your project has `requirements.txt` in the root and `package.json` in the `frontend/` directory.

## Part 1: Prepare Your Code for Deployment

### Backend Preparation (Python Flask)
1. **Update `backend/app.py` for Port Handling**:
   - Render provides a dynamic PORT environment variable.
   - Change the last lines of `backend/app.py` from:
     ```python
     if __name__ == '__main__':
         with app.app_context():
             db.create_all()
         app.run(host='0.0.0.0', port=5000, debug=True)
     ```
     To:
     ```python
     if __name__ == '__main__':
         with app.app_context():
             db.create_all()
         port = int(os.environ.get('PORT', 5000))
         app.run(host='0.0.0.0', port=port, debug=False)
     ```
   - This ensures the app runs on Render's assigned port.

2. **Update CORS Origins**:
   - In `backend/app.py`, change the CORS line from:
     ```python
     CORS(app, supports_credentials=True, origins=['http://localhost:3000'])
     ```
     To:
     ```python
     CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'https://your-frontend.vercel.app'])
     ```
     Replace `https://your-frontend.vercel.app` with your actual Vercel domain later.

3. **Environment Variables**:
   - Ensure your `.env` file includes all necessary keys (e.g., `GEMINI_API_KEY`, `DATABASE_URL`, `SESSION_SECRET`).
   - For production, use Render's environment variables instead of `.env`.

### Frontend Preparation (React/Vite)
1. **Update API Base URL**:
   - In `frontend/src/api.js`, change the base URL from localhost to your Render backend URL.
   - Example: Change `http://localhost:5000` to `https://your-backend.onrender.com`.

2. **Build Configuration**:
   - Ensure `frontend/vite.config.js` is set up correctly for production builds.

## Part 2: Deploy Backend on Render

1. **Log in to Render**:
   - Go to [render.com](https://render.com) and sign in.

2. **Connect GitHub Repository**:
   - Click "New" in the top right > "Web Service".
   - Connect your GitHub account and select your repository.

3. **Configure Web Service**:
   - **Name**: Choose a name for your service (e.g., "cognivue-backend").
   - **Branch**: Select "main" or your deployment branch.
   - **Runtime**: Python 3.
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python backend/app.py`

4. **Set Environment Variables**:
   - In the "Environment" section, add:
     - `GEMINI_API_KEY`: Your Gemini API key.
     - `DATABASE_URL`: For production database (Render provides PostgreSQL free tier).
     - `SESSION_SECRET`: A secure random string.
     - Any other required variables from your `.env`.

5. **Advanced Settings** (Optional):
   - **Health Check Path**: `/api/health`
   - **Instance Type**: Free tier is fine for starters.

6. **Deploy**:
   - Click "Create Web Service".
   - Wait for the build and deployment to complete (may take 5-10 minutes).
   - Once deployed, note the service URL (e.g., `https://cognivue-backend.onrender.com`).

## Part 3: Deploy Frontend on Vercel

1. **Log in to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in.

2. **Import Project**:
   - Click "New Project".
   - Connect your GitHub account and select your repository.

3. **Configure Project Settings**:
   - **Framework Preset**: Vite.
   - **Root Directory**: `frontend`.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
   - **Install Command**: `npm install`.

4. **Environment Variables** (if needed):
   - Add any frontend-specific variables (rarely needed for this setup).

5. **Deploy**:
   - Click "Deploy".
   - Vercel will build and deploy your frontend.
   - Note the deployment URL (e.g., `https://cognivue-frontend.vercel.app`).

## Part 4: Post-Deployment Configuration

1. **Update Backend CORS**:
   - Go back to Render dashboard.
   - Update the CORS origins in `backend/app.py` with your actual Vercel URL.
   - Redeploy the backend.

2. **Update Frontend API URL**:
   - If not done earlier, update `frontend/src/api.js` with the Render backend URL.
   - Redeploy the frontend on Vercel.

3. **Test the Application**:
   - Visit your Vercel frontend URL.
   - Test login, resume upload, and interview features.
   - Ensure API calls work (check browser console for errors).

## Troubleshooting

- **Backend Deployment Issues**:
  - Check Render logs for errors.
  - Ensure all dependencies are in `requirements.txt`.
  - Verify environment variables are set correctly.

- **Frontend Deployment Issues**:
  - Check Vercel build logs.
  - Ensure `frontend/package.json` has correct scripts.

- **CORS Errors**:
  - Double-check CORS origins in backend.
  - Ensure frontend API calls use HTTPS in production.

- **Database Issues**:
  - For production, use Render's PostgreSQL database.
  - Update `DATABASE_URL` in Render environment variables.

## Costs
- **Render**: Free tier includes 750 hours/month, 1GB storage.
- **Vercel**: Free tier with generous limits.
- Monitor usage to avoid unexpected charges.

## Final Notes
- Both platforms support automatic deployments on GitHub pushes.
- Keep your repository updated with deployment-ready code.
- For production databases, consider upgrading from free tiers as needed.

If you encounter issues, check the platform documentation or logs for detailed error messages.