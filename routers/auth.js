const express = require('express');
const authRouter = express.Router();
const bodyParser = require('body-parser');
const db = require('../db/db');
authRouter.use(bodyParser.json());



module.exports = authRouter;