// Set environment to test database before loading configuration
process.env.DB_NAME = 'mailbox_db_test';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Create mock Express app for isolated API testing
const app = express();
app.use(cors());
app.use(express.json());

const { initializeDatabase, getSequelize } = require('../config/db');
const { initModels, models } = require('../models');
const authRoutes = require('../routes/authRoutes');

app.use('/api/auth', authRoutes);

let sequelize;

beforeAll(async () => {
  // Initialize db and sync models before starting tests
  await initializeDatabase();
  const modelDefs = initModels();
  sequelize = getSequelize();
  
  // Force sync database to clear old test data
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection cleanly when tests complete
  if (sequelize) {
    await sequelize.close();
  }
});

describe('Authentication API Endpoint Tests', () => {
  const randomSuffix = Math.floor(Math.random() * 10000);
  const testEmail = `newuser_${randomSuffix}@example.com`;
  const testPassword = 'SecurePassword123';

  // Test Case 1: Successfully Sign Up a New User
  it('should successfully register a new user and return 201 Created', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('User successfully signed up');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testEmail);
  });

  // Test Case 2: Attempting to Register with a Duplicate Email
  it('should fail registration and return 400 when email is already registered', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Email already registered');
  });

  // Test Case 3: Registration Fails with Missing Mandatory Fields
  it('should return 400 and fail if email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        password: 'Password123',
        confirmPassword: 'Password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('mandatory');
  });

  // Test Case 4: Registration Fails when Passwords Do Not Match
  it('should return 400 and fail if passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'differentuser@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('do not match');
  });
});
