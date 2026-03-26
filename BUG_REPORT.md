# 🐛 Job Portal - Bug Report & Issues Found

**Date**: March 26, 2026  
**Analysis**: Complete codebase review  
**Status**: 8 Bugs Found (4 Critical, 2 High, 2 Medium)

---

## 🔴 CRITICAL BUGS (Need Immediate Fix)

### BUG #1: Hardcoded API URLs in Frontend ❌

**Severity**: CRITICAL  
**File**: `frontend/src/pages/JobDetail.js` (lines 60, 68, 76, 91, 98)  
**Problem**:

```javascript
// BAD - Hardcoded URLs:
const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
const res = await axios.get(
  `http://localhost:5000/api/jobs?category=${category}&limit=3`,
);
const res = await axios.get(`http://localhost:5000/api/applications/job/${id}`);
```

**Impact**:

- ❌ Won't work in production
- ❌ Frontend stuck on localhost:5000
- ❌ Will break when deployed

**Fix**:

```javascript
// GOOD - Use environment variable:
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const res = await axios.get(`${API_URL}/jobs/${id}`);
```

---

### BUG #2: Unsafe JSON.parse() Without Try-Catch ❌

**Severity**: CRITICAL  
**File**: `backend/routes/applications.js` (line 85)  
**Problem**:

```javascript
applicationData: applicationData ? JSON.parse(applicationData) : {},
```

**Impact**:

- ❌ If `applicationData` is invalid JSON, the entire request crashes
- ❌ Server error instead of validation error
- ❌ User gets 500 error instead of helpful message

**Fix**:

```javascript
let parsedData = {};
if (applicationData) {
  try {
    parsedData = JSON.parse(applicationData);
  } catch (e) {
    return res.status(400).json({ msg: 'Invalid applicationData format' });
  }
}
applicationData: parsedData,
```

---

### BUG #3: Missing Error Handling in Frontend API Calls ❌

**Severity**: CRITICAL  
**File**: `frontend/src/pages/JobDetail.js` (lines 60-65)  
**Problem**:

```javascript
const fetchSimilarJobs = async (category, location) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/jobs?category=${category}&limit=3`,
    );
    setSimilarJobs(res.data.filter((j) => j._id !== id).slice(0, 3));
  } catch (err) {
    console.error('Error fetching similar jobs:', err);
    // NO ERROR STATE SET - UI doesn't know if it failed!
  }
};
```

**Impact**:

- ❌ Similar jobs fail silently
- ❌ User doesn't know if it failed
- ❌ No retry option

**Fix**:

```javascript
const [similarJobsError, setSimilarJobsError] = useState('');

const fetchSimilarJobs = async (category, location) => {
  try {
    setSimilarJobsError('');
    const res = await axios.get(`${API_URL}/jobs?category=${category}&limit=3`);
    setSimilarJobs(res.data.filter((j) => j._id !== id).slice(0, 3));
  } catch (err) {
    setSimilarJobsError('Failed to load similar jobs');
    console.error('Error fetching similar jobs:', err);
  }
};
```

---

### BUG #4: Debug Console Logs Left in Production Code ❌

**Severity**: CRITICAL  
**File**: `backend/routes/applications.js` (lines 10-85)  
**Problem**:

```javascript
console.log('=== HANDLER REACHED ===');
console.log('=== NEW APPLICATION REQUEST ===');
console.log('req.user:', req.user);
console.log('req.body:', req.body); // SECURITY RISK - logs sensitive data
console.log('req.file:', req.file);
// ... 20+ more console.log statements
```

**Impact**:

- 🔒 **SECURITY RISK** - Sensitive user data logged to console
- ❌ Production logs will be cluttered
- ❌ Performance impact from excessive logging

**Fix**:
Remove all debug logs or replace with:

```javascript
// Use proper logging library
const logger = require('winston'); // or similar

if (process.env.NODE_ENV === 'development') {
  logger.debug('Application created:', { userId: req.user.id });
}
```

---

## 🟠 HIGH SEVERITY BUGS

### BUG #5: Missing Auth Check on Job Fetch Route ⚠️

**Severity**: HIGH  
**File**: `backend/routes/jobs.js` (line 5-29)  
**Problem**:

```javascript
// GET /api/jobs - No auth required, shows all jobs
router.get('/', async (req, res) => {  // NO AUTH MIDDLEWARE
  // Returns all approved jobs to anyone
```

**Impact**:

- ⚠️ Anyone can spam requests
- ⚠️ No rate limiting on this endpoint
- ⚠️ Different from /my-jobs which has auth

**Fix**:

```javascript
// Optional: Add rate limiting for public endpoint
router.get('/', publicJobsLimiter, async (req, res) => {
  // Or add auth if jobs should be private
```

---

### BUG #6: No Validation on Resume File Extension ⚠️

