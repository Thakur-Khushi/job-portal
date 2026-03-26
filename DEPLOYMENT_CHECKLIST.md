# Quick Deployment Checklist - Free Hosting

Complete these steps in order to deploy your Job Portal for free.

---

## ✅ STEP 1: Prepare Local Code (5 minutes)

- [ ] Open backend folder: `cd backend`
- [ ] Install Cloudinary packages: `npm install`
- [ ] Close and restart terminal (to refresh npm cache)

---

## ✅ STEP 2: Setup MongoDB Atlas (10 minutes)

1. [ ] Go to https://www.mongodb.com/cloud/atlas
2. [ ] Create free account
3. [ ] Create free "Shared" cluster (takes 5-10 mins)
4. [ ] Create database user:
   - Username: `jobportal_user`
   - Password: (copy to notepad!) ➜ **SAVE THIS**
5. [ ] Go to "Network Access" → Add IP: `0.0.0.0/0`
6. [ ] Go to "Databases" → Click "Connect" → "Drivers"
7. [ ] Copy connection string
8. [ ] Replace placeholders with your username and password
   - Example: `mongodb+srv://jobportal_user:PASSWORD123@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority`
9. [ ] **SAVE CONNECTION STRING**

➜ **MONGODB_URI** = Your connection string

---

## ✅ STEP 3: Setup Cloudinary (5 minutes)

1. [ ] Go to https://cloudinary.com/users/register/free
2. [ ] Sign up with email
3. [ ] Go to Dashboard
4. [ ] Copy three values:
   - **Cloud Name**: Shown at top ➜ **SAVE THIS**
   - **API Key**: On dashboard ➜ **SAVE THIS**
   - **API Secret**: Dashboard Settings → API Keys ➜ **SAVE THIS**

---

## ✅ STEP 4: Get Gmail App Password (5 minutes)

1. [ ] Go to https://myaccount.google.com
2. [ ] Enable 2-Factor Authentication (if not enabled)
3. [ ] Go to https://myaccount.google.com/apppasswords
4. [ ] Select "Mail" and "Windows PC"
5. [ ] Copy 16-character password
6. [ ] Your Gmail: your-email@gmail.com ➜ **SAVE THIS**
7. [ ] Gmail App Password: 16-chars ➜ **SAVE THIS**

---

## ✅ STEP 5: Generate Strong Secrets

1. [ ] Open terminal and run:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. [ ] Copy and run it twice (for JWT_SECRET and JWT_REFRESH_SECRET)
3. [ ] **SAVE BOTH SECRETS**

Example output:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9
```

---

## ✅ STEP 6: Push Code to GitHub (5 minutes)

1. [ ] Open terminal in: `e:\Khushi\workspace\job-protal\job-portal`
2. [ ] Run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Job Portal ready for deployment"
   ```
3. [ ] Go to https://github.com/new
4. [ ] Repository name: `job-portal`
5. [ ] **DO NOT** initialize with README (you have files already)
6. [ ] Click "Create repository"
7. [ ] Copy commands and run:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/job-portal.git
   git branch -M main
   git push -u origin main
   ```

---

## ✅ STEP 7: Deploy Backend on Render.com (15 minutes)

1. [ ] Go to https://render.com
2. [ ] Sign up (with GitHub recommended)
3. [ ] Click Dashboard → "New" → "Web Service"
4. [ ] Select your `job-portal` repository
5. [ ] Fill form:
   - **Name**: `jobportal-api`
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Region**: Closest to you
   - **Plan**: Free
6. [ ] Click "Create Web Service"
7. [ ] Wait for it to start (takes 2-5 minutes)
8. [ ] Copy your backend URL: `https://jobportal-api-xxxxx.onrender.com`

### Add Environment Variables:

1. [ ] In Render dashboard, go to "Environment"
2. [ ] Click "Add Environment Variable" and add:

```
MONGODB_URI
mongodb+srv://jobportal_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority

JWT_SECRET
your-32-char-random-secret-here

JWT_REFRESH_SECRET
your-32-char-random-secret-here

CLOUDINARY_NAME
your-cloudinary-cloud-name

CLOUDINARY_API_KEY
your-cloudinary-api-key

CLOUDINARY_API_SECRET
your-cloudinary-api-secret

GMAIL_USER
your-email@gmail.com

GMAIL_PASS
your-16-char-app-password

CORS_ORIGIN
https://jobportal-frontend-xxxxx.onrender.com

NODE_ENV
production

PORT
10000
```

3. [ ] Click "Save"
4. [ ] Render auto-redeploys
5. [ ] Wait for green "Live" status

---

## ✅ STEP 8: Deploy Frontend on Render (10 minutes)

1. [ ] Render Dashboard → "New" → "Static Site"
2. [ ] Select your `job-portal` repository
3. [ ] Fill form:
   - **Name**: `jobportal-frontend`
   - **Branch**: main
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
4. [ ] Click "Create Static Site"
5. [ ] Wait for deployment (2-5 minutes)
6. [ ] Copy your frontend URL: `https://jobportal-frontend-xxxxx.onrender.com`

---

## ✅ STEP 9: Update Backend CORS

1. [ ] Go back to backend service (jobportal-api)
2. [ ] Click "Environment"
3. [ ] Update `CORS_ORIGIN` with your frontend URL:
   ```
   https://jobportal-frontend-xxxxx.onrender.com
   ```
4. [ ] Save
5. [ ] Auto-redeploys

---

## 🧪 STEP 10: Test Everything

### Test Backend API:

```bash
curl https://jobportal-api-xxxxx.onrender.com/api/jobs
# Should return JSON, not an error
```

### Test Frontend:

1. [ ] Open https://jobportal-frontend-xxxxx.onrender.com
2. [ ] Try to Register
3. [ ] Try to Login
4. [ ] Try uploading a resume (test Cloudinary)

### Verify Database:

1. [ ] Go to MongoDB Atlas
2. [ ] Click on your cluster → "Collections"
3. [ ] You should see `users`, `jobs`, `applications`, `refreshtokens` collections

---

## 🎉 CONGRATULATIONS!

Your Job Portal is now live and free!

**Share these URLs with your professors:**

- **Frontend**: https://jobportal-frontend-xxxxx.onrender.com
- **Backend API**: https://jobportal-api-xxxxx.onrender.com

---

## 📝 If Something Goes Wrong

### Backend not deploying?

1. Check Render logs (click on service → "Logs")
2. Common issues:
   - Missing environment variables
   - npm install fails (check package.json)
   - MongoDB connection error (check connection string)

### Frontend showing blank?

1. Check browser console (F12)
2. Common issues:
   - Backend API URL is wrong
   - CORS not allowing frontend domain

### Files not uploading?

1. Check Cloudinary credentials are correct
2. Check file size < 5MB
3. Check file type is allowed (PDF, DOC, JPG, PNG)

---

## 🔄 How to Update After Deployment

After you make changes locally:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render auto-deploys in 2-5 minutes! ✅

---

**Estimated Total Time**: 45-60 minutes  
**Total Cost**: $0
