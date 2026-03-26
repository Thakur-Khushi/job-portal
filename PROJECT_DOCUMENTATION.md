# Job Portal - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Architecture](#project-architecture)
4. [Directory Structure](#directory-structure)
5. [Backend Files Documentation](#backend-files-documentation)
6. [Frontend Files Documentation](#frontend-files-documentation)
7. [Database Models](#database-models)
8. [Authentication Flow](#authentication-flow)
9. [Key Features & Workflows](#key-features--workflows)
10. [API Endpoints](#api-endpoints)

---

## Project Overview

**Job Portal** is a full-stack web application that connects job seekers with recruiters. It allows:

- **Job Seekers**: Create profiles, upload resumes, apply for jobs, track applications
- **Recruiters**: Post job listings, view applicants, manage job postings
- **Admins**: Manage user roles, monitor platform activity

**Purpose**: Streamline the job application process with a modern, user-friendly interface

---

## Technology Stack

### Frontend

- **React.js** - UI library for building interactive components
- **React Router** - Client-side routing and navigation
- **Axios** - HTTP client for API requests
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Context API** - State management for authentication and themes

### Backend

- **Node.js** - JavaScript runtime for server
- **Express.js** - Web framework for building APIs
- **MongoDB** - NoSQL database for storing data
- **Mongoose** - ODM (Object Data Modeling) for MongoDB
- **JWT (jsonwebtoken)** - Token-based authentication
- **Multer** - Middleware for file uploads
- **Helmet** - Security middleware for HTTP headers
- **CORS** - Cross-Origin Resource Sharing for frontend-backend communication
- **Cloudinary** - Optional file upload service (configured but not always used)

---

## Project Architecture

### Architecture Pattern: MVC (Model-View-Controller)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────────┬──────────────┬──────────────────────┐  │
│  │  Components  │   Pages      │   Context (Auth)     │  │
│  └──────────────┴──────────────┴──────────────────────┘  │
│                         ↓                                 │
│                    Axios HTTP Requests                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Backend (Express API)                    │
│  ┌──────────────┬──────────────┬──────────────────────┐  │
│  │   Routes     │   Middleware │  Controllers         │  │
│  └──────────────┴──────────────┴──────────────────────┘  │
│                         ↓                                 │
│            ┌────────────────────────┐                    │
│            │   MongoDB Database     │                    │
│            │  (Models/Schemas)      │                    │
│            └────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
job-portal/
├── backend/
│   ├── controllers/           # Business logic (currently integrated in routes)
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   ├── rateLimiter.js    # Rate limiting for API protection
│   │   ├── upload.js         # Multer configuration for file uploads
│   │   └── upload-cloudinary.js
│   ├── models/
│   │   ├── User.js           # User schema (jobseeker, recruiter, admin)
│   │   ├── Job.js            # Job posting schema
│   │   ├── Application.js    # Job application schema
│   │   └── RefreshToken.js   # Refresh token schema
│   ├── routes/
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── users.js          # User profile endpoints
│   │   ├── jobs.js           # Job posting endpoints
│   │   └── applications.js   # Job application endpoints
│   ├── services/
│   │   └── emailService.js   # Email sending utility
│   ├── uploads/              # Local file storage
│   ├── server.js             # Main Express app
│   ├── package.json
│   └── seed-jobs.js          # Database seeding script
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js              # Navigation bar
│   │   │   ├── Footer.js              # Footer
│   │   │   ├── ApplicationForm.js     # Job application form
│   │   │   ├── SearchFilters.js       # Job search filters
│   │   │   ├── Toast.js               # Notification component
│   │   │   ├── LoadingSpinner.js      # Loading indicator
│   │   │   ├── EmptyState.js          # Empty state UI
│   │   │   ├── ErrorBoundary.js       # Error handling
│   │   │   └── ConfirmDialog.js       # Confirmation modal
│   │   ├── context/
│   │   │   ├── AuthContext.js         # Global auth state
│   │   │   └── ThemeContext.js        # Dark mode state
│   │   ├── pages/
│   │   │   ├── Login.js               # Login page
│   │   │   ├── Register.js            # Registration page
│   │   │   ├── Dashboard.js           # User dashboard
│   │   │   ├── JobList.js             # Browse jobs
│   │   │   ├── JobDetail.js           # Job details & applications
│   │   │   ├── PostJob.js             # Post new job (recruiter)
│   │   │   ├── JobSeekerProfile.js    # Edit job seeker profile
│   │   │   ├── JobSeekerProfileView.js # View job seeker profile
│   │   │   ├── AdminPanel.js          # Admin dashboard
│   │   │   ├── VerifyEmail.js         # Email verification
│   │   │   └── CheckEmail.js          # Check email page
│   │   ├── services/
│   │   │   ├── profileService.js      # Profile API calls
│   │   │   └── (other services)
│   │   ├── utils/
│   │   │   ├── errorHandler.js        # Error handling
│   │   │   ├── validation.js          # Form validation
│   │   │   ├── sanitization.js        # XSS prevention
│   │   │   └── searchUtils.js         # Search utilities
│   │   ├── App.js                     # Main app component
│   │   └── index.js                   # React entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── PROJECT_DOCUMENTATION.md  (this file)
```

---

## Backend Files Documentation

### 1. **server.js** - Main Express Application

**Purpose**: Initialize and configure the Express server
**Key Responsibilities**:

- Set up Express app
- Configure middleware (CORS, Helmet, JSON parsing)
- Connect to MongoDB
- Define routes
- Error handling
- Serve static files (uploads)

**Key Code**:

```javascript
app.use(helmet()); // Security headers
app.use(cors()); // Cross-origin requests
app.use('/uploads', express.static()); // Serve uploaded files
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
```

---

### 2. **models/User.js** - User Schema

**Purpose**: Define the structure of user documents in MongoDB
**Fields**:

- `name`, `email`, `password` - Basic authentication
- `role` - 'jobseeker', 'recruiter', or 'admin'
- `company` - Company name (for recruiters)
- `phone` - Contact number
- `profile` - Nested object containing:
  - `profilePicture` - Avatar URL
  - `title`, `bio`, `location` - Professional info
  - `skills[]`, `languages[]` - Professional details
  - `experience[]`, `education[]` - Work history
  - `resume` - Resume file URL
  - `social` - LinkedIn, GitHub, Portfolio links
  - `preferences` - Job preferences
  - `visibility` - Privacy settings

**Relations**: One user can have many Job applications

---

### 3. **models/Job.js** - Job Schema

**Purpose**: Define job posting structure
**Fields**:

- `title`, `description` - Job details
- `company` - Company name (from recruiter profile)
- `location` - Job location
- `salary` - Salary range
- `jobType` - Full-time, Part-time, Contract
- `skills[]` - Required skills
- `recruiter` - Reference to recruiter user (FK)
- `status` - 'pending', 'approved', 'rejected'
- `createdAt`, `updatedAt` - Timestamps

---

### 4. **models/Application.js** - Application Schema

**Purpose**: Track job applications
**Fields**:

- `job` - Reference to Job (FK)
- `jobSeeker` - Reference to User (FK)
- `status` - 'pending', 'reviewed', 'shortlisted', 'rejected'
- `appliedAt` - Application date
- `message` - Optional cover letter

---

### 5. **models/RefreshToken.js** - Refresh Token Schema

**Purpose**: Manage JWT refresh tokens for session persistence
**Fields**:

- `user` - Reference to User (FK)
- `token` - Refresh token string
- `expiresAt` - Expiration date

---

### 6. **middleware/auth.js** - Authentication Middleware

**Purpose**: Verify JWT tokens for protected routes
**How it works**:

1. Extracts token from request headers
2. Verifies token signature
3. Attaches user data to request object
4. Passes control to next middleware if valid
5. Returns 401 error if invalid/expired

**Usage**: Applied to routes requiring authentication

```javascript
router.get('/profile', auth, getProfile); // Only authenticated users
```

---

### 7. **middleware/upload.js** - File Upload Configuration

**Purpose**: Configure Multer for handling file uploads
**Features**:

- File type validation (images, PDFs)
- File size limit (5MB)
- Security checks (prevents double extensions)
- Generates unique filenames

**Validation Rules**:

- Allowed MIME types: JPEG, PNG, PDF, DOC, DOCX
- Max file size: 5MB
- Prevents path traversal and double extensions

---

### 8. **routes/auth.js** - Authentication Routes

**Endpoints**:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/verify-email` - Email verification

**Flow**:

1. User submits email/password
2. Password hashed using bcrypt
3. User created in DB
4. JWT token generated and returned

---

### 9. **routes/users.js** - User Profile Routes

**Endpoints**:

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-profile-picture` - Upload avatar
- `POST /api/users/upload-resume` - Upload resume
- `GET /api/users/:id/profile` - View job seeker profile (for recruiters)

**Key Feature - Cache Busting**:
Files are served with query parameters to prevent browser caching

---

### 10. **routes/jobs.js** - Job Posting Routes

**Endpoints**:

- `GET /api/jobs` - List all jobs (with filters)
- `POST /api/jobs` - Create job (recruiter only)
- `GET /api/jobs/:id` - Job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/my-jobs` - Recruiter's job postings

**Filters Supported**:

- Location, Job Type, Salary, Skills
- Search by title/company

---

### 11. **routes/applications.js** - Job Application Routes

**Endpoints**:

- `POST /api/applications` - Submit job application
- `GET /api/applications/my-applications` - User's applications
- `GET /api/applications/job/:jobId` - Applications for a job
- `PUT /api/applications/:id` - Update application status

**Status Flow**:
pending → reviewed → shortlisted/rejected

---

### 12. **services/emailService.js** - Email Notifications

**Purpose**: Send email notifications to users
**Events**:

- Application submitted
- Application status updates
- Account verification
- Password reset

---

## Frontend Files Documentation

### 1. **App.js** - Main Component

**Purpose**: Root component that wraps entire app
**Responsibilities**:

- Renders router with all routes
- Provides Auth & Theme context
- Handles global error boundaries

---

### 2. **context/AuthContext.js** - Authentication State

**Purpose**: Global authentication state management
**Provides**:

- `user` - Current logged-in user object
- `token` - JWT token
- `login()` - Login function
- `logout()` - Logout function
- `isAuthenticated` - Boolean flag

**Stored In**: localStorage for persistence across sessions

---

### 3. **context/ThemeContext.js** - Dark Mode State

**Purpose**: Manage dark/light theme globally
**Features**:

- Toggle dark mode
- Persists theme preference

---

### 4. **pages/Login.js** - Login Page

**Features**:

- Email/password form
- "Remember me" checkbox
- Redirects to dashboard after login
- Shows error messages for failed attempts

**Validation**:

- Email format check
- Password required
- API validation on server

---

### 5. **pages/Register.js** - Registration Page

**Features**:

- User registration form
- Role selection (Job Seeker / Recruiter)
- Password confirmation
- Email verification link sent

**Validation**:

- Strong password requirements
- Email uniqueness check
- Form validation on client & server

---

### 6. **pages/Dashboard.js** - User Dashboard

**Job Seeker View Shows**:

- My applications list with status
- Application count
- Quick profile info

**Recruiter View Shows**:

- Posted jobs list
- Applicant count per job
- Job status (approved/pending)
- Quick actions (edit, view applicants)

**Functionality**:

- Real-time refresh
- Filter jobs/applications
- One-click actions

---

### 7. **pages/JobList.js** - Browse Jobs

**Features**:

- Display all available jobs
- Search by title, company, location
- Filter by job type, salary, skills
- Pagination
- Sort options (newest, oldest, salary)

**Components Used**:

- SearchFilters component
- Job cards with apply button
- EmptyState when no results

---

### 8. **pages/JobDetail.js** - Job Details & Applications

**Features**:

- Full job description and requirements
- Apply button for job seekers
- Application form modal
- List of applicants (recruiter view)
- Applicant details modal with resume

**Recruiter Features**:

- View all applicants
- Change application status
- View full job seeker profile
- Contact information

---

### 9. **pages/PostJob.js** - Post New Job (Recruiter)

**Features**:

- Job creation form
- Rich text editor for description
- Skill tags input
- Salary range picker
- Location and job type selection

**Validation**:

- Required fields check
- Skill validation
- Salary format check

**Workflow**:

1. Fill form → 2. Preview → 3. Submit → 4. Redirected to dashboard

---

### 10. **pages/JobSeekerProfile.js** - Edit Profile

**Tabs/Sections**:

1. **Basic Info** - Title, bio, phone, location
2. **Skills & Languages** - Add/remove skills and languages
3. **Experience** - Work history with company and dates
4. **Education** - School, degree, dates
5. **Certifications** - Certifications earned
6. **Job Preferences** - Desired job types, locations, salary

**Features**:

- Upload profile picture (with circular display)
- Upload resume (PDF/DOC)
- Add/edit/remove experiences
- Real-time validation
- Save all changes to DB

---

### 11. **pages/JobSeekerProfileView.js** - View Job Seeker Profile

**Purpose**: Recruiters view job seeker profiles
**Shows**:

- Profile picture
- Contact info (if visibility enabled)
- Professional title
- Experience and education
- Skills and languages
- Resume download link
- Social media links

**Access Control**: Only recruiters/admins can view

---

### 12. **pages/AdminPanel.js** - Admin Dashboard

**Features**:

- User management (view, promote, demote, remove)
- Job moderation (approve/reject postings)
- Platform statistics
- Activity logs

**Permissions**: Admin only

---

### 13. **components/Navbar.js** - Navigation Bar

**Features**:

- Logo and branding
- Navigation links (conditional based on role)
- Search bar
- User menu with profile/logout
- Dark mode toggle
- Notification badge

**Conditional Rendering**:

- Job seeker: Dashboard, Browse Jobs, My Profile
- Recruiter: Dashboard, Post Job, Applicants
- Admin: Admin Panel

---

### 14. **components/SearchFilters.js** - Search & Filter Component

**Filters Available**:

- Location search
- Job type dropdown
- Salary range slider
- Skills multi-select
- Experience level

**Features**:

- Real-time search
- Filter combinations
- Clear all filters button
- Mobile responsive

---

### 15. **components/ApplicationForm.js** - Job Application Modal

**Fields**:

- Cover letter (textarea)
- Optional message
- Confirms before submission

**Validation**:

- Required fields
- Character limits
- File attachment validation (if resume attached)

---

### 16. **components/Toast.js** - Notifications

**Types**:

- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

**Features**:

- Auto-dismiss after 3 seconds
- Stacking multiple toasts
- Close button

---

### 17. **components/EmptyState.js** - Empty State UI

**Shows When**:

- No jobs found
- No applications
- No search results

**Features**:

- Icon + title + description
- Optional action button
- Encourages user action

---

### 18. **services/profileService.js** - Profile API Service

**Functions**:

- `getImageUrl()` - Constructs image URLs with cache-busting
- `getProfile()` - Fetch user profile
- `updateProfile()` - Update profile data
- `uploadProfilePicture()` - Upload avatar
- `uploadResume()` - Upload resume

**Cache Busting**: Adds timestamp query parameter to prevent stale cache

---

### 19. **utils/errorHandler.js** - Error Handling

**Functions**:

- `handleApiError()` - Parse API error messages
- `getErrorMessage()` - User-friendly error strings
- `logError()` - Log errors for debugging

---

### 20. **utils/validation.js** - Form Validation

**Validations**:

- Email format
- Password strength (min 8 chars, uppercase, number, special)
- Phone number format
- URL validation
- File size/type checking

---

### 21. **utils/sanitization.js** - XSS Prevention

**Functions**:

- `sanitizeInput()` - Remove malicious scripts
- `escapeTags()` - Escape HTML tags
- Prevents injection attacks

---

## Database Models

### User Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['jobseeker', 'recruiter', 'admin'],
  company: String,
  phone: String,
  profile: {
    profilePicture: String,
    title: String,
    bio: String,
    skills: [String],
    experience: [{ title, company, location, from, to, description }],
    education: [{ degree, institution, field, from, to }],
    resume: String,
    social: { linkedin, github, portfolio },
    preferences: { desiredJobTypes, expectedSalary }
  }
}
```

### Job Model

```javascript
{
  title: String,
  description: String,
  company: String,
  location: String,
  salary: String,
  jobType: ['full-time', 'part-time', 'contract'],
  skills: [String],
  recruiter: ObjectId (ref: User),
  status: ['pending', 'approved', 'rejected'],
  createdAt: Date,
  updatedAt: Date
}
```

### Application Model

```javascript
{
  job: ObjectId (ref: Job),
  jobSeeker: ObjectId (ref: User),
  status: ['pending', 'reviewed', 'shortlisted', 'rejected'],
  appliedAt: Date,
  message: String
}
```

---

## Authentication Flow

### Login Flow

```
1. User enters email/password
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend verifies credentials
   ↓
4. If valid: generate JWT token
   ↓
5. Return token to frontend
   ↓
6. Frontend stores token in AuthContext & localStorage
   ↓
7. Redirect to dashboard
```

### Protected Routes

```
1. User navigates to protected page
   ↓
2. Check AuthContext.token exists
   ↓
3. If no token: redirect to login
   ↓
4. If token exists: send with Authorization header
   ↓
5. Backend middleware verifies token
   ↓
6. If valid: process request
   ↓
7. If invalid/expired: return 401 Unauthorized
```

### Token Refresh

```
1. Token expires (24 hours)
   ↓
2. Frontend detects 401 response
   ↓
3. Send refresh token to /api/auth/refresh
   ↓
4. Backend generates new JWT
   ↓
5. Frontend updates token in state
```

---

## Key Features & Workflows

### Feature 1: Job Application Workflow

```
Job Seeker View Job → Click Apply → Fill Application Form
→ Submit → Database Stores Application → Notification Email Sent
→ Status: Pending → Recruiter Reviews → Updates Status
→ Job Seeker Notified of Status Change
```

### Feature 2: Job Posting Workflow (Recruiter)

```
Recruiter Login → Navigate to Post Job → Fill Job Form
→ Submit → Job Status: Pending (Admin Approval)
→ Admin Reviews → Approves/Rejects
→ If Approved: Visible in Job List
→ Recruiter Can View Applicants → Manage Statuses
```

### Feature 3: Profile Building

```
Job Seeker Register → Login → Edit Profile
→ Upload Picture & Resume → Add Experience/Education
→ Add Skills → Set Preferences → Save
→ Profile Visible to Recruiters →Recruiters Can Contact
```

### Feature 4: Search & Filter

```
User Searches "React Developer" + Location "NYC" + Salary "100k-150k"
→ Frontend sends filtered query to backend
→ Backend queries MongoDB with filters
→ Results returned and displayed with pagination
```

### Feature 5: File Upload & Display

```
User Uploads Profile Picture
→ Multer validates file (type, size)
→ File saved to /uploads directory
→ URL stored in MongoDB (profile.profilePicture)
→ Frontend fetches URL with cache-busting (?t=timestamp)
→ Image displays in circular component
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |
| POST   | `/api/auth/logout`   | Logout user       |
| POST   | `/api/auth/refresh`  | Refresh JWT token |

### Users

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| GET    | `/api/users/profile`                | Get current user profile |
| PUT    | `/api/users/profile`                | Update profile           |
| POST   | `/api/users/upload-profile-picture` | Upload avatar            |
| POST   | `/api/users/upload-resume`          | Upload resume            |
| GET    | `/api/users/:id/profile`            | View job seeker profile  |

### Jobs

| Method | Endpoint            | Description               |
| ------ | ------------------- | ------------------------- |
| GET    | `/api/jobs`         | List all jobs (paginated) |
| POST   | `/api/jobs`         | Create job posting        |
| GET    | `/api/jobs/:id`     | Get job details           |
| PUT    | `/api/jobs/:id`     | Update job                |
| DELETE | `/api/jobs/:id`     | Delete job                |
| GET    | `/api/jobs/my-jobs` | Get recruiter's jobs      |

### Applications

| Method | Endpoint                            | Description               |
| ------ | ----------------------------------- | ------------------------- |
| POST   | `/api/applications`                 | Submit application        |
| GET    | `/api/applications/my-applications` | Get user's applications   |
| GET    | `/api/applications/job/:jobId`      | Get job's applications    |
| PUT    | `/api/applications/:id`             | Update application status |

---

## Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt for password security
3. **Input Validation** - Client & server-side validation
4. **Sanitization** - XSS prevention
5. **Helmet** - HTTP security headers
6. **CORS** - Cross-origin protection
7. **File Upload Validation** - Whitelist file types, max size
8. **Rate Limiting** - DDoS protection (optional)
9. **Role-Based Access Control** - Different permissions per role
10. **Data Privacy** - Sensitive fields hidden in API responses

---

## Performance Optimizations

1. **Database Indexing** - Indexes on frequently queried fields
2. **Pagination** - Limit results per page
3. **Lazy Loading** - Load components on demand
4. **Image Optimization** - Circular CSS instead of large images
5. **Cache-Busting** - Query parameters for fresh file loads
6. **Compression** - GZIP enabled on backend
7. **Code Splitting** - React lazy loading for routes
8. **API Response Caching** - LocalStorage for non-sensitive data

---

## Testing (For Viva)

### Test Scenarios to Prepare

1. **User Registration** - With valid/invalid data
2. **Login/Logout** - Session management
3. **Profile Update** - Data persistence
4. **Job Posting** - CRUD operations
5. **Job Application** - End-to-end flow
6. **Search & Filter** - Query accuracy
7. **File Upload** - Validation and storage
8. **Error Handling** - Invalid requests, auth failures

---

## Deployment

### Backend

- Host on: Render, Heroku, AWS EC2
- Database: MongoDB Atlas
- Environment variables: .env file

### Frontend

- Build: `npm run build`
- Host on: Vercel, Netlify, GitHub Pages
- Environment variables: .env.production

---

## Common Interview Questions

Q1: **How is authentication implemented?**
A: JWT tokens with refresh mechanism. On login, a token is generated and stored. Protected routes verify token validity.

Q2: **How are files stored?**
A: Uploaded files are validated and stored in /uploads directory. URLs are saved in MongoDB with cache-busting query parameters.

Q3: **How do you prevent XSS attacks?**
A: Input sanitization, HTML escaping, Content Security Policy headers, and validating file uploads.

Q4: **Explain the job application workflow.**
A: User submits application → stored in DB with pending status → recruiter reviews → status updated → notifications sent.

Q5: **How is profile information protected?**
A: Role-based API responses, visibility settings, encrypted passwords, and secure headers.

---

## Troubleshooting

| Issue                     | Solution                                                |
| ------------------------- | ------------------------------------------------------- |
| Image not showing         | Check file path, verify CORS headers, add cache-busting |
| 401 Unauthorized          | Check token validity, refresh token, re-login           |
| Form validation fails     | Check validation rules, sanitization functions          |
| Database connection error | Verify MongoDB URI, network access                      |
| CORS errors               | Update allowed origins in server.js                     |

---

**Last Updated**: March 27, 2026
**Version**: 1.0
**Author**: Job Portal Development Team
