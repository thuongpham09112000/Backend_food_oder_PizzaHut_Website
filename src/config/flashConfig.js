const flash = require("connect-flash");

function flashConfig(app) {
  app.use(flash());

  app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.info = req.flash("info");
    res.locals.error = req.flash("error");
    next();
  });
}

module.exports = flashConfig;
