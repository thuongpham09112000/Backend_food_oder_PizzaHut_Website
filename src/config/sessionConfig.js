const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "DB_Food_order_PizzaHut",
});

const sessionConfig = session({
  secret: process.env.SESSION_SECRET || "default_secret_key",
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  },
});

module.exports = sessionConfig;
