require("dotenv").config();
const express = require("express");
const app = express();
const port = Number(process.env.PORT);
const user = require('./src/routes/users')
const authorization = require('./src/midleware/AuthorizationMiddleware')
const translate = require('./src/routes/translate')

app.use(express.json());

app.use('/user', user);

app.use(authorization);  

app.use('/translate', translate);

app.listen(port, () => {
  console.log(`app listening ${port}`);
});