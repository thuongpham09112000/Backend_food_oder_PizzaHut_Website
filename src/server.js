require("dotenv").config();
const express = require("express");
const path = require("path");
const webAdminRouter = require("./routers/webAdmin");
const api = require("./routers/api");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import các cấu hình
const sessionConfig = require("./config/sessionConfig");
const flashConfig = require("./config/flashConfig");
const middlewareConfig = require("./config/middlewareConfig");
const viewConfig = require("./config/viewConfig");

const app = express();
const port = process.env.PORT || 3000;
const hostname = process.env.HOSTNAME || "localhost";

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(cookieParser());

// Áp dụng middleware chung
middlewareConfig(app);

// Cấu hình session
app.use(sessionConfig);

// Cấu hình Flash messages
flashConfig(app);

// Cấu hình View Engine
viewConfig(app);

// Khai báo router
app.use("/admin", webAdminRouter);
app.use("/api", api);

// Debug: In danh sách các route
app._router.stack.forEach((route) => {
  if (route.route) {
    console.log(route.route.path);
  }
});

const baseUrl = `http://${hostname}:${port}`;

app.listen(port, () => {
  console.log(`Server running at http://${hostname}:${port}/admin`);
});

module.exports = { app, baseUrl };
