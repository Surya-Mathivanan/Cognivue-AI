# Hosting Guide

## Hosting Backend on Render

Render is a cloud platform that supports deploying web applications, including Python backends.

### Prerequisites
- A GitHub account with your project repository pushed.
- A Render account (sign up at [render.com](https://render.com)).

### Steps
1. **Connect Repository**: Log in to Render and connect your GitHub repository containing the backend code.

2. **Create Web Service**: Click "New" > "Web Service". Select your repository and the branch (e.g., main).

3. **Configure Build Settings**:
   - **Runtime**: Python 3 (or latest).
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python backend/app.py` (adjust if your entry point differs; ensure the app listens on the port provided by Render, e.g., via `os.environ.get('PORT')`).

4. **Environment Variables**: Add any necessary environment variables (e.g., database URLs, API keys) in the Render dashboard under "Environment".

5. **Deploy**: Click "Create Web Service". Render will build and deploy your backend. The service URL will be provided once deployed.

6. **Update Frontend**: Note the backend URL (e.g., https://your-backend.onrender.com) for configuring the frontend API calls.

## Hosting Frontend on Vercel

Vercel is optimized for deploying static sites and frontend applications like React.

### Prerequisites
- A GitHub account with your project repository pushed.
- A Vercel account (sign up at [vercel.com](https://vercel.com)).

### Steps
1. **Connect Repository**: Log in to Vercel and import your GitHub repository.

2. **Configure Project**:
   - **Framework Preset**: Select "Vite" (since your frontend uses Vite).
   - **Root Directory**: `frontend` (to deploy only the frontend part).
   - **Build Command**: `npm run build` (default for Vite).
   - **Output Directory**: `dist` (default for Vite).

3. **Environment Variables**: If needed, add environment variables (e.g., API base URL pointing to your Render backend).

4. **Deploy**: Click "Deploy". Vercel will build and deploy your frontend. The site URL will be provided (e.g., https://your-frontend.vercel.app).

5. **Update API Calls**: Ensure your frontend's API calls point to the Render backend URL.

### Additional Notes
- **CORS**: If your backend has CORS restrictions, configure it to allow requests from your Vercel domain.
- **Database**: If using a database, ensure it's accessible (e.g., via environment variables).
- **Testing**: Test the full application after deployment to ensure frontend-backend communication works.
- **Costs**: Both platforms have free tiers; monitor usage to avoid charges.

This should cover the basics. Adjust commands based on your specific setup.