**Severity**: HIGH  
**File**: `backend/middleware/upload.js` (lines ~40-50)  
**Problem**:
The code checks MIME types, but file extensions could be spoofed:

```javascript
// Only checks file extension regex, doesn't validate actual file content
const isValidExt = /\.(pdf|doc|docx|jpg|jpeg|png)$/.test(fileExt);
```

**Impact**:

- ⚠️ User could upload .pdf.exe → bypasses validation
- ⚠️ Malicious files could be served back to users
- ⚠️ Server could execute code

**Fix**:

```javascript
// Check magic numbers (file headers)
const fileType = require('file-type');

const type = await fileType.fromBuffer(file.buffer);
const validTypes = [
  'application/pdf',
  'application/msword',
  'image/jpeg',
  'image/png',
];
if (!validTypes.includes(type?.mime)) {
  return cb(new Error('Invalid file type'));
}
```

---

## 🟡 MEDIUM SEVERITY BUGS

### BUG #7: Inconsistent Refresh Token Field Names ⚠️

**Severity**: MEDIUM  
**File**: `backend/routes/auth.js` (line 28)  
**Problem**:

```javascript
const tokenDoc = new RefreshToken({
  userId,
  token: refreshTokenHash,
  tokenHash: refreshTokenHash, // DUPLICATE - same as token!
  expiresAt,
});
```

**Impact**:

- ⚠️ Storing same hash twice wastes database space
- ⚠️ Confusing for future developers
- ⚠️ May cause bugs in token validation

**Fix**:

```javascript
const tokenDoc = new RefreshToken({
  userId,
  token: refreshTokenHash, // Remove tokenHash field
  expiresAt,
});
```

---

### BUG #8: Missing Null Checks in Profile Display ⚠️

**Severity**: MEDIUM  
**File**: `frontend/src/pages/JobDetail.js` (line ~180)  
**Problem**:

```javascript
// Accessing nested properties without checking if parent exists
job.postedBy._id  // What if job.postedBy is null?
res.data.filter(...) // What if res.data is not an array?
```

**Impact**:

- ⚠️ Runtime errors if data structure is unexpected
- ⚠️ Component crashes if API returns different format

**Fix**:

```javascript
// Safe navigation:
job?.postedBy?._id || 'unknown'
res.data?.jobs?.filter(...) || []
```

---

## 📊 Bug Summary Table

| #   | Bug                      | Severity    | File            | Type         | Impact                         |
| --- | ------------------------ | ----------- | --------------- | ------------ | ------------------------------ |
| 1   | Hardcoded API URLs       | 🔴 CRITICAL | JobDetail.js    | Config       | Won't work in production       |
| 2   | Unsafe JSON.parse()      | 🔴 CRITICAL | applications.js | Logic        | Server crashes on invalid data |
| 3   | Missing Error Handling   | 🔴 CRITICAL | JobDetail.js    | UX           | Silent failures                |
| 4   | Debug Logs in Production | 🔴 CRITICAL | applications.js | Security     | Leaks sensitive data           |
| 5   | No Auth on Job Endpoint  | 🟠 HIGH     | jobs.js         | Security     | Spam vulnerability             |
| 6   | File Type Validation     | 🟠 HIGH     | upload.js       | Security     | Malicious file upload          |
| 7   | Duplicate Token Fields   | 🟡 MEDIUM   | auth.js         | Code Quality | Wastes space/confusing         |
| 8   | Missing Null Checks      | 🟡 MEDIUM   | JobDetail.js    | Reliability  | Runtime errors                 |

---

## 🔧 Quick Fix Priority

### Immediate (Today):

1. ✅ Remove debug console.logs (BUG #4)
2. ✅ Add try-catch to JSON.parse (BUG #2)
3. ✅ Fix hardcoded URLs (BUG #1)

### This Week:

4. ✅ Add error states to API calls (BUG #3)
5. ✅ Remove duplicate token field (BUG #7)
6. ✅ Add null checks (BUG #8)

### Before Production:

7. ✅ Implement file content validation (BUG #6)
8. ✅ Add rate limiting (BUG #5)

---

## ✅ What's Working Well

✅ Password hashing (bcryptjs)  
✅ JWT authentication  
✅ Rate limiting on auth endpoints  
✅ Database connection pooling  
✅ CORS configuration  
✅ File upload validation (basic)  
✅ Role-based access control  
✅ Error middleware

---

## 📝 Recommendations

1. **Use environment variables** for all API URLs
2. **Remove all console.log statements** or use proper logging library
3. **Add request validation** using express-validator
4. **Implement TypeScript** to catch null reference errors
5. **Add integration tests** to catch these issues automatically
6. **Use linting tools** (ESLint) to catch common mistakes

---

**Report Generated**: March 26, 2026 | **Tester**: Code Analysis
