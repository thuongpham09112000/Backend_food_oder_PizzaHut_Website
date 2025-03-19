const express = require("express");
const cookieParser = require("cookie-parser");

function middlewareConfig(app) {
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
}

module.exports = middlewareConfig;
