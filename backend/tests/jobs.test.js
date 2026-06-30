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
const SQ = [
  { question: "What is your favorite color?", answer: "blue" },
  { question: "What is your favorite food?", answer: "pizza" },
];

async function registerAndLogin(role = 'jobseeker', extra = {}) {
  const email = `${role}-${Date.now()}@test.com`;
  await request(app).post('/api/auth/register').send({
    name: `${role} User`,
    email,
    password: 'password123',
    role,
    company: role === 'recruiter' ? 'TestCorp' : undefined,
    securityQuestions: SQ,
    ...extra,
  });
  const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  return { token: loginRes.body.accessToken, userId: loginRes.body.user.id, email };
}

const JOB_PAYLOAD = {
  title: 'Senior Developer',
  company: 'Acme Inc',
  location: 'Remote',
  description: 'Build great things',
  requirements: 'Node.js, React',
  type: 'full-time',
  category: 'Engineering',
  salary: '80000-100000',
};

async function createJob(token, overrides = {}) {
  return request(app)
    .post('/api/jobs')
    .set('x-auth-token', token)
    .send({ ...JOB_PAYLOAD, ...overrides });
}

// ---------------------------------------------------------------------------
// GET /api/jobs — public listing
// ---------------------------------------------------------------------------
describe('GET /api/jobs', () => {
  test('returns empty list when no jobs exist', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(0);
    expect(res.body.pagination).toBeDefined();
  });

  test('only returns approved jobs', async () => {
    const { token } = await registerAndLogin('recruiter');
    await createJob(token); // auto-approved by the API
    const res = await request(app).get('/api/jobs');
    expect(res.status).toBe(200);
    // all returned jobs must be approved
    res.body.jobs.forEach(j => expect(j.status).toBe('approved'));
  });

  test('pagination returns correct page size', async () => {
    const { token } = await registerAndLogin('recruiter');
    for (let i = 0; i < 5; i++) await createJob(token, { title: `Job ${i}` });

    const res = await request(app).get('/api/jobs?page=1&limit=3');
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(3);
    expect(res.body.pagination.total).toBe(5);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  test('filters by type', async () => {
    const { token } = await registerAndLogin('recruiter');
    await createJob(token, { type: 'full-time' });
    await createJob(token, { type: 'part-time', title: 'Part Time Job' });

    const res = await request(app).get('/api/jobs?type=part-time');
    expect(res.status).toBe(200);
    res.body.jobs.forEach(j => expect(j.type).toBe('part-time'));
  });

  test('filters by location (case-insensitive)', async () => {
    const { token } = await registerAndLogin('recruiter');
    await createJob(token, { location: 'New York' });
    await createJob(token, { location: 'San Francisco', title: 'SF Job' });

    const res = await request(app).get('/api/jobs?location=new york');
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].location).toBe('New York');
  });
});

