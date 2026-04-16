// -------------------------------------------------------
// auth.js — Boundary helper functions
// Handles login state and API calls
// No tokens or hashing — just saves user info in the browser
// -------------------------------------------------------

// The address of the backend server
const API_URL = 'http://localhost:3000';

// -------------------------------------------------------
// GET USER — reads the saved user info from the browser
// -------------------------------------------------------
export function getUser() {
  // typeof window check needed because Next.js runs on the server too
  // localStorage only exists in the browser
  if (typeof window === 'undefined') {
    return null;
  }

  // Get the user string from storage
  const userString = localStorage.getItem('user');

  // If nothing saved, return null
  if (!userString) {
    return null;
  }

  // Convert the string back to an object and return it
  return JSON.parse(userString);
}

// -------------------------------------------------------
// LOGOUT — clears login info and sends user back to login page
// -------------------------------------------------------
export function logout() {
  // Step 1: Get the saved user info
  const user = getUser();

  // Step 2: Tell the server the user is logging out
  if (user) {
    fetch(API_URL + '/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id':   user.userID,
        'x-user-role': user.role
      }
    }).catch(function() {
      // If this fails it does not matter
      // We still log out on the browser side
    });
  }

  // Step 3: Delete the user info from the browser storage
  localStorage.removeItem('user');

  // Step 4: Send the user back to the login page
  window.location.href = '/';
}

// -------------------------------------------------------
// REQUIRE AUTH — protects a page from unauthenticated users
// Call this at the top of every dashboard page
// -------------------------------------------------------
export function requireAuth(expectedRole) {
  // Step 1: Get user from storage
  const user = getUser();

  // Step 2: If no user saved, redirect to login page
  if (!user) {
    window.location.href = '/';
    return null;
  }

  // Step 3: If the user has the wrong role, redirect to login page
  if (expectedRole && user.role !== expectedRole) {
    window.location.href = '/';
    return null;
  }

  // Step 4: User is authenticated and has the right role
  return user;
}

// -------------------------------------------------------
// API FETCH — makes a request to the backend server
// Automatically adds the user info headers to every request
// -------------------------------------------------------
export async function apiFetch(path, method, body) {
  // Step 1: Get the current user
  const user = getUser();

  // Step 2: Set up the request options
  const options = {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Send user info in headers so the server knows who is making the request
      'x-user-id':   user ? user.userID : '',
      'x-user-role': user ? user.role   : ''
    }
  };

  // Step 3: If a body was provided (for POST and PUT), add it to the request
  if (body) {
    options.body = JSON.stringify(body);
  }

  // Step 4: Make the request and return the response
  const response = await fetch(API_URL + path, options);
  return response;
}