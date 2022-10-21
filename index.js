require("dotenv").config();
const apiKeyTrad = process.env.API_KEY;
const axios = require("axios");
const express = require("express");
const app = express();
const port = process.env.PORT;
const translate = require('./translate_function')

app.use(express.json());

app.post("/translate", async (req, res) => {
  const body = req.body;
  const params = {
    text: body.text,
    language: body.language,
    translatedLanguage: body.translatedLanguage
  };
  const result = {
    translatedText: await translate(params.text, params.translatedLanguage, params.language),
    originalText: params.text,
  };
  return res.send(result);
});

app.listen(port, () => {
    console.log(`app listening well`);
  });
  //ok