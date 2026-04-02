// ajax.js
// Utility functions for making AJAX requests to the backend API

/**
 * Make a GET request to the backend API
 * @param {string} url - The API endpoint
 * @returns {Promise<any>} - The response data
 */
export async function apiGet(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

/**
 * Make a POST request to the backend API
 * @param {string} url - The API endpoint
 * @param {object} data - The data to send
 * @returns {Promise<any>} - The response data
 */
export async function apiPost(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}
