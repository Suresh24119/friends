const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Contact API module for handling contact form submissions
 * This module provides Express middleware and routes for the contact form functionality
 */

/**
 * Create and configure Express app for contact API
 * @returns {express.Application} Configured Express app
 */
function createContactAPI() {
  const app = express();
  
  // Configure CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] // Replace with actual domain
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  }));
  
  // Parse JSON bodies
  app.use(express.json({ limit: '10mb' }));
  
  // Basic rate limiting (simple in-memory implementation)
  const rateLimitMap = new Map();
  const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
  const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5;
  
  function rateLimit(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(clientIP)) {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return next();
    }
    
    const clientData = rateLimitMap.get(clientIP);
    
    if (now > clientData.resetTime) {
      // Reset the rate limit window
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return next();
    }
    
    if (clientData.count >= RATE_LIMIT_MAX) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.'
      });
    }
    
    clientData.count++;
    next();
  }
  
  // Configure email transporter with multiple provider support
  let transporter = null;
  
  function createEmailTransporter() {
    // Check for Gmail configuration first
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      console.log('Using Gmail SMTP configuration...');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
    }
    
    // Check for generic SMTP configuration
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('Using custom SMTP configuration...');
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
    
    // Check for Outlook configuration
    if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS) {
      console.log('Using Outlook SMTP configuration...');
      return nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.OUTLOOK_USER,
          pass: process.env.OUTLOOK_PASS
        }
      });
    }
    
    console.warn('No email credentials configured. Email functionality will be disabled.');
    console.warn('Please configure one of the following:');
    console.warn('1. Gmail: GMAIL_USER and GMAIL_APP_PASSWORD');
    console.warn('2. Custom SMTP: SMTP_HOST, SMTP_USER, SMTP_PASS');
    console.warn('3. Outlook: OUTLOOK_USER and OUTLOOK_PASS');
    return null;
  }
  
  // Initialize transporter
  transporter = createEmailTransporter();
  
  // Contact form endpoint
  app.post('/api/contact', rateLimit, async (req, res) => {
    try {
      // Extract data from request body
      const { name, email, message } = req.body;
      
      // Validate that request body exists
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request body. Please provide valid JSON data.'
        });
      }
      
      // Validate required fields presence
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          error: 'All fields (name, email, message) are required.'
        });
      }
      
      // Validate field types
      if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'All fields must be strings.'
        });
      }
      
      // Validate field content (not just whitespace)
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedMessage = message.trim();
      
      if (trimmedName.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Name cannot be empty or contain only whitespace.'
        });
      }
      
      if (trimmedEmail.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Email cannot be empty or contain only whitespace.'
        });
      }
      
      if (trimmedMessage.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message cannot be empty or contain only whitespace.'
        });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return res.status(400).json({
          success: false,
          error: 'Please provide a valid email address.'
        });
      }
      
      // Validate field lengths
      if (trimmedName.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Name must be 100 characters or less.'
        });
      }
      
      if (trimmedMessage.length > 2000) {
        return res.status(400).json({
          success: false,
          error: 'Message must be 2000 characters or less.'
        });
      }
      
      // Check if email service is available
      if (!transporter) {
        console.error('Email service not configured');
        return res.status(500).json({
          success: false,
          error: 'Email service is currently unavailable. Please try again later.'
        });
      }
      
      // Compose email
      const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || process.env.SMTP_USER || process.env.OUTLOOK_USER;
      const senderEmail = process.env.GMAIL_USER || process.env.SMTP_USER || process.env.OUTLOOK_USER;
      
      const emailOptions = {
        from: senderEmail,
        to: adminEmail,
        subject: 'New Contact Form Message - CampusCam',
        text: `
New contact form submission from CampusCam:

Name: ${trimmedName}
Email: ${trimmedEmail}
Message: ${trimmedMessage}

Submitted at: ${new Date().toISOString()}
IP Address: ${req.ip || req.connection.remoteAddress || 'Unknown'}
        `.trim(),
        html: `
<h2>New Contact Form Message - CampusCam</h2>
<p><strong>Name:</strong> ${trimmedName}</p>
<p><strong>Email:</strong> ${trimmedEmail}</p>
<p><strong>Message:</strong></p>
<div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #D53840; margin: 10px 0;">
  ${trimmedMessage.replace(/\n/g, '<br>')}
</div>
<hr>
<p><small>Submitted at: ${new Date().toISOString()}</small></p>
<p><small>IP Address: ${req.ip || req.connection.remoteAddress || 'Unknown'}</small></p>
        `.trim()
      };
      
      // Send email
      await transporter.sendMail(emailOptions);
      
      // Return success response
      res.json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!'
      });
      
    } catch (error) {
      console.error('Contact form error:', error);
      
      // Return generic error to user (don't expose internal details)
      res.status(500).json({
        success: false,
        error: 'An error occurred while sending your message. Please try again later.'
      });
    }
  });
  
  return app;
}

module.exports = { createContactAPI };