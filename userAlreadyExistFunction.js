const dbUser = require('./export')

function userAlreadyExist(email) {
    const user = dbUser.get(email);
    if (user) {
      return user;
    }
  }

  module.exports = userAlreadyExist;