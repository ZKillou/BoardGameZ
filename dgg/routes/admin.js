const express = require("express");
const Game = require("../models/Game");
const User = require("../models/User");
const Mission = require("../models/Mission");
const assignMissionsToUser = require("../utils/assignMissions");

const router = express.Router();

function adminOnly(req, res, next) {
  if (!req.session.isAdmin) return res.redirect("/game/dashboard");
  next();
}

router.get("/", adminOnly, async (req, res) => {
  const users = await User.find();
  res.render("admin", { users });
});

router.post("/start", adminOnly, async (req, res) => {
  const start = new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  await Game.deleteMany({});
  await Game.create({ started: true, startTime: start, endTime: end });

  const users = await User.find({ isAdmin: false });

  for (let user of users) {
    user.missions = []; // reset si nouvelle partie
    await user.save();
    await assignMissionsToUser(user._id);
  }

  res.redirect("/admin");
});

router.post("/reroll/:userId/:missionSubId", adminOnly, async (req, res) => {
  const { userId, missionSubId } = req.params;

  const user = await User.findById(userId);
  if (!user) return res.redirect("/admin");

  const missionSub = user.missions.id(missionSubId);
  if (!missionSub) return res.redirect("/admin");

  const difficulty = missionSub.difficulty;

  const missions = await Mission.find({ difficulty });

  if (!missions.length) return res.redirect("/admin");

  const filtered = missions.filter(m => m._id.toString() !== missionSub.missionId.toString());

  if (!filtered.length) return res.redirect("/admin");

  const newMission = filtered[Math.floor(Math.random() * filtered.length)];

  // Remplacement
  missionSub.missionId = newMission._id;
  missionSub.revealed = false;
  missionSub.completed = false;
  missionSub.completedAt = null;
  missionSub.failed = false;

  await user.save();

  res.redirect("/admin");
});

router.post("/invalidate/:userId/:missionId", adminOnly, async (req, res) => {
  await User.updateOne(
    { _id: req.params.userId, "missions._id": req.params.missionId },
    { $set: { "missions.$.completed": false, "missions.$.failed": true } }
  );
  res.redirect("/admin");
});

router.post("/reset/:userId/:missionId", adminOnly, async (req, res) => {
  await User.updateOne(
    { _id: req.params.userId, "missions._id": req.params.missionId },
    { $set: { "missions.$.completed": false, "missions.$.failed": false } }
  );
  res.redirect("/admin");
});

module.exports = router;