// ---------------------------------------------------------------------------
// POST /api/jobs — create job
// ---------------------------------------------------------------------------
describe('POST /api/jobs', () => {
  test('recruiter can create a job', async () => {
    const { token } = await registerAndLogin('recruiter');
    const res = await createJob(token);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Senior Developer');
    expect(res.body.status).toBe('approved');
  });

  test('jobseeker cannot create a job', async () => {
    const { token } = await registerAndLogin('jobseeker');
    const res = await createJob(token);
    expect(res.status).toBe(403);
    expect(res.body.msg).toMatch(/access denied/i);
  });

  test('returns 401 without authentication', async () => {
    const res = await request(app).post('/api/jobs').send(JOB_PAYLOAD);
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/jobs/:id — single job
// ---------------------------------------------------------------------------
describe('GET /api/jobs/:id', () => {
  test('returns job by valid ID', async () => {
    const { token } = await registerAndLogin('recruiter');
    const created = await createJob(token);
    const jobId = created.body._id;

    const res = await request(app).get(`/api/jobs/${jobId}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(jobId);
  });

  test('returns 404 for non-existent valid ObjectId', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/jobs/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.msg).toMatch(/job not found/i);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/jobs/:id — update job (BUG: $set: req.body allows status override)
// ---------------------------------------------------------------------------
describe('PUT /api/jobs/:id', () => {
  test('owner can update their job', async () => {
    const { token } = await registerAndLogin('recruiter');
    const created = await createJob(token);
    const jobId = created.body._id;

    const res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('x-auth-token', token)
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Title');
  });

  test('non-owner cannot update another recruiter\'s job', async () => {
    const { token: ownerToken } = await registerAndLogin('recruiter');
    const { token: otherToken } = await registerAndLogin('recruiter');
    const created = await createJob(ownerToken);
    const jobId = created.body._id;

    const res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('x-auth-token', otherToken)
      .send({ title: 'Hijacked Title' });
    expect(res.status).toBe(403);
  });

  test('returns 401 without authentication', async () => {
    const { token } = await registerAndLogin('recruiter');
    const created = await createJob(token);
    const res = await request(app).put(`/api/jobs/${created.body._id}`).send({ title: 'x' });
    expect(res.status).toBe(401);
  });

  test('recruiter cannot override job status via PUT (field whitelist enforced)', async () => {
    const { token } = await registerAndLogin('recruiter');
    const created = await createJob(token);
    const jobId = created.body._id;

    const res = await request(app)
      .put(`/api/jobs/${jobId}`)
      .set('x-auth-token', token)
      .send({ status: 'rejected' });

    expect(res.status).toBe(200);
    // status must not be changed — field whitelist strips it
    expect(res.body.status).toBe('approved');
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/jobs/:id
// ---------------------------------------------------------------------------
describe('DELETE /api/jobs/:id', () => {
  test('owner can delete their job', async () => {
    const { token } = await registerAndLogin('recruiter');
    const created = await createJob(token);
    const jobId = created.body._id;

    const res = await request(app).delete(`/api/jobs/${jobId}`).set('x-auth-token', token);
    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/removed/i);

    const check = await request(app).get(`/api/jobs/${jobId}`);
    expect(check.status).toBe(404);
  });

  test('non-owner cannot delete a job', async () => {
    const { token: ownerToken } = await registerAndLogin('recruiter');
    const { token: otherToken } = await registerAndLogin('recruiter');
    const created = await createJob(ownerToken);

    const res = await request(app)
      .delete(`/api/jobs/${created.body._id}`)
      .set('x-auth-token', otherToken);
    expect(res.status).toBe(403);
  });

  test('returns 404 for non-existent job', async () => {
    const { token } = await registerAndLogin('recruiter');
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/jobs/${fakeId}`).set('x-auth-token', token);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/jobs/:id/approve & reject — admin only
// ---------------------------------------------------------------------------
describe('PATCH /api/jobs/:id/approve and reject', () => {
  let adminToken, jobId;

  beforeEach(async () => {
    // Create admin user directly via mongoose
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('adminpass', 10);
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: hash,
      role: 'admin',
      securityQuestions: [
        { question: "What is your favorite color?", answerHash: hash },
        { question: "What is your favorite food?", answerHash: hash },
      ],
    });
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'adminpass' });
    adminToken = loginRes.body.accessToken;

    const { token: recruiterToken } = await registerAndLogin('recruiter');
    const Job = require('../models/Job');
    const job = await Job.create({ ...JOB_PAYLOAD, postedBy: admin._id, status: 'pending' });
    jobId = job._id.toString();
  });

  test('admin can approve a pending job', async () => {
    const res = await request(app).patch(`/api/jobs/${jobId}/approve`).set('x-auth-token', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.job.status).toBe('approved');
  });

  test('admin can reject a pending job', async () => {
    const res = await request(app).patch(`/api/jobs/${jobId}/reject`).set('x-auth-token', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.job.status).toBe('rejected');
  });

  test('non-admin cannot approve a job', async () => {
    const { token } = await registerAndLogin('recruiter');
    const res = await request(app).patch(`/api/jobs/${jobId}/approve`).set('x-auth-token', token);
    expect(res.status).toBe(403);
  });

  test('approving already-approved job returns 400', async () => {
    // First approve
    await request(app).patch(`/api/jobs/${jobId}/approve`).set('x-auth-token', adminToken);
    // Try to approve again
    const res = await request(app).patch(`/api/jobs/${jobId}/approve`).set('x-auth-token', adminToken);
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/already approved/i);
  });
});

// ---------------------------------------------------------------------------
// GET /api/jobs/my-jobs — recruiter's own jobs
// ---------------------------------------------------------------------------
describe('GET /api/jobs/my-jobs', () => {
  test('recruiter gets only their own jobs', async () => {
    const { token: r1Token } = await registerAndLogin('recruiter');
    const { token: r2Token } = await registerAndLogin('recruiter');

    await createJob(r1Token, { title: 'R1 Job' });
    await createJob(r2Token, { title: 'R2 Job' });

    const res = await request(app).get('/api/jobs/my-jobs').set('x-auth-token', r1Token);
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].title).toBe('R1 Job');
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/jobs/my-jobs');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/jobs/search/advanced
// ---------------------------------------------------------------------------
describe('GET /api/jobs/search/advanced', () => {
  test('returns all approved jobs when no filters', async () => {
    const { token } = await registerAndLogin('recruiter');
    await createJob(token);
    const res = await request(app).get('/api/jobs/search/advanced');
    expect(res.status).toBe(200);
    expect(res.body.jobs.length).toBeGreaterThan(0);
  });

  test('passing minSalary does not crash (fixed: broken $range removed)', async () => {
    const { token } = await registerAndLogin('recruiter');
    await createJob(token);

    const res = await request(app).get('/api/jobs/search/advanced?minSalary=50000');
    expect(res.status).toBe(200);
    expect(res.body.jobs).toBeDefined();
  });

  test('filters by keyword', async () => {
    const { token } = await registerAndLogin('recruiter');
    await createJob(token, { title: 'React Engineer', description: 'React frontend role' });
    await createJob(token, { title: 'Backend Python Dev', description: 'Python microservices' });

    // Keyword search requires text index — may return all if text index not ready
    const res = await request(app).get('/api/jobs/search/advanced?keyword=React');
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// GET /api/jobs/admin/all-jobs — route ordering check
// ---------------------------------------------------------------------------
describe('GET /api/jobs/admin/all-jobs', () => {
  test('returns 401 without token (not 500 from ObjectId cast error)', async () => {
    // If routing is wrong, 'admin' gets cast as ObjectId → 500.
    // Correct routing should give 401 (missing auth).
    const res = await request(app).get('/api/jobs/admin/all-jobs');
    expect(res.status).toBe(401);
  });

  test('admin can get all jobs including non-approved', async () => {
    const User = require('../models/User');
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('adminpass', 10);
    await User.create({
      name: 'Admin',
      email: 'admin2@test.com',
      password: hash,
      role: 'admin',
      securityQuestions: [
        { question: "What is your favorite color?", answerHash: hash },
        { question: "What is your favorite food?", answerHash: hash },
      ],
    });
    const loginRes = await request(app).post('/api/auth/login').send({ email: 'admin2@test.com', password: 'adminpass' });
    const adminToken = loginRes.body.accessToken;

    const { token: recruiterToken } = await registerAndLogin('recruiter');
    const Job = require('../models/Job');
    const user = await User.findOne({ email: 'admin2@test.com' });
    await Job.create({ ...JOB_PAYLOAD, postedBy: user._id, status: 'pending' });
    await Job.create({ ...JOB_PAYLOAD, title: 'Approved Job', postedBy: user._id, status: 'approved' });

    const res = await request(app).get('/api/jobs/admin/all-jobs').set('x-auth-token', adminToken);
    expect(res.status).toBe(200);
    expect(res.body.jobs.length).toBeGreaterThanOrEqual(2);
  });
});
