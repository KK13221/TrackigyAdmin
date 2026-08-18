/**
 * Global Configuration for API Networking
 */

export const BASE_URL = 'https://trackifybackend.inurum.com';

// Example utility function for future authenticated requests
export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'accept': '*/*',
  'Authorization': `Bearer ${token}`
});
