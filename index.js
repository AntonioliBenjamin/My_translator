require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const express = require("express");
const app = express();
const port = Number(process.env.PORT);
const JWT_SECRET = process.env.JWT_SECRET;
const translate = require("./translate_function");
const bcrypt = require("bcrypt");
const { db, dbUser } = require("./export");
const search = require("./seachFunction");
const userAlreadyExist = require("./userAlreadyExistFunction");
const jwt = require("jsonwebtoken");

app.use(express.json());

app.post("/user", (req, res) => {
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

  const findUserExist = userAlreadyExist(body.email);
  if (findUserExist) {
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

app.post("/signin", (req, res) => {
  const body = {
    email: req.body.email,
    password: req.body.password,
  };
  const user = dbUser.get(body.email);

  if (body.email !== user.email)
    return res.status(401).send({
      message: "bad email",
    });
  bcrypt.compare(body.password, user.password, function (err, result) {
    if (err) {
      throw err;
    }
    if (result) {
      const token = jwt.sign(
        {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          uuid: user.uuid,
        },
        JWT_SECRET
      );

      dbUser.set(user.email, { user, token });
  

      return res.send({
        token: token,
        email: user.email,
        userId: user.uuid,
      });
    } else {
      return res.status(401).send({
        message: "bad password",
      });
    }
  });
});

app.use((req, res, next) => {
  const headers = {
    token: req.headers.jwt_token,
  };

  const body = {
    email: req.body.email,
  };
  //const decodedUserToken = jwt.verify(headers.token, JWT_SECRET);

  const user = dbUser.get(body.email);

  if (headers.token === user.token) {
    /*res.send({
      userData: decodedUserToken,
    });*/
    next();
  } else {
    res.status(401).end();
  }
});

app.post("/translate", async (req, res) => {
  const body = {
    text: req.body.text,
    language: req.body.language,
    email: req.body.email,
  };

  const userData = dbUser.get(body.email);
  const userId = userData.uuid;

  const isAlreadyTranslated = search(userId, body.text);
  if (isAlreadyTranslated) {
    return res.send({
      originalText: body.text,
      translatedText: isAlreadyTranslated.translation,
      uuid: userId,
    });
  }
  const translation = await translate(body.text, body.language);
  const translatedText = translation.data.translations[0].translatedText;
  const savedTranslation = {
    originalText: body.text,
    translation: translatedText,
    language: body.language,
  };

  const hasAlreadySavedTranslation = db.get(userId);
  if (hasAlreadySavedTranslation) {
    hasAlreadySavedTranslation.push(savedTranslation);
    db.set(userId, hasAlreadySavedTranslation);
  } else {
    db.set(userId, [savedTranslation]);
  }

  return res.send({
    originalText: body.text,
    translatedText: translatedText,
    uuid: userId,
  });
});

app.listen(port, () => {
  console.log(`app listening ${port}`);
});