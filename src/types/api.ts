/**
 * API Response Types
 * Type definitions for API responses used throughout the application
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Stripe checkout session response
 */
export interface CheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Stripe billing portal session response
 */
export interface PortalResponse {
  url: string;
}

/**
 * Email request payload
 */
export interface EmailRequest {
  email: string;
  name?: string;
}

/**
 * Email sending response
 */
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
