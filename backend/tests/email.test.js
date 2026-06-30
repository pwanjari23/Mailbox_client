// Set environment to test database before loading configuration
process.env.DB_NAME = 'mailbox_db_test';
process.env.NODE_ENV = 'test';

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create mock Express app
const app = express();
app.use(cors());
app.use(express.json());

const { initializeDatabase, getSequelize } = require('../config/db');
const { initModels, models } = require('../models');
const emailRoutes = require('../routes/emailRoutes');
const authRoutes = require('../routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/emails', emailRoutes);

let sequelize;
let senderToken;
let senderEmail = 'sender_test@example.com';
let receiverEmail = 'receiver_test@example.com';
let nonExistentEmail = 'noone@example.com';

beforeAll(async () => {
  await initializeDatabase();
  initModels();
  sequelize = getSequelize();
  
  // Force sync database to clear old test data
  await sequelize.sync({ force: true });

  // Create Sender and Receiver in database
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123', salt);

  await models.User.create({
    email: senderEmail,
    password: hashedPassword
  });

  await models.User.create({
    email: receiverEmail,
    password: hashedPassword
  });

  // Login as sender to get a valid JWT token
  const jwtSecret = process.env.JWT_SECRET || 'mailbox_super_secret_token_key';
  senderToken = jwt.sign(
    { userId: 'sender_uuid_123', email: senderEmail },
    jwtSecret,
    { expiresIn: '1h' }
  );
});

afterAll(async () => {
  if (sequelize) {
    await sequelize.close();
  }
});

describe('Email Delivery API Endpoint Tests', () => {
  // Test Case 1: Send Email successfully to a registered user
  it('should successfully send an email to a registered receiver and return 201', async () => {
    const res = await request(app)
      .post('/api/emails/send')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        receiverEmail: receiverEmail,
        subject: 'Hello Recipient',
        body: '<p>This is a <strong>bold</strong> rich text email.</p>'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('successfully sent');
    expect(res.body.email).toHaveProperty('id');
    expect(res.body.email.receiverEmail).toBe(receiverEmail);
  });

  // Test Case 2: Email Send Fails when Recipient User Does Not Exist
  it('should return 404 error when receiver email is not registered', async () => {
    const res = await request(app)
      .post('/api/emails/send')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        receiverEmail: nonExistentEmail,
        subject: 'Hey Person',
        body: '<p>Hi</p>'
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not registered');
  });

  // Test Case 3: Email Send Fails when Recipient is Self
  it('should return 400 error when trying to send email to self', async () => {
    const res = await request(app)
      .post('/api/emails/send')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        receiverEmail: senderEmail,
        subject: 'Self note',
        body: '<p>Note to self</p>'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('cannot send an email to yourself');
  });

  // Test Case 4: Email Send Fails with Missing Mandatory Body content
  it('should return 400 error when message body is missing', async () => {
    const res = await request(app)
      .post('/api/emails/send')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        receiverEmail: receiverEmail,
        subject: 'Empty body'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('mandatory');
  });

  // Test Case 5: Retrieve Sent emails (Sentbox)
  it('should successfully retrieve emails sent by the user', async () => {
    const res = await request(app)
      .get('/api/emails/sent')
      .set('Authorization', `Bearer ${senderToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThanOrEqual(1);
    expect(res.body.emails[0].senderEmail).toBe(senderEmail);
    expect(res.body.emails[0].receiverEmail).toBe(receiverEmail);
  });
});
