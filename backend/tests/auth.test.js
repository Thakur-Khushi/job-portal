const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('./testApp');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});

afterEach(async () => {
  const cols = mongoose.connection.collections;
  for (const key in cols) await cols[key].deleteMany({});
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SECURITY_QUESTIONS = [
  { question: "What is your favorite color?", answer: "blue" },
  { question: "What is your favorite food?", answer: "pizza" },
];

async function registerUser(overrides = {}) {
  const payload = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'jobseeker',
    securityQuestions: SECURITY_QUESTIONS,
    ...overrides,
  };
  return request(app).post('/api/auth/register').send(payload);
}

async function loginUser(email = 'test@example.com', password = 'password123') {
  return request(app).post('/api/auth/login').send({ email, password });
}

// ---------------------------------------------------------------------------
// REGISTRATION
// ---------------------------------------------------------------------------
describe('POST /api/auth/register', () => {
  test('registers a new jobseeker successfully', async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.msg).toMatch(/Registration successful/i);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.role).toBe('jobseeker');
    // password must NOT be returned
    expect(res.body.user.password).toBeUndefined();
  });

  test('registers a recruiter with company name', async () => {
    const res = await registerUser({
      role: 'recruiter',
      company: 'Acme Corp',
      email: 'recruiter@example.com',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('recruiter');
  });

  test('rejects missing name', async () => {
    const res = await registerUser({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/name/i);
  });

  test('rejects missing email', async () => {
    const res = await registerUser({ email: '' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/email/i);
  });

  test('rejects password shorter than 6 characters', async () => {
    const res = await registerUser({ password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/password/i);
  });

  test('rejects invalid role (admin self-registration)', async () => {
    const res = await registerUser({ role: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/invalid role/i);
  });

  test('rejects recruiter without company name', async () => {
    const res = await registerUser({ role: 'recruiter', company: '', email: 'r2@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/company/i);
  });

  test('rejects fewer than 2 security questions', async () => {
    const res = await registerUser({ securityQuestions: [SECURITY_QUESTIONS[0]] });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/security questions/i);
  });

  test('rejects duplicate security questions', async () => {
    const res = await registerUser({
      securityQuestions: [SECURITY_QUESTIONS[0], SECURITY_QUESTIONS[0]],
    });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/different/i);
  });

  test('rejects invalid security question not in allowed list', async () => {
    const res = await registerUser({
      securityQuestions: [
        { question: 'What is your age?', answer: '25' },
        SECURITY_QUESTIONS[1],
      ],
    });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/invalid security question/i);
  });

  test('rejects duplicate email', async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/user already exists/i);
  });

  test('email is stored as lowercase', async () => {
    const res = await registerUser({ email: 'UPPER@EXAMPLE.COM' });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('upper@example.com');
  });
});

// ---------------------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------------------
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await registerUser();
  });

  test('logs in with valid credentials', async () => {
    const res = await loginUser();
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe('test@example.com');
    // password must NOT be returned
    expect(res.body.user.password).toBeUndefined();
  });

  test('rejects missing email', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'password123' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/email/i);
  });

  test('rejects missing password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/password/i);
  });

  test('rejects wrong password with generic message', async () => {
    const res = await loginUser('test@example.com', 'wrongpassword');
    expect(res.status).toBe(400);
    // Must use generic message — not "wrong password" which leaks info
    expect(res.body.msg).toBe('Invalid credentials');
  });

  test('rejects non-existent email with generic message', async () => {
    const res = await loginUser('nobody@example.com', 'password123');
    expect(res.status).toBe(400);
    expect(res.body.msg).toBe('Invalid credentials');
  });

  test('login is case-insensitive for email', async () => {
    const res = await loginUser('TEST@EXAMPLE.COM', 'password123');
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// GET /me
// ---------------------------------------------------------------------------
describe('GET /api/auth/me', () => {
  test('returns user data with valid token', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const token = loginRes.body.accessToken;

    const res = await request(app).get('/api/auth/me').set('x-auth-token', token);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
    expect(res.body.password).toBeUndefined();
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('returns 401 with invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('x-auth-token', 'invalid.token.here');
    expect(res.status).toBe(401);
  });

  test('supports Authorization: Bearer token format', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const token = loginRes.body.accessToken;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// REFRESH TOKEN
// ---------------------------------------------------------------------------
describe('POST /api/auth/refresh-token', () => {
  test('issues new access token with valid refresh token', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const { refreshToken } = loginRes.body;

    const res = await request(app).post('/api/auth/refresh-token').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  test('rejects missing refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh-token').send({});
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/refresh token/i);
  });

  test('rejects invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh-token').send({ refreshToken: 'fakeinvalidtoken' });
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------------------
describe('POST /api/auth/logout', () => {
  test('logs out and invalidates refresh token', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const { accessToken, refreshToken } = loginRes.body;

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('x-auth-token', accessToken)
      .send({ refreshToken });
    expect(logoutRes.status).toBe(200);

    // Refresh token should now be invalid
    const refreshRes = await request(app).post('/api/auth/refresh-token').send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// PASSWORD RESET FLOW
// ---------------------------------------------------------------------------
describe('Password Reset Flow', () => {
  beforeEach(async () => {
    await registerUser();
  });

  test('forgot-password returns questions for valid email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'test@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.questions).toBeInstanceOf(Array);
    expect(res.body.questions).toHaveLength(2);
  });

  test('forgot-password returns null questions for unknown email (prevents enumeration)', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.questions).toBeNull();
  });

  test('forgot-password returns 400 when email is missing', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});
    expect(res.status).toBe(400);
  });

  test('verify-security-answers issues reset token with correct answers', async () => {
    const res = await request(app).post('/api/auth/verify-security-answers').send({
      email: 'test@example.com',
      answers: ['blue', 'pizza'],
    });
    expect(res.status).toBe(200);
    expect(res.body.resetToken).toBeDefined();
  });

  test('verify-security-answers rejects wrong answers', async () => {
    const res = await request(app).post('/api/auth/verify-security-answers').send({
      email: 'test@example.com',
      answers: ['wrong', 'answers'],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/incorrect/i);
  });

  test('full reset flow: verify → reset → login with new password', async () => {
    const verifyRes = await request(app).post('/api/auth/verify-security-answers').send({
      email: 'test@example.com',
      answers: ['blue', 'pizza'],
    });
    const { resetToken } = verifyRes.body;

    const resetRes = await request(app).post('/api/auth/reset-password').send({
      token: resetToken,
      newPassword: 'newpassword456',
    });
    expect(resetRes.status).toBe(200);
    expect(resetRes.body.msg).toMatch(/reset successfully/i);

    // Old password should no longer work
    const oldLogin = await loginUser('test@example.com', 'password123');
    expect(oldLogin.status).toBe(400);

    // New password should work
    const newLogin = await loginUser('test@example.com', 'newpassword456');
    expect(newLogin.status).toBe(200);
  });

  test('reset-password rejects short new password', async () => {
    const verifyRes = await request(app).post('/api/auth/verify-security-answers').send({
      email: 'test@example.com',
      answers: ['blue', 'pizza'],
    });
    const { resetToken } = verifyRes.body;

    const res = await request(app).post('/api/auth/reset-password').send({
      token: resetToken,
      newPassword: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/6 characters/i);
  });

  test('reset-password rejects invalid token', async () => {
    const res = await request(app).post('/api/auth/reset-password').send({
      token: 'completely-fake-token',
      newPassword: 'newpassword456',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid or expired/i);
  });
});
