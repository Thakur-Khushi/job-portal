# Job Portal Frontend

Frontend application for the Job Portal platform.

For complete project documentation (backend + frontend), see the root README at `../README.md`.

## Stack

- React (Create React App)
- React Router
- Axios
- Tailwind CSS
- Animate.css

## Setup

```bash
cd frontend
npm install
npm start
```

Default local URL: `http://localhost:3000`

## Scripts

- `npm start` - Start development server
- `npm run build` - Build production bundle
- `npm test` - Run tests

## Environment Variables

Create `.env` in `frontend/` when needed.

- `REACT_APP_API_URL=http://localhost:5000/api`
- `REACT_APP_BACKEND_URL=http://localhost:5000`

Notes:

- Variables must start with `REACT_APP_`.
- Restart the dev server after changing environment variables.

## Production Deployment (Netlify)

Recommended free setup:

- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas

Netlify build settings:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`

Netlify environment variables:

- `REACT_APP_API_URL=https://your-backend-domain/api`

After frontend deploy:

- Update backend `CORS_ORIGIN` to exact frontend URL
- Redeploy backend

## Troubleshooting

- API requests fail:
  - Verify `REACT_APP_API_URL` is correct and reachable.
- CORS errors:
  - Ensure backend `CORS_ORIGIN` exactly matches frontend URL.
- Build issues:
  - Remove `node_modules` and reinstall dependencies.
