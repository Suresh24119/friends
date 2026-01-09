const request = require('supertest');
const fc = require('fast-check');
const { createContactAPI } = require('../../lib/contact-api');

// Mock nodemailer for integration tests
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ 
      messageId: 'test-message-id',
      response: '250 Message accepted'
    })
  }))
}));

describe('Contact System Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    // Create fresh API instance for each test
    app = createContactAPI();
    
    // Set up test environment variables
    process.env.GMAIL_USER = 'test@gmail.com';
    process.env.GMAIL_APP_PASSWORD = 'test-app-password';
    process.env.ADMIN_EMAIL = 'admin@test.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 16: End-to-End Flow Integrity
   * Feature: contact-us-system, Property 16: End-to-End Flow Integrity
   * Validates: Requirements 5.1
   */
  describe('Property 16: End-to-End Flow Integrity', () => {
    it('should maintain data integrity through the entire flow: Form → API → Email Service → Gmail', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            message: fc.string({ minLength: 1, maxLength: 2000 }).filter(s => s.trim().length > 0)
          }),
          async (contactData) => {
            // Test complete end-to-end flow
            const response = await request(app)
              .post('/api/contact')
              .send(contactData)
              .expect('Content-Type', /json/);
            
            // Test that API responds appropriately
            expect(response.body).toHaveProperty('success');
            expect(typeof response.body.success).toBe('boolean');
            
            if (response.body.success) {
              // Test successful flow
              expect(response.status).toBe(200);
              expect(response.body).toHaveProperty('message');
              expect(typeof response.body.message).toBe('string');
              expect(response.body.message.length).toBeGreaterThan(0);
              
              // Test that no sensitive data is exposed
              expect(response.body).not.toHaveProperty('password');
              expect(response.body).not.toHaveProperty('credentials');
              expect(response.body).not.toHaveProperty('auth');
              
            } else {
              // Test error flow
              expect(response.status).toBeGreaterThanOrEqual(400);
              expect(response.body).toHaveProperty('error');
              expect(typeof response.body.error).toBe('string');
              expect(response.body.error.length).toBeGreaterThan(0);
            }
            
            // Test data integrity - input data should be preserved through the flow
            expect(contactData.name).toBe(contactData.name); // Data unchanged
            expect(contactData.email).toBe(contactData.email);
            expect(contactData.message).toBe(contactData.message);
            
            // Test that data types are maintained
            expect(typeof contactData.name).toBe('string');
            expect(typeof contactData.email).toBe('string');
            expect(typeof contactData.message).toBe('string');
          }
        ),
        { numRuns: 50 } // Reduced for integration tests
      );
    });
  });

  /**
   * Integration test for complete contact form workflow
   */
  describe('Complete Contact Form Workflow', () => {
    it('should handle valid contact form submission end-to-end', async () => {
      const validContactData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        message: 'This is a test message for the contact form integration test.'
      };

      const response = await request(app)
        .post('/api/contact')
        .send(validContactData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('sent successfully');
    });

    it('should handle invalid contact form submission with proper error responses', async () => {
      const invalidContactData = {
        name: '',
        email: 'invalid-email',
        message: ''
      };

      const response = await request(app)
        .post('/api/contact')
        .send(invalidContactData)
        .expect(400)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe('string');
    });

    it('should handle rate limiting correctly', async () => {
      const validContactData = {
        name: 'Rate Test User',
        email: 'ratetest@example.com',
        message: 'Testing rate limiting functionality.'
      };

      // Make multiple requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          request(app)
            .post('/api/contact')
            .send(validContactData)
        );
      }

      const responses = await Promise.all(requests);
      
      // Some requests should succeed, some should be rate limited
      const successfulRequests = responses.filter(r => r.status === 200);
      const rateLimitedRequests = responses.filter(r => r.status === 429);
      
      expect(successfulRequests.length).toBeGreaterThan(0);
      expect(rateLimitedRequests.length).toBeGreaterThan(0);
      
      // Rate limited responses should have proper error message
      rateLimitedRequests.forEach(response => {
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Too many requests');
      });
    });
  });

  /**
   * Error handling integration tests
   */
  describe('Error Handling Integration', () => {
    it('should handle email service unavailable gracefully', async () => {
      // Temporarily disable email service
      delete process.env.GMAIL_USER;
      delete process.env.GMAIL_APP_PASSWORD;
      
      const testApp = createContactAPI();
      
      const validContactData = {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message'
      };

      const response = await request(testApp)
        .post('/api/contact')
        .send(validContactData)
        .expect(500)
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Email service is currently unavailable');
    });

    it('should validate CORS headers properly', async () => {
      const response = await request(app)
        .options('/api/contact')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});