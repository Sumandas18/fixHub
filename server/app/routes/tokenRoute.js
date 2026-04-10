const express = require("express");

const tokenController = require("../controllers/tokenController");

const Router = express.Router();

Router.post("/generate", tokenController.generateAccess);

module.exports = Router;