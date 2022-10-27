const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authorization(req, res, next)  {
    const headers = {
      token: req.headers.access_token,
    };

    try {
      const decodedUserToken = jwt.verify(headers.token, JWT_SECRET);
      req.user  = decodedUserToken;
      return next();
    } catch (err) {
      return res.sendStatus(401);
      
    }
  };

  module.exports = authorization;