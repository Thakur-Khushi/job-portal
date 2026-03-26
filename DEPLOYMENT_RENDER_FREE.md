# Deployment Guide: Free Hosting on Render.com + MongoDB Atlas + Cloudinary

**Total Cost**: $0 (Free tier)  
**Estimated Time**: 30-45 minutes

---

## 📋 Prerequisites

✅ GitHub account (to push code)  
✅ Render.com account (create free)  
✅ MongoDB Atlas account (create free)  
✅ Cloudinary account (create free)  
✅ Your code ready to push

---

## Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with email
4. Verify email

### 1.2 Create Free Cluster

1. Select "Shared" cluster (Free tier)
2. Choose AWS, region closest to you
3. Click "Create Cluster" (takes 5-10 minutes)
4. Wait for deployment

### 1.3 Create Database User

1. Go to "Security" → "Database Access"
2. Click "Add New Database User"
3. Username: `jobportal_user`
4. Password: Generate strong password (copy it!)
5. Built-in Role: "Atlas admin"
6. Click "Add User"

### 1.4 Whitelist IP Address

1. Go to "Security" → "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String

1. Go to "Database" → Clusters
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Copy connection string
5. Replace `<username>` and `<password>` with your credentials
6. Replace `myFirstDatabase` with `jobportal`

**Example**:

```
mongodb+srv://jobportal_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority
```

✅ **Save this connection string!**

---

## Step 2: Setup Cloudinary (File Storage)

### 2.1 Create Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up with email
3. Verify email

### 2.2 Get API Credentials

1. Go to Dashboard
2. Copy these values:
   - **Cloud Name**: Under your name at top
   - **API Key**: Shown on dashboard
   - **API Secret**: Click "Settings" → "API Keys"

✅ **Save all three values!**

---

## Step 3: Push Code to GitHub

### 3.1 Initialize Git (if not done)

```bash
cd e:\Khushi\workspace\job-protal\job-portal
git init
git add .
git commit -m "Initial commit: Job Portal ready for deployment"
```

### 3.2 Create GitHub Repo

1. Go to https://github.com/new
2. Repository name: `job-portal`
3. Click "Create repository"
4. Follow the instructions to push local code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/job-portal.git
git branch -M main
git push -u origin main
```

✅ **Code is now on GitHub!**

---

## Step 4: Deploy Backend on Render.com

### 4.1 Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize GitHub access

### 4.2 Create Web Service

1. Dashboard → "New" → "Web Service"
2. Select your `job-portal` repository
3. **Name**: `jobportal-api`
4. **Environment**: Node
5. **Build Command**: `cd backend && npm install`
6. **Start Command**: `cd backend && node server.js`
7. **Region**: Choose closest to you
8. Plan: Free

### 4.3 Add Environment Variables

1. Click on the service
2. Go to "Environment"
3. Add these variables:

```
MONGODB_URI=mongodb+srv://jobportal_user:PASSWORD_HERE@cluster0.xxxxx.mongodb.net/jobportal?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-min-32-chars-random

JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

CLOUDINARY_NAME=your_cloudinary_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret

GMAIL_USER=your-email@gmail.com

GMAIL_PASS=your-app-specific-password

CORS_ORIGIN=https://jobportal-frontend.onrender.com

NODE_ENV=production

PORT=10000
```

**Get Gmail Password**:

1. Enable 2FA on Gmail
2. Go to myaccount.google.com/apppasswords
3. Select Mail & Windows
4. Copy 16-char password

### 4.4 Deploy

1. Click "Deploy"
2. Wait 5-10 minutes
3. Your API URL: `https://jobportal-api.onrender.com`

✅ **Backend is live!**

---

## Step 5: Update Backend for Cloudinary

Update `/backend/middleware/upload.js`:

```javascript
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'jobportal',
  allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  public_id: (req, file) => {
    return `${Date.now()}-${file.originalname}`;
  },
});

const upload = multer({ storage });
module.exports = upload;
```

**Install package**:

```bash
cd backend
npm install multer-storage-cloudinary
```

**Commit and push**:

```bash
git add .
git commit -m "Add Cloudinary file storage"
git push
```

✅ **Backend will auto-redeploy!**

---

## Step 6: Deploy Frontend on Render

### 6.1 Create Static Site

1. Render Dashboard → "New" → "Static Site"
2. **Name**: `jobportal-frontend`
3. **Branch**: main
4. **Build Command**: `cd frontend && npm install && npm run build`
5. **Publish Directory**: `frontend/build`

### 6.2 Environment Variables

Create `/frontend/.env.production`:

```
REACT_APP_API_URL=https://jobportal-api.onrender.com
```

### 6.3 Deploy

1. Click "Deploy"
2. Wait 5-10 minutes
3. Your Frontend URL: `https://jobportal-frontend.onrender.com`

✅ **Frontend is live!**

---

## Step 7: Update Backend CORS

1. Go back to backend service on Render
2. Update `CORS_ORIGIN` to actual frontend URL
3. Service auto-redeploys

---

## 🧪 Testing Your Deployment

### Test Backend API

```bash
curl https://jobportal-api.onrender.com/api/jobs
# Should return JSON
```

### Test Frontend

1. Open https://jobportal-frontend.onrender.com
2. Try to register
3. Login
4. Try uploading resume (should work with Cloudinary)

### Test Database

1. Create an account
2. Check MongoDB Atlas → Database → collections
3. You should see `users` collection with new user

### Troubleshooting

- **API not responding**: Check Render logs
- **Database connection error**: Verify MongoDB URI and IP whitelist
- **File upload failing**: Verify Cloudinary credentials
- **CORS errors**: Make sure `CORS_ORIGIN` matches frontend URL

---

## 📊 Deployment Summary

| Component    | Platform      | URL                                     | Cost   |
| ------------ | ------------- | --------------------------------------- | ------ |
| Backend API  | Render        | https://jobportal-api.onrender.com      | Free   |
| Frontend     | Render        | https://jobportal-frontend.onrender.com | Free   |
| Database     | MongoDB Atlas | Cloud                                   | Free   |
| File Storage | Cloudinary    | Cloud                                   | Free   |
| **TOTAL**    | -             | -                                       | **$0** |

---

## ⚠️ Free Tier Limitations

- **Render Backend**: Spins down after 15 mins of inactivity (slow first request)
- **MongoDB**: 512MB storage limit
- **Cloudinary**: 25GB/month bandwidth
- **Render Static**: Limited to 100GB/month bandwidth

**For college demo**: These limits are MORE than enough! ✅

---

## 🔄 How to Update Your Project

After deployment, to make changes:

```bash
# Make changes locally
# Push to GitHub
git add .
git commit -m "Your changes"
git push origin main

# Render auto-deploys in 2-5 minutes
```

---

## 📞 Support

- Render Issues: https://render.com/docs
- MongoDB Issues: https://docs.mongodb.com
- Cloudinary Issues: https://cloudinary.com/documentation

---

**🎉 You're deployed! Share your project with professors!**
