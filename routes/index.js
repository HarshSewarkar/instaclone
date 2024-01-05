var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
var upload = require("./multer");

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});
// Assuming you have a route that renders the feed page
router.get("/feed", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const postss = await postModel.find().populate("user"); // Fetch regular posts
  // const stories = await postModel.find({ isStory: true }).populate("user"); // Fetch stories

  res.render("feed", { footer: true, user, postss });
});


router.get("/profile", isLoggedIn, async function (req, res) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate("posts");

  res.render("profile", { footer: true, user });
});

router.get("/search", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("search", { footer: true, user });
});

router.get("/username/:username", isLoggedIn, async function (req, res) {
  const regex = new RegExp(`^${req.params.username}`, "i");
  const users = await userModel.find({ username: regex });
  res.json(users);
});
router.get("/like/post/:id", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.findOne({ _id: req.params.id });
  if (post.likes.indexOf(user._id) === -1) {
    post.likes.push(user._id);
  } else {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  }
  await post.save();
  res.redirect("/feed");
});
router.get("/edit", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("edit", { footer: true, user });
});

router.get("/upload", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  res.render("upload", { footer: true, user });
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

router.post("/update", upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    { username: req.body.username, name: req.body.name, bio: req.body.bio },
    { new: true }
  );
  if (req.file) {
    user.profileImage = req.file.filename;
  }
  await user.save();
  res.redirect("/profile");
});
router.post("/upload",isLoggedIn, upload.single("image"),async function (req, res, next) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    }); //loggin user hai ismay
    const post = await postModel.create({
      picture: req.file.filename,
      user: user._id, //upper await wale user ki id
      caption: req.body.caption,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/feed");
  }
);

router.get("/profile/:username", isLoggedIn, async function (req, res) {
  const userProfile = await userModel
    .findOne({
      username: req.params.username,
    })
    .populate("posts");
  res.render("profile", { footer: true, user: userProfile });
});

// router.post("/addStory", upload.single("storyImage"), isLoggedIn, async function (req, res) {
//     const user = await userModel.findOne({ username: req.session.passport.user });

//     // Create a new post for the story
//     const story = await postModel.create({
//       picture: req.file.filename,
//       user: user._id,
//       caption: "Story", // You can customize the default caption for stories
//       isStory: true, // Add a flag to identify this as a story
//     });

//     // Add the story to the user's posts
//     user.posts.push(story._id);
//     await user.save();

//     // Send an alert message to the client
//     res.locals.alertMessage = "Story added successfully!";
//     res.redirect("/feed");
 
// });

module.exports = router;
