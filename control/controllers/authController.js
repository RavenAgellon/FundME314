const User = require('../../entity/User');

// -------------------------------------------------------
// LOGIN — User stories #10, #17, #24, #40
// -------------------------------------------------------
async function login(req, res) {
  try {
    // Step 1: Read username and password from the request
    const username = req.body.username;
    const password = req.body.password;

    // Step 2: Look for a user in the database with that username
    const user = await User.findOne({ username: username });

    // Step 3: If no user found, stop and return an error
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Step 4: If the user account is suspended, stop and return an error
    if (user.suspended === true) {
      return res.status(403).json({ message: 'Your account has been suspended. Please contact an admin.' });
    }

    // Step 5: Check if the password entered matches the one stored in the database
    const passwordIsCorrect = (password === user.password);

    // Step 6: If password is wrong, stop and return an error
    if (!passwordIsCorrect) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Step 7: Build the user info object to send back
    const userInfo = {
      id:       user._id,
      userID:   user.userID,
      username: user.username,
      role:     user.role,
      name:     user.name
    };

    // Step 8: Send the user info back to the browser
    // The browser will save this to remember who is logged in
    res.json({ user: userInfo });

  } catch (err) {
    // If something unexpected went wrong, return a server error
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// -------------------------------------------------------
// LOGOUT — User stories #11, #18, #25, #41
// -------------------------------------------------------
function logout(req, res) {
  // Just confirm logout — the browser will clear the saved user info
  res.json({ message: 'Logged out successfully' });
}

module.exports = { login, logout };