const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function authorization(req, res, next)  {
    const headers = {
      token: req.headers.jwt_token,
    };

    try {
      const decodedUserToken = jwt.verify(headers.token, JWT_SECRET);
      req.userData = decodedUserToken;
      return next();
    } catch (err) {
      return res.sendStatus(401);
      
    }
  };

  module.exports = authorization;