# JobPortal — Full-Stack Job Board Application

A full-featured job portal built with the MERN stack, supporting three distinct user roles: **Job Seekers**, **Recruiters**, and **Admins**. Designed with a focus on clean architecture, secure authentication, and a smooth user experience.

---

## Features

### Job Seekers
- Browse and search job listings with advanced filters (keyword, location, type, category)
- Apply to jobs with resume upload
- Track application status in a personal dashboard
- Manage profile and profile picture

### Recruiters
- Post jobs through a multi-step validated form
- Manage active listings
- View and manage applicants per job
- Message applicants directly

### Admins
- Approve or reject job postings before they go live
- Manage user roles (jobseeker, recruiter, admin)
- View all users and applications

### Platform
- JWT-based auth with access token + refresh token rotation
- Password reset via security questions
- Paginated listings across all major views
- Rate limiting, CORS, and Helmet security headers
- Responsive UI with dark mode support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v6, Axios, Tailwind CSS |
| Backend | Node.js, Express v5 |
| Database | MongoDB, Mongoose v9 |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Security | Helmet, express-rate-limit, CORS |
| File Uploads | Multer |
| Email | Nodemailer (Gmail SMTP) |

---

## Project Structure

```
job-portal/
├── backend/
│   ├── controllers/
│   ├── middleware/       # Auth, rate limiter, role checks
│   ├── models/           # User, Job, Application, RefreshToken
│   ├── routes/           # auth, jobs, applications, users
│   ├── services/         # Email service
│   └── server.js
└── frontend/
    └── src/
        ├── components/   # Navbar, Footer, SearchFilters, Toast
        ├── context/      # AuthContext
        ├── pages/        # All route-level pages
        └── utils/        # Validation, sanitization helpers
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Optional
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
```

Create a `.env` file inside the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Run Locally

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm start
```

Backend: `http://localhost:5000` | Frontend: `http://localhost:3000`

---

## API Highlights

All protected routes accept either:
- `Authorization: Bearer <token>`
- `x-auth-token: <token>`

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Auth |
| POST | `/api/auth/refresh-token` | Public |
| POST | `/api/auth/logout` | Auth |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/verify-security-answers` | Public |
| POST | `/api/auth/reset-password` | Public |

### Jobs
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/jobs` | Public |
| GET | `/api/jobs/search/advanced` | Public |
| POST | `/api/jobs` | Recruiter / Admin |
| PATCH | `/api/jobs/:id/approve` | Admin |
| GET | `/api/jobs/admin/all-jobs` | Admin |

### Applications
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/applications` | Auth |
| GET | `/api/applications/my-applications` | Auth |
| GET | `/api/applications/recruiter` | Recruiter / Admin |
| PUT | `/api/applications/:id` | Job Owner / Admin |

---

## Key Workflows

**Registration** → 3-step form (account info → role → security questions)

**Login** → JWT access token issued; refresh token stored (SHA-256 hashed in DB)

**Job Posting** → Multi-step form with per-step validation → Admin approval queue → Published

**Password Reset** → Forgot Password → Security Questions Verification → Reset Password

---

## Future Improvements

- Email verification on registration
- Real-time notifications (Socket.io)
- Cloudinary integration for resume/image hosting
- Saved jobs / bookmarks
- Interview scheduling feature
- Analytics dashboard for recruiters

---

## Author

**Khushi Thakur**
[GitHub](https://github.com/Thakur-Khushi)
