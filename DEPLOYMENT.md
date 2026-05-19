# Deployment Guide

## Backend on Render

1. Push the repo to GitHub if not already pushed.
2. Create a new Render web service.
3. Connect the repository and set the root directory to `backend`.
4. Use these settings:
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn frontend:app --host 0.0.0.0 --port ${PORT}`
   - Branch: `main`
5. Add Render environment variables:
   - `GROQ_API_KEY`
   - `PLANTNET_API_KEY`

Render will then deploy the backend and expose a public URL like `https://<project>.onrender.com`.

## Frontend on Vercel

1. Create a new Vercel project.
2. Select the `frontend/frontend` directory as the project root.
3. Vercel should detect the Vite app automatically.
4. Configure the environment variable:
   - `VITE_BACKEND_URL=https://<your-render-backend-url>`
5. Deploy.

## Important Notes

- The frontend reads the backend base URL from `VITE_BACKEND_URL`.
- The repo root now includes `render.yaml` for Render service configuration.
- Both `/.env` and `/frontend/frontend/.env` are ignored by git; use `.env.example` files for local setup.
