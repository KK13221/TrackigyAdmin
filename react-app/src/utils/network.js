/**
 * Global Configuration for API Networking
 */

export const BASE_URL = 'http://139.59.1.109:5000';

// Example utility function for future authenticated requests
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'accept': '*/*',
  'Authorization': `Bearer ${token}`
});
