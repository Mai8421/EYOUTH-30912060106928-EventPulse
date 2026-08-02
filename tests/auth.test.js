process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-long-enough';
jest.setTimeout(180000);

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../src/app');

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterAll(async () => {
  if (mongoose.connection.readyState) await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

test('register creates an attendee and returns a JWT', async () => {
  const r = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });
  expect(r.status).toBe(201);
  expect(r.body.data.token).toBeDefined();
  expect(r.body.data.user.role).toBe('attendee');
  expect(r.body.data.user.password).toBeUndefined();
});

test('register rejects duplicate email with 409', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Dup', email: 'dup@example.com', password: 'password123' });
  const r = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Dup2', email: 'dup@example.com', password: 'password123' });
  expect(r.status).toBe(409);
});

test('register validates required fields and returns 422', async () => {
  const r = await request(app).post('/api/auth/register').send({ name: 'X' });
  expect(r.status).toBe(422);
  expect(Array.isArray(r.body.errors)).toBe(true);
});

test('login returns a JWT on valid credentials', async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Login User', email: 'login@example.com', password: 'password123' });
  const r = await request(app)
    .post('/api/auth/login')
    .send({ email: 'login@example.com', password: 'password123' });
  expect(r.status).toBe(200);
  expect(r.body.data.token).toBeDefined();
});

test('login returns 401 on wrong password', async () => {
  const r = await request(app)
    .post('/api/auth/login')
    .send({ email: 'login@example.com', password: 'wrongpassword' });
  expect(r.status).toBe(401);
});

test('/me returns current user when authenticated', async () => {
  const reg = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Me User', email: 'me@example.com', password: 'password123' });
  const r = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${reg.body.data.token}`);
  expect(r.status).toBe(200);
  expect(r.body.data.email).toBe('me@example.com');
});

test('/me returns 401 without a token', async () => {
  const r = await request(app).get('/api/auth/me');
  expect(r.status).toBe(401);
});
