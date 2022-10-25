require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const express = require("express");
const app = express();
const port = Number(process.env.PORT);
const translate = require("./translate_function");
const bcrypt = require("bcrypt");
//const db = new Map();
const db = require('./export')
//const dbUser = new Map();
const dbUser = require('./export')
const search = require('./seachFunction')
const userAlreadyExist = require('./userAlreadyExistFunction')
const data = db;

app.use(express.json());

app.post("/translate", async (req, res) => {
  const body = {
    text: req.body.text,
    language: req.body.language,
    email: req.body.email,
  };

  const userData = dbUser.get(body.email);
  const id = userData.uuid;

  const isAlreadyTranslated = search(id, body.text);
  if (isAlreadyTranslated) {
    console.log("ça passe");
    return res.send({
      originalText: body.text,
      translatedText: isAlreadyTranslated.translation,
      uuid: id
    });
  }
  const translation = await translate(body.text, body.language);
  const translatedText = translation.data.translations[0].translatedText;
  const savedTranslation = {
    originalText: body.text,
    translation: translatedText,
    language: body.language,
  };

  const hasAlreadySavedTranslation = db.get(id);
  if (hasAlreadySavedTranslation) {
    hasAlreadySavedTranslation.push(savedTranslation);
    db.set(id, hasAlreadySavedTranslation);
  } else {
    db.set(id, [savedTranslation]);
  }

  return res.send({
    originalText: body.text,
    translatedText: translatedText,
    uuid: id
  });
});

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
  const userUUID = uuidv4();

  const user = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    uuid: userUUID,
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
    uuid: userUUID,
  });
});

app.listen(port, () => {
  console.log(`app listening ${port}`);
});