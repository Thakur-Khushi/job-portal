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

async function registerAndLogin(role = 'jobseeker', seed = Date.now()) {
  const email = `${role}-${seed}@test.com`;
  await request(app).post('/api/auth/register').send({
    name: `${role} User`,
    email,
    password: 'password123',
    role,
    company: role === 'recruiter' ? 'TestCorp' : undefined,
    securityQuestions: SQ,
  });
  const loginRes = await request(app).post('/api/auth/login').send({ email, password: 'password123' });
  return { token: loginRes.body.accessToken, userId: loginRes.body.user.id };
}

const JOB_PAYLOAD = {
  title: 'Software Engineer',
  company: 'TechCorp',
  location: 'Remote',
  description: 'Build awesome products',
  requirements: 'JavaScript, Node.js',
  type: 'full-time',
  category: 'Engineering',
};

async function createApprovedJob(recruiterToken) {
  const res = await request(app)
    .post('/api/jobs')
    .set('x-auth-token', recruiterToken)
    .send(JOB_PAYLOAD);
  // Jobs are auto-approved when created by recruiter
  return res.body;
}

async function applyToJob(seekerToken, jobId, extra = {}) {
  return request(app)
    .post('/api/applications')
    .set('x-auth-token', seekerToken)
    .send({ jobId, coverLetter: 'I am very interested.', ...extra });
}

// ---------------------------------------------------------------------------
// POST /api/applications — apply for job
// ---------------------------------------------------------------------------
describe('POST /api/applications', () => {
  test('jobseeker can apply for an approved job', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 1);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 2);
    const job = await createApprovedJob(recruiterToken);

    const res = await applyToJob(seekerToken, job._id);
    expect(res.status).toBe(200);
    expect(res.body.job).toBe(job._id);
    expect(res.body.status).toBe('pending');
  });

  test('prevents duplicate applications to the same job', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 3);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 4);
    const job = await createApprovedJob(recruiterToken);

    await applyToJob(seekerToken, job._id);
    const res = await applyToJob(seekerToken, job._id);
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/already applied/i);
  });

  test('returns 400 when jobId is missing', async () => {
    const { token: seekerToken } = await registerAndLogin('jobseeker', 5);
    const res = await request(app)
      .post('/api/applications')
      .set('x-auth-token', seekerToken)
      .send({ coverLetter: 'hi' });
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/job id/i);
  });

  test('returns 404 for non-existent job', async () => {
    const { token: seekerToken } = await registerAndLogin('jobseeker', 6);
    const fakeId = new mongoose.Types.ObjectId();
    const res = await applyToJob(seekerToken, fakeId.toString());
    expect(res.status).toBe(404);
    expect(res.body.msg).toMatch(/job not found/i);
  });

  test('returns 400 for invalid job ID format', async () => {
    const { token: seekerToken } = await registerAndLogin('jobseeker', 7);
    const res = await applyToJob(seekerToken, 'not-a-valid-id');
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/invalid job id/i);
  });

  test('returns 401 without authentication', async () => {
    const res = await request(app).post('/api/applications').send({ jobId: 'abc123' });
    expect(res.status).toBe(401);
  });

  test('cannot apply to a pending (unapproved) job', async () => {
    const Job = require('../models/Job');
    const { token: seekerToken, userId } = await registerAndLogin('jobseeker', 8);

    const pendingJob = await Job.create({
      ...JOB_PAYLOAD,
      postedBy: userId,
      status: 'pending',
    });

    const res = await applyToJob(seekerToken, pendingJob._id.toString());
    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/not open for applications/i);
  });
});

