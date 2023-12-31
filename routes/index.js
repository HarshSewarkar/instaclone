var express = require("express");
var router = express.Router();
var userModel = require("./users");
var passport = require("passport");
var passport = require("passport");
var passport = require("passport");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", isLoggedIn, function (req, res) {
  res.render("feed", { footer: true });
});

router.get("/profile", isLoggedIn, function (req, res) {
  res.render("profile", { footer: true });
});

router.get("/search", isLoggedIn, function (req, res) {
  res.render("search", { footer: true });
});

router.get("/edit", isLoggedIn, function (req, res) {
  res.render("edit", { footer: true });
});

router.get("/upload", isLoggedIn, function (req, res) {
  res.render("upload", { footer: true });
});

router.post("/register", function (req, res, next) {
  var userData = new userModel({
    //require user model for these step
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    //  profileImage: req.body.name,
  });

  userModel
    .register(userData, req.body.password)
    .then(function (u) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })

    .catch(function (e) {
      res.send(e);
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile", //jo bhi page dikhana ho vo dalo yaha
    failureRedirect: "/login", //Loggin fail hone par kis page par bhejna hai
  }),
  function (req, res, next) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

//Middleware function / Login Authentication kai liye code

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login"); //Loggin fail hone par kis page par bhejna hai
  }
}

module.exports = router;
