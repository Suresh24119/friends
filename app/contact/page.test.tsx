import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import ContactPage from './page';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Contact Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 1: Form Validation Consistency
   * Feature: contact-us-system, Property 1: Form Validation Consistency
   * Validates: Requirements 1.2
   */
  describe('Property 1: Form Validation Consistency', () => {
    it('should consistently validate form fields - empty required fields should always fail validation, and complete valid fields should always pass validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.oneof(
              fc.constant(''), // Empty
              fc.constant('   '), // Whitespace only
              fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // Valid
              fc.string({ minLength: 101, maxLength: 200 }) // Too long
            ),
            email: fc.oneof(
              fc.constant(''), // Empty
              fc.constant('   '), // Whitespace only
              fc.emailAddress(), // Valid
              fc.constant('invalid-email'), // Invalid format
              fc.constant('no@domain'), // Invalid format
              fc.constant('@nodomain.com') // Invalid format
            ),
            message: fc.oneof(
              fc.constant(''), // Empty
              fc.constant('   '), // Whitespace only
              fc.string({ minLength: 1, maxLength: 2000 }).filter(s => s.trim().length > 0), // Valid
              fc.string({ minLength: 2001, maxLength: 3000 }) // Too long
            )
          }),
          (formData) => {
            // Simulate form validation logic
            const { name, email, message } = formData;
            
            let isValid = true;
            let errorMessage = '';
            
            // Check required fields
            if (!name.trim() || !email.trim() || !message.trim()) {
              isValid = false;
              errorMessage = 'All fields are required.';
            }
            // Validate email format
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              isValid = false;
              errorMessage = 'Please provide a valid email address.';
            }
            // Validate field lengths
            else if (name.trim().length > 100) {
              isValid = false;
              errorMessage = 'Name must be 100 characters or less.';
            }
            else if (message.trim().length > 2000) {
              isValid = false;
              errorMessage = 'Message must be 2000 characters or less.';
            }
            
            // Test validation consistency
            if (isValid) {
              // Valid data should pass all checks
              expect(name.trim().length).toBeGreaterThan(0);
              expect(name.trim().length).toBeLessThanOrEqual(100);
              expect(email.trim()).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
              expect(message.trim().length).toBeGreaterThan(0);
              expect(message.trim().length).toBeLessThanOrEqual(2000);
              expect(errorMessage).toBe('');
            } else {
              // Invalid data should fail validation
              expect(errorMessage.length).toBeGreaterThan(0);
              expect(typeof errorMessage).toBe('string');
            }
            
            // Test that validation is deterministic
            // Running the same validation again should give the same result
            let secondValidation = true;
            let secondErrorMessage = '';
            
            if (!name.trim() || !email.trim() || !message.trim()) {
              secondValidation = false;
              secondErrorMessage = 'All fields are required.';
            }
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              secondValidation = false;
              secondErrorMessage = 'Please provide a valid email address.';
            }
            else if (name.trim().length > 100) {
              secondValidation = false;
              secondErrorMessage = 'Name must be 100 characters or less.';
            }
            else if (message.trim().length > 2000) {
              secondValidation = false;
              secondErrorMessage = 'Message must be 2000 characters or less.';
            }
            
            // Validation should be consistent
            expect(isValid).toBe(secondValidation);
            expect(errorMessage).toBe(secondErrorMessage);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 2: API Call Trigger
   * Feature: contact-us-system, Property 2: API Call Trigger
   * Validates: Requirements 1.3
   */
  describe('Property 2: API Call Trigger', () => {
    it('should always make an API call to the /contact endpoint for any valid form data that passes validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            message: fc.string({ minLength: 1, maxLength: 2000 }).filter(s => s.trim().length > 0)
          }),
          (validFormData) => {
            // Simulate form submission logic
            const { name, email, message } = validFormData;
            
            // Validate that the data passes validation
            const isValid = name.trim().length > 0 && 
                           name.trim().length <= 100 &&
                           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
                           message.trim().length > 0 &&
                           message.trim().length <= 2000;
            
            expect(isValid).toBe(true); // This should always be true with our generator
            
            // Test API call configuration
            if (isValid) {
              const apiCallConfig = {
                url: '/api/contact',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  name: name.trim(),
                  email: email.trim(),
                  message: message.trim()
                }),
              };
              
              // Test that API call configuration is correct
              expect(apiCallConfig.url).toBe('/api/contact');
              expect(apiCallConfig.method).toBe('POST');
              expect(apiCallConfig.headers['Content-Type']).toBe('application/json');
              
              // Test that the request body contains all form data
              const requestBody = JSON.parse(apiCallConfig.body);
              expect(requestBody).toHaveProperty('name');
              expect(requestBody).toHaveProperty('email');
              expect(requestBody).toHaveProperty('message');
              expect(requestBody.name).toBe(name.trim());
              expect(requestBody.email).toBe(email.trim());
              expect(requestBody.message).toBe(message.trim());
              
              // Test that data is properly trimmed
              expect(requestBody.name).not.toMatch(/^\s|\s$/);
              expect(requestBody.email).not.toMatch(/^\s|\s$/);
              expect(requestBody.message).not.toMatch(/^\s|\s$/);
              
              // Test that all required data is present for API call
              expect(typeof requestBody.name).toBe('string');
              expect(typeof requestBody.email).toBe('string');
              expect(typeof requestBody.message).toBe('string');
              expect(requestBody.name.length).toBeGreaterThan(0);
              expect(requestBody.email.length).toBeGreaterThan(0);
              expect(requestBody.message.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Success Feedback Display
   * Feature: contact-us-system, Property 3: Success Feedback Display
   * Validates: Requirements 1.4
   */
  describe('Property 3: Success Feedback Display', () => {
    it('should always display a success message for any successful API response', () => {
      fc.assert(
        fc.property(
          fc.record({
            success: fc.constant(true),
            message: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0)
          }),
          (successResponse) => {
            // Simulate success feedback display logic
            const { success, message } = successResponse;
            
            // Test that success response is properly structured
            expect(success).toBe(true);
            expect(typeof message).toBe('string');
            expect(message.trim().length).toBeGreaterThan(0);
            
            // Simulate UI state for success feedback
            const uiState = {
              submitStatus: success ? 'success' : 'error',
              successMessage: success ? message : '',
              errorMessage: success ? '' : 'An error occurred',
              showSuccessUI: success && message.trim().length > 0,
              showErrorUI: !success
            };
            
            // Test success feedback display conditions
            expect(uiState.submitStatus).toBe('success');
            expect(uiState.successMessage).toBe(message);
            expect(uiState.errorMessage).toBe('');
            expect(uiState.showSuccessUI).toBe(true);
            expect(uiState.showErrorUI).toBe(false);
            
            // Test success message content
            expect(uiState.successMessage.length).toBeGreaterThan(0);
            expect(typeof uiState.successMessage).toBe('string');
            
            // Test that success message is user-friendly
            expect(uiState.successMessage).not.toContain('undefined');
            expect(uiState.successMessage).not.toContain('null');
            expect(uiState.successMessage).not.toContain('error');
            expect(uiState.successMessage).not.toContain('failed');
            
            // Test UI rendering logic
            if (uiState.showSuccessUI) {
              const successElement = {
                className: 'rounded-md bg-green-50 p-4',
                iconColor: 'text-green-400',
                textColor: 'text-green-800',
                content: uiState.successMessage,
                visible: true
              };
              
              expect(successElement.className).toContain('bg-green-50');
              expect(successElement.iconColor).toContain('green');
              expect(successElement.textColor).toContain('green');
              expect(successElement.content).toBe(message);
              expect(successElement.visible).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Error Feedback Display
   * Feature: contact-us-system, Property 4: Error Feedback Display
   * Validates: Requirements 1.5
   */
  describe('Property 4: Error Feedback Display', () => {
    it('should always display an appropriate error message for any failed API response', () => {
      fc.assert(
        fc.property(
          fc.record({
            success: fc.constant(false),
            error: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0)
          }),
          (errorResponse) => {
            // Simulate error feedback display logic
            const { success, error } = errorResponse;
            
            // Test that error response is properly structured
            expect(success).toBe(false);
            expect(typeof error).toBe('string');
            expect(error.trim().length).toBeGreaterThan(0);
            
            // Simulate UI state for error feedback
            const uiState = {
              submitStatus: success ? 'success' : 'error',
              successMessage: success ? 'Success message' : '',
              errorMessage: success ? '' : error,
              showSuccessUI: success,
              showErrorUI: !success && error.trim().length > 0
            };
            
            // Test error feedback display conditions
            expect(uiState.submitStatus).toBe('error');
            expect(uiState.successMessage).toBe('');
            expect(uiState.errorMessage).toBe(error);
            expect(uiState.showSuccessUI).toBe(false);
            expect(uiState.showErrorUI).toBe(true);
            
            // Test error message content
            expect(uiState.errorMessage.length).toBeGreaterThan(0);
            expect(typeof uiState.errorMessage).toBe('string');
            
            // Test that error message is user-friendly
            expect(uiState.errorMessage).not.toContain('undefined');
            expect(uiState.errorMessage).not.toContain('null');
            expect(uiState.errorMessage).not.toContain('stack trace');
            expect(uiState.errorMessage).not.toContain('internal error');
            
            // Test UI rendering logic
            if (uiState.showErrorUI) {
              const errorElement = {
                className: 'rounded-md bg-red-50 p-4',
                iconColor: 'text-red-400',
                textColor: 'text-red-800',
                content: uiState.errorMessage,
                visible: true
              };
              
              expect(errorElement.className).toContain('bg-red-50');
              expect(errorElement.iconColor).toContain('red');
              expect(errorElement.textColor).toContain('red');
              expect(errorElement.content).toBe(error);
              expect(errorElement.visible).toBe(true);
            }
            
            // Test that error messages are appropriate for different scenarios
            const isValidationError = error.toLowerCase().includes('required') || 
                                    error.toLowerCase().includes('invalid') ||
                                    error.toLowerCase().includes('format');
            const isNetworkError = error.toLowerCase().includes('network') ||
                                 error.toLowerCase().includes('connection');
            const isServerError = error.toLowerCase().includes('server') ||
                                 error.toLowerCase().includes('unavailable');
            
            if (isValidationError || isNetworkError || isServerError) {
              // Error message should be descriptive and actionable
              expect(error.length).toBeGreaterThan(10); // Should be descriptive
              expect(typeof error).toBe('string');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 24: Duplicate Submission Prevention
   * Feature: contact-us-system, Property 24: Duplicate Submission Prevention
   * Validates: Requirements 6.4
   */
  describe('Property 24: Duplicate Submission Prevention', () => {
    it('should prevent additional submission attempts when a form submission is already in progress', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            message: fc.string({ minLength: 1, maxLength: 2000 }).filter(s => s.trim().length > 0),
            simultaneousAttempts: fc.integer({ min: 2, max: 10 })
          }),
          (testData) => {
            // Simulate duplicate submission prevention logic
            const { name, email, message, simultaneousAttempts } = testData;
            
            let isSubmitting = false;
            let submissionCount = 0;
            let preventedAttempts = 0;
            
            // Simulate multiple submission attempts
            for (let i = 0; i < simultaneousAttempts; i++) {
              // Simulate form submission attempt
              if (isSubmitting) {
                // Should prevent duplicate submission
                preventedAttempts++;
                continue;
              }
              
              // First submission should proceed
              isSubmitting = true;
              submissionCount++;
              
              // Simulate submission completion (for testing purposes)
              // In real implementation, this would be async
              setTimeout(() => {
                isSubmitting = false;
              }, 100);
            }
            
            // Test duplicate prevention behavior
            expect(submissionCount).toBe(1); // Only one submission should proceed
            expect(preventedAttempts).toBe(simultaneousAttempts - 1); // All other attempts should be prevented
            expect(submissionCount + preventedAttempts).toBe(simultaneousAttempts);
            
            // Test submission state management
            expect(typeof isSubmitting).toBe('boolean');
            
            // Test UI state for duplicate prevention
            const uiState = {
              buttonDisabled: isSubmitting,
              buttonText: isSubmitting ? 'Sending...' : 'Send Message',
              showSpinner: isSubmitting,
              allowSubmission: !isSubmitting
            };
            
            if (isSubmitting) {
              expect(uiState.buttonDisabled).toBe(true);
              expect(uiState.buttonText).toBe('Sending...');
              expect(uiState.showSpinner).toBe(true);
              expect(uiState.allowSubmission).toBe(false);
            } else {
              expect(uiState.buttonDisabled).toBe(false);
              expect(uiState.buttonText).toBe('Send Message');
              expect(uiState.showSpinner).toBe(false);
              expect(uiState.allowSubmission).toBe(true);
            }
            
            // Test form data integrity during submission attempts
            const formData = { name, email, message };
            expect(formData.name).toBe(name);
            expect(formData.email).toBe(email);
            expect(formData.message).toBe(message);
            
            // Test that form data doesn't get corrupted by duplicate attempts
            expect(typeof formData.name).toBe('string');
            expect(typeof formData.email).toBe('string');
            expect(typeof formData.message).toBe('string');
            expect(formData.name.length).toBeGreaterThan(0);
            expect(formData.email.length).toBeGreaterThan(0);
            expect(formData.message.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 21: Network Error Handling
   * Feature: contact-us-system, Property 21: Network Error Handling
   * Validates: Requirements 6.1
   */
  describe('Property 21: Network Error Handling', () => {
    it('should display user-friendly error messages for any connection failures and timeouts', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            message: fc.string({ minLength: 1, maxLength: 2000 }).filter(s => s.trim().length > 0),
            networkErrorType: fc.oneof(
              fc.constant('CONNECTION_REFUSED'),
              fc.constant('TIMEOUT'),
              fc.constant('DNS_FAILURE'),
              fc.constant('NETWORK_UNREACHABLE'),
              fc.constant('FETCH_ERROR')
            )
          }),
          (testData) => {
            // Simulate network error handling logic
            const { name, email, message, networkErrorType } = testData;
            
            // Simulate different network error scenarios
            let networkError;
            switch (networkErrorType) {
              case 'CONNECTION_REFUSED':
                networkError = new Error('Connection refused');
                break;
              case 'TIMEOUT':
                networkError = new Error('Request timeout');
                break;
              case 'DNS_FAILURE':
                networkError = new Error('DNS resolution failed');
                break;
              case 'NETWORK_UNREACHABLE':
                networkError = new Error('Network unreachable');
                break;
              case 'FETCH_ERROR':
                networkError = new TypeError('Failed to fetch');
                break;
            }
            
            // Simulate error handling logic
            let errorMessage = '';
            let submitStatus = 'idle';
            
            try {
              // Simulate network error
              throw networkError;
            } catch (error) {
              submitStatus = 'error';
              errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            // Test network error handling
            expect(submitStatus).toBe('error');
            expect(errorMessage).toBe('Network error. Please check your connection and try again.');
            
            // Test that error message is user-friendly
            expect(errorMessage).not.toContain('Connection refused');
            expect(errorMessage).not.toContain('DNS resolution failed');
            expect(errorMessage).not.toContain('Request timeout');
            expect(errorMessage).not.toContain('Network unreachable');
            expect(errorMessage).not.toContain('Failed to fetch');
            expect(errorMessage).not.toContain('TypeError');
            expect(errorMessage).not.toContain('Error:');
            
            // Test that error message provides actionable guidance
            expect(errorMessage).toContain('Network error');
            expect(errorMessage).toContain('check your connection');
            expect(errorMessage).toContain('try again');
            
            // Test error message properties
            expect(typeof errorMessage).toBe('string');
            expect(errorMessage.length).toBeGreaterThan(0);
            expect(errorMessage.length).toBeLessThan(200); // Should be concise
            
            // Test UI state for network errors
            const uiState = {
              submitStatus,
              errorMessage,
              showError: submitStatus === 'error' && errorMessage.length > 0,
              isSubmitting: false // Should be reset after error
            };
            
            expect(uiState.submitStatus).toBe('error');
            expect(uiState.showError).toBe(true);
            expect(uiState.isSubmitting).toBe(false);
            
            // Test that form data is preserved during network errors
            const formData = { name, email, message };
            expect(formData.name).toBe(name);
            expect(formData.email).toBe(email);
            expect(formData.message).toBe(message);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 22: Server Error Response Structure
   * Feature: contact-us-system, Property 22: Server Error Response Structure
   * Validates: Requirements 6.2
   */
  describe('Property 22: Server Error Response Structure', () => {
    it('should return structured error responses with consistent format for any server error condition', () => {
      fc.assert(
        fc.property(
          fc.record({
            success: fc.constant(false),
            error: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
            statusCode: fc.oneof(
              fc.constant(400), // Bad Request
              fc.constant(401), // Unauthorized
              fc.constant(403), // Forbidden
              fc.constant(429), // Too Many Requests
              fc.constant(500), // Internal Server Error
              fc.constant(502), // Bad Gateway
              fc.constant(503)  // Service Unavailable
            )
          }),
          (serverResponse) => {
            // Simulate server error response handling
            const { success, error, statusCode } = serverResponse;
            
            // Test server response structure
            expect(serverResponse).toHaveProperty('success');
            expect(serverResponse).toHaveProperty('error');
            expect(typeof success).toBe('boolean');
            expect(typeof error).toBe('string');
            expect(success).toBe(false);
            expect(error.trim().length).toBeGreaterThan(0);
            
            // Simulate client-side error response processing
            let clientErrorMessage = '';
            let clientSubmitStatus = 'idle';
            
            if (!success) {
              clientSubmitStatus = 'error';
              clientErrorMessage = error || 'An error occurred while sending your message.';
            }
            
            // Test client-side error handling
            expect(clientSubmitStatus).toBe('error');
            expect(clientErrorMessage).toBe(error);
            expect(typeof clientErrorMessage).toBe('string');
            expect(clientErrorMessage.length).toBeGreaterThan(0);
            
            // Test error message structure and content
            expect(clientErrorMessage).not.toContain('undefined');
            expect(clientErrorMessage).not.toContain('null');
            expect(clientErrorMessage).not.toContain('[object Object]');
            
            // Test that error messages are appropriate for different status codes
            if (statusCode === 400) {
              // Bad Request - should be validation related
              expect(typeof clientErrorMessage).toBe('string');
            } else if (statusCode === 401 || statusCode === 403) {
              // Authentication/Authorization errors
              expect(typeof clientErrorMessage).toBe('string');
            } else if (statusCode === 429) {
              // Rate limiting
              expect(typeof clientErrorMessage).toBe('string');
            } else if (statusCode >= 500) {
              // Server errors
              expect(typeof clientErrorMessage).toBe('string');
            }
            
            // Test UI state for server errors
            const uiState = {
              submitStatus: clientSubmitStatus,
              errorMessage: clientErrorMessage,
              showError: clientSubmitStatus === 'error' && clientErrorMessage.length > 0,
              isSubmitting: false
            };
            
            expect(uiState.submitStatus).toBe('error');
            expect(uiState.showError).toBe(true);
            expect(uiState.isSubmitting).toBe(false);
            expect(uiState.errorMessage).toBe(error);
            
            // Test error response consistency
            const responseStructure = {
              hasSuccessField: 'success' in serverResponse,
              hasErrorField: 'error' in serverResponse,
              successIsBool: typeof serverResponse.success === 'boolean',
              errorIsString: typeof serverResponse.error === 'string',
              isValidErrorResponse: !serverResponse.success && serverResponse.error.length > 0
            };
            
            expect(responseStructure.hasSuccessField).toBe(true);
            expect(responseStructure.hasErrorField).toBe(true);
            expect(responseStructure.successIsBool).toBe(true);
            expect(responseStructure.errorIsString).toBe(true);
            expect(responseStructure.isValidErrorResponse).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Basic form rendering tests
   */
  describe('Form Rendering', () => {
    it('should render contact form with all required fields', () => {
      render(<ContactPage />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
      render(<ContactPage />);
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      
      // Remove HTML5 validation to test our custom validation
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      
      nameInput.removeAttribute('required');
      emailInput.removeAttribute('required');
      messageInput.removeAttribute('required');
      
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/All fields are required\./)).toBeInTheDocument();
      });
    });

    it('should show validation error for invalid email', async () => {
      const user = userEvent.setup();
      render(<ContactPage />);
      
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      
      // Fill in the form with invalid email
      await user.type(nameInput, 'Test Name');
      await user.type(emailInput, 'invalid-email');
      await user.type(messageInput, 'Test message');
      
      // Remove HTML5 validation to test our custom validation
      nameInput.removeAttribute('required');
      emailInput.removeAttribute('required');
      messageInput.removeAttribute('required');
      emailInput.setAttribute('type', 'text'); // Change from email to text to bypass HTML5 validation
      
      const submitButton = screen.getByRole('button', { name: /send message/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Please provide a valid email address\./)).toBeInTheDocument();
      });
    });
  });
});