// ---------------------------------------------------------------------------
// GET /api/applications/my-applications
// ---------------------------------------------------------------------------
describe('GET /api/applications/my-applications', () => {
  test('jobseeker gets their own applications', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 10);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 11);
    const job = await createApprovedJob(recruiterToken);

    await applyToJob(seekerToken, job._id);
    const res = await request(app).get('/api/applications/my-applications').set('x-auth-token', seekerToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].job._id).toBe(job._id);
  });

  test('returns empty array when no applications exist', async () => {
    const { token: seekerToken } = await registerAndLogin('jobseeker', 12);
    const res = await request(app).get('/api/applications/my-applications').set('x-auth-token', seekerToken);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/applications/my-applications');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/applications/recruiter
// ---------------------------------------------------------------------------
describe('GET /api/applications/recruiter', () => {
  test('recruiter gets applications for their jobs', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 20);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 21);
    const job = await createApprovedJob(recruiterToken);

    await applyToJob(seekerToken, job._id);
    const res = await request(app).get('/api/applications/recruiter').set('x-auth-token', recruiterToken);
    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  test('jobseeker cannot access recruiter applications', async () => {
    const { token: seekerToken } = await registerAndLogin('jobseeker', 22);
    const res = await request(app).get('/api/applications/recruiter').set('x-auth-token', seekerToken);
    expect(res.status).toBe(403);
    expect(res.body.msg).toMatch(/access denied/i);
  });

  test('returns 401 without token', async () => {
    const res = await request(app).get('/api/applications/recruiter');
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// PUT /api/applications/:id — update status
// ---------------------------------------------------------------------------
describe('PUT /api/applications/:id', () => {
  test('recruiter can update application status to shortlisted', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 30);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 31);
    const job = await createApprovedJob(recruiterToken);
    const applyRes = await applyToJob(seekerToken, job._id);
    const appId = applyRes.body._id;

    const res = await request(app)
      .put(`/api/applications/${appId}`)
      .set('x-auth-token', recruiterToken)
      .send({ status: 'shortlisted' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('shortlisted');
  });

  test('applicant cannot update their own application status', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 32);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 33);
    const job = await createApprovedJob(recruiterToken);
    const applyRes = await applyToJob(seekerToken, job._id);
    const appId = applyRes.body._id;

    const res = await request(app)
      .put(`/api/applications/${appId}`)
      .set('x-auth-token', seekerToken)
      .send({ status: 'hired' });
    expect(res.status).toBe(403);
  });

  test('invalid status string returns 400 (not 500)', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 34);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 35);
    const job = await createApprovedJob(recruiterToken);
    const applyRes = await applyToJob(seekerToken, job._id);
    const appId = applyRes.body._id;

    const res = await request(app)
      .put(`/api/applications/${appId}`)
      .set('x-auth-token', recruiterToken)
      .send({ status: 'totally-invalid-status' });

    expect(res.status).toBe(400);
    expect(res.body.msg).toMatch(/invalid status/i);
  });

  test('returns 404 for non-existent application', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 36);
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/applications/${fakeId}`)
      .set('x-auth-token', recruiterToken)
      .send({ status: 'reviewed' });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/applications/:id — withdraw
// ---------------------------------------------------------------------------
describe('DELETE /api/applications/:id', () => {
  test('applicant can withdraw their application (fixed: deleteOne instead of remove)', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 40);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 41);
    const job = await createApprovedJob(recruiterToken);
    const applyRes = await applyToJob(seekerToken, job._id);
    const appId = applyRes.body._id;

    const res = await request(app)
      .delete(`/api/applications/${appId}`)
      .set('x-auth-token', seekerToken);

    expect(res.status).toBe(200);
    expect(res.body.msg).toMatch(/withdrawn/i);
  });

  test('non-applicant cannot withdraw application', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 42);
    const { token: seeker1Token } = await registerAndLogin('jobseeker', 43);
    const { token: seeker2Token } = await registerAndLogin('jobseeker', 44);
    const job = await createApprovedJob(recruiterToken);
    const applyRes = await applyToJob(seeker1Token, job._id);
    const appId = applyRes.body._id;

    const res = await request(app)
      .delete(`/api/applications/${appId}`)
      .set('x-auth-token', seeker2Token);
    expect(res.status).toBe(403);
    expect(res.body.msg).toMatch(/access denied/i);
  });

  test('returns 404 for non-existent application', async () => {
    const { token: seekerToken } = await registerAndLogin('jobseeker', 45);
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/applications/${fakeId}`)
      .set('x-auth-token', seekerToken);
    expect(res.status).toBe(404);
  });

  test('returns 401 without token', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/applications/${fakeId}`);
    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// GET /api/applications/job/:jobId
// ---------------------------------------------------------------------------
describe('GET /api/applications/job/:jobId', () => {
  test('recruiter can view applications for their own job', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 50);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 51);
    const job = await createApprovedJob(recruiterToken);

    await applyToJob(seekerToken, job._id);
    const res = await request(app)
      .get(`/api/applications/job/${job._id}`)
      .set('x-auth-token', recruiterToken);
    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
  });

  test('jobseeker cannot view job applications', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 52);
    const { token: seekerToken } = await registerAndLogin('jobseeker', 53);
    const job = await createApprovedJob(recruiterToken);

    const res = await request(app)
      .get(`/api/applications/job/${job._id}`)
      .set('x-auth-token', seekerToken);
    expect(res.status).toBe(403);
  });

  test('returns 404 for non-existent job', async () => {
    const { token: recruiterToken } = await registerAndLogin('recruiter', 54);
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/applications/job/${fakeId}`)
      .set('x-auth-token', recruiterToken);
    expect(res.status).toBe(404);
  });
});
