const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Adjust path if needed
const Payment = require('../models/payments');

describe('Payment API', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    // Clean up database between tests
    await Payment.deleteMany({});
  });

  afterAll(async () => {
    // Close MongoDB connection
    await mongoose.connection.close();
  });

  it('should initiate a payment', async () => {
    const res = await request(app)
      .post('/api/v1/payments')
      .send({
        first_name: 'Test',
        last_name: 'User',
        phone_number: '1234567890',
        email: 'test@example.com',
        amount: 100,
        state: 'TestState',
        country: 'TestCountry',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('payment.id');
    expect(res.body).toHaveProperty('payment.authorization_url');

    // Verify in MongoDB
    const payment = await Payment.findOne({ paymentId: res.body.payment.id });
    expect(payment).toBeTruthy();
  });

  it('should retrieve payment status', async () => {
    // Create a payment
    const initRes = await request(app)
      .post('/api/v1/payments')
      .send({
        first_name: 'Test',
        last_name: 'User',
        phone_number: '1234567890',
        email: 'test@example.com',
        amount: 100,
        state: 'TestState',
        country: 'TestCountry',
      });
    const paymentId = initRes.body.payment.id;

    const res = await request(app).get(`/api/v1/payments/${paymentId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.payment).toHaveProperty('status');
  });

  it('should return 400 for invalid initiation', async () => {
    const res = await request(app).post('/api/v1/payments').send({});
    expect(res.statusCode).toEqual(400);
  });
});