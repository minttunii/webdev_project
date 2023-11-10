const { getCredentials } = require('../utils/requestUtils');
const User = require('../models/user');

/**
 * Get current user based on the request headers
 *
 * @param {http.IncomingMessage} request
 * @returns {Object|null} current authenticated user or null if not yet authenticated
 */
const getCurrentUser = async request => {
  // TODO: 8.5 Implement getting current user based on the "Authorization" request header

  // NOTE: You can import two methods which can be useful here: // - getCredentials(request) function from utils/requestUtils.js
  // - getUser(email, password) function from utils/users.js to get the currently logged in user

  const userArr = getCredentials(request);

  if (userArr === null) {
    return null;
  }
  else {
    const emailUser = await User.findOne({ email: userArr[0]}).exec();
    if (emailUser === null) {
      return null;
    }
    const isPasswordCorrect = await emailUser.checkPassword(userArr[1]);
    if (!isPasswordCorrect) {
      return null;
    }

    return emailUser
  }

  // throw new Error('Not Implemented');
};

module.exports = { getCurrentUser };