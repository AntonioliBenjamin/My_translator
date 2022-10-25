require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const express = require("express");
const app = express();
const port = Number(process.env.PORT);
const translate = require("./translate_function");
const db = new Map();
const dbUser = new Map();

const bcrypt = require("bcrypt");
const saltRounds = 10;

const someOtherPlaintextPassword = "not_bacon";

app.use(express.json());

function search(email, originalText) {
  const translations = db.get(email);
  if (translations) {
    const found = translations.find(
      (element) => element.originalText === originalText
    );
    if (found) {
      return found;
    }
  }
}

app.post("/translate", async (req, res) => {
  const body = {
    text: req.body.text,
    language: req.body.language,
    email: req.body.email,
  };
  const isAlreadyTranslated = search(body.email, body.text);
  if (isAlreadyTranslated) {
    console.log(isAlreadyTranslated);
    return res.send({
      originalText: body.text,
      translatedText: isAlreadyTranslated.translation,
    });
  }
  const translation = await translate(body.text, body.language);
  const translatedText = translation.data.translations[0].translatedText;
  const savedTranslation = {
    originalText: body.text,
    translation: translatedText,
    language: body.language,
  };
  const hasAlreadySavedTranslation = db.get(body.email);
  if (hasAlreadySavedTranslation) {
    hasAlreadySavedTranslation.push(savedTranslation);
    db.set(body.email, hasAlreadySavedTranslation);
  } else {
    db.set(body.email, [savedTranslation]);
  }
  return res.send({
    originalText: body.text,
    translatedText: translatedText,
  });
});

function userAlreadyExist(email) {
  const user = dbUser.get(email);
  if (user) {
    return user;
  }
}
app.post("/user", (req, res) => {
  const body = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  };

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
  console.log(dbUser);

  return res.send({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    uuid: userUUID,
    password: hash,
  });
  //const isAlreadyRegistered = body.email
});

app.listen(port, () => {
  console.log(`app listening well`);
});



