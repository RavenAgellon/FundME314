// -------------------------------------------------------
// PROTECT — checks if the user is logged in
// Reads the userID sent in the request header
// -------------------------------------------------------
function protect(req, res, next) {
  // Step 1: Get the userID from the request header
  // The boundary sends this with every request after login
  const userID = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'];

  // Step 2: If no userID found, the user is not logged in
  if (!userID || !userRole) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Step 3: Save the user info to the request
  // so the next function (controller) can use it
  req.user = {
    userID: userID,
    role:   userRole
  };

  // Step 4: Move on to the next function (controller)
  next();
}

// -------------------------------------------------------
// AUTHORIZE — checks if the user has the right role
// -------------------------------------------------------
function authorize() {
  // Get the list of allowed roles passed in
  const allowedRoles = Array.from(arguments);

  return function(req, res, next) {
    // Step 1: Get the role of the currently logged in user
    const userRole = req.user.role;

    // Step 2: Check if the user's role is in the allowed list
    const roleIsAllowed = allowedRoles.includes(userRole);

    // Step 3: If not allowed, stop and return error
    if (!roleIsAllowed) {
      return res.status(403).json({ message: 'Access denied: insufficient role' });
    }

    // Step 4: Role is allowed, move on to the controller
    next();
  };
}

module.exports = { protect, authorize };