const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Game = require("../models/Game");
const assignMissionsToUser = require("../utils/assignMissions");

const router = express.Router();

function auth(req, res, next) {
  if (req.session.userId) return res.redirect("/game/dashboard");
  next();
};

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/register", auth, (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    username: req.body.username,
    password: hashed
  });

  const game = await Game.findOne({ started: true });

  if (game && new Date() < game.endTime) {
    await assignMissionsToUser(user._id);
  }

  res.redirect("/login");
});

router.get("/login", auth, (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.redirect("/login");

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.redirect("/login");

  req.session.userId = user._id;
  req.session.isAdmin = user.isAdmin;

  res.redirect("/game/dashboard");
});

module.exports = router;
