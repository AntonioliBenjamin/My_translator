const bcrypt = require("bcrypt");

async function checkUserPassword(password, passwordHash) {
    const match = await bcrypt.compare(password, passwordHash);
    return match;
}

module.exports = checkUserPassword;