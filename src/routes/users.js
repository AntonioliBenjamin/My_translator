const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { dbUser } = require("../../databases");
const userAlreadyExist = require("../../functions/userAlreadyExistFunction");
const jwt = require("jsonwebtoken");
const checkUserPassword = require("../../functions/checkUserPassword");
const JWT_SECRET = process.env.JWT_SECRET;
const authorization = require('../midleware/AuthorizationMiddleware')

router.post("/", (req, res) => {
  const body = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email.toLowerCase().trim(),
    password: req.body.password,
  };

  const saltRounds = 10;
  const myPlaintextPassword = body.password;
  const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
  const userUuid = uuidv4();

  const user = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    uuid: userUuid,
    password: hash,
  };

  const isUserExist = userAlreadyExist(body.email);
  if (isUserExist) {
    return res.status(400).send({
      message: "User already registered!",
    });
  }

  dbUser.set(body.email, user);

  return res.send({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    uuid: userUuid,
  });
});

router.post("/signin", async (req, res) => {
  const body = {
    email: req.body.email,
    password: req.body.password,
  };
  const user = dbUser.get(body.email);

  if (!user) {
    return res.status(401).send({
      message: "bad email",
    });
  }
  const userPasswordHash = user.password;
  const userPassword = body.password;

  const match = await checkUserPassword(userPassword, userPasswordHash);
  if (!match) {
    return res.sendStatus(400);
  }
  const token = jwt.sign(
    {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      uuid: user.uuid,
    },
    JWT_SECRET
  );
  return res.send({
    token: token,
    email: user.email,
    userId: user.uuid,
  });
});

router.use(authorization);  

router.patch("/update", (req, res) => {
  const body = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  };

  const user = {
    email: req.userData.email,
    uuid: req.userData.uuid,
  };

  const userDbInfo = dbUser.get(user.email);
  const hashPassword = userDbInfo.password;

  const updatedUser = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: user.email,
    uuid: user.uuid,
    password: hashPassword,
  };

  dbUser.set(user.email, updatedUser);

  return res.send({
    firstName: body.firstName,
    lastName: body.lastName,
    email: user.email,
    uuid: user.uuid,
  });
});

module.exports = router;
