# Job Portal

A full-stack job portal that connects job seekers, recruiters, and admins.

## Overview

This project includes:

- A React frontend for job browsing, applications, profile management, and dashboards.
- An Express + MongoDB backend with JWT auth, role-based access control, and file uploads.
- Role-based workflows for:
  - Job seekers: browse jobs, apply, manage profile/resume.
  - Recruiters: post jobs, manage listings, view applicants.
  - Admins: moderate users and jobs.

## Tech Stack

- Frontend: React, React Router, Axios, Tailwind CSS, Animate.css
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth/Security: JWT, bcryptjs, Helmet, CORS, express-rate-limit
- Uploads: Multer (local uploads), optional Cloudinary config

## Project Structure

```text
job-portal/
|- backend/                # Express API
|  |- controllers/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- services/
|  |- uploads/
|  `- server.js
|- frontend/               # React app
|  |- public/
|  |- src/
|  `- README.md
|- uploads/                # Optional root uploads folder
|- .env.example
|- BUG_REPORT.md
|- FIXES_APPLIED.md
`- PROJECT_DOCUMENTATION.md
```

## Features

- Secure auth with access token + refresh token flow
- Role-based authorization (jobseeker, recruiter, admin)
- Job listing, search, and advanced filters
- Recruiter job posting and applicant management
- Job seeker application tracking
- Resume and profile picture upload
- Pagination on key listing endpoints
- Basic hardening with rate limits, CORS, Helmet, and validation

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+
- MongoDB (local instance or Atlas)

## Environment Variables

Create a `.env` file in the project root or `backend` folder (based on your run setup) using `.env.example`.

Required variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `PORT` (default: 5000)
- `NODE_ENV` (`development` or `production`)
- `CORS_ORIGIN` (frontend URL, e.g. `http://localhost:3000`)
- `REACT_APP_API_URL` (frontend API base, e.g. `http://localhost:5000/api`)
- `REACT_APP_BACKEND_URL` (backend base, e.g. `http://localhost:5000`)

Optional variables:

- `GMAIL_USER`, `GMAIL_PASS`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Local Development

Open two terminals.

### 1) Start backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### 2) Start frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000` by default.

## Available Scripts

### Backend (`backend/package.json`)

- `npm start` - Start server with Node
- `npm run dev` - Start server with Nodemon

### Frontend (`frontend/package.json`)

- `npm start` - Run development server
- `npm run build` - Build production bundle
- `npm test` - Run tests

## Authentication Notes

- Protected routes accept either:
  - `Authorization: Bearer <token>`
  - `x-auth-token: <token>`
- Access token is issued at login.
- Refresh token endpoint: `POST /api/auth/refresh-token`.

## API Overview

Base URL: `http://localhost:5000/api`

### Auth Routes

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh-token`
- `POST /auth/logout`

### Job Routes

- `GET /jobs`
- `GET /jobs/my-jobs` (auth)
- `GET /jobs/search/advanced`
- `GET /jobs/:id`
- `POST /jobs` (recruiter/admin)
- `PUT /jobs/:id` (owner/admin)
- `DELETE /jobs/:id` (owner/admin)
- `PATCH /jobs/:id/approve` (admin)
- `PATCH /jobs/:id/reject` (admin)
- `GET /jobs/admin/all-jobs` (admin)

### Application Routes

- `POST /applications` (auth, multipart supported)
- `GET /applications/my-applications` (auth)
- `GET /applications/recruiter` (recruiter/admin)
- `GET /applications/job/:jobId` (recruiter/admin)
- `PUT /applications/:id` (job owner/admin)
- `POST /applications/:id/message` (authorized participants)
- `DELETE /applications/:id` (applicant)

### User Routes

- `GET /users` (admin/recruiter)
- `GET /users/job-seekers` (admin/recruiter)
- `GET /users/profile` (auth)
- `PUT /users/profile` (auth)
- `GET /users/:id/profile` (admin/recruiter)
- `PUT /users/:id/role` (admin)
- `POST /users/upload-resume` (auth, multipart)
- `POST /users/upload-profile-picture` (auth, multipart)

## File Uploads

- Uploaded files are served from `/uploads`.
- Resume upload is available via:
  - application submission (`/api/applications`, field: `resume`)
  - profile upload (`/api/users/upload-resume`, field: `resume`)
- Profile picture upload field: `profilePicture`.

## Deployment (Current Recommended Setup)

- Backend: Render
- Frontend: Netlify
- Database: MongoDB Atlas

High-level steps:

1. Deploy MongoDB Atlas and get URI.
2. Deploy backend from `backend` directory on Render.
3. Deploy frontend from `frontend` directory on Netlify.
4. Set `CORS_ORIGIN` to the frontend URL.
5. Set frontend `REACT_APP_API_URL` to backend `/api` URL.

See `frontend/README.md` for frontend deployment-specific notes.

## Known Project Docs

- `PROJECT_DOCUMENTATION.md` - Detailed architecture and file-by-file documentation
- `BUG_REPORT.md` - Bug report details
- `FIXES_APPLIED.md` - Applied fixes and verification checklist

## Troubleshooting

- CORS errors:
  - Ensure `CORS_ORIGIN` exactly matches frontend URL (no trailing slash).
- Auth errors on protected routes:
  - Confirm token is sent in `Authorization` or `x-auth-token` header.
- Upload issues:
  - Confirm multipart request and correct field names.
- MongoDB connection failure:
  - Verify `MONGODB_URI` and network access rules (Atlas).

## License

This project is currently unlicensed for public distribution. Add a license file if you plan to publish it.
