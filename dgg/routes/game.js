const express = require("express");
const User = require("../models/User");
const Game = require("../models/Game");
const scoreUser = require("../utils/score");

const router = express.Router();

function auth(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}

router.get("/dashboard", auth, async (req, res) => {
  const user = await User.findById(req.session.userId).populate("missions.missionId");
  const game = await Game.findOne();

  console.log(user, game)
  res.render("dashboard", { user, game });
});

router.post("/reveal/:id", auth, async (req, res) => {
  await User.updateOne(
    { _id: req.session.userId, "missions._id": req.params.id },
    { $set: { "missions.$.revealed": true } }
  );
  res.redirect("/game/dashboard");
});

router.post("/complete/:id", auth, async (req, res) => {
  const game = await Game.findOne();
  if(Date.now() >= game.startTime + game.duration) return res.redirect("/game/dashboard");

  await User.updateOne(
    { _id: req.session.userId, "missions._id": req.params.id },
    {
      $set: {
        "missions.$.completed": true,
        "missions.$.completedAt": new Date()
      }
    }
  );
  res.redirect("/game/dashboard");
});

router.post("/fail/:id", auth, async (req, res) => {
  await User.updateOne(
    { _id: req.session.userId, "missions._id": req.params.id },
    { $set: { "missions.$.failed": true, "missions.$.completed": false } }
  );
  res.redirect("/game/dashboard");
});

router.get("/leaderboard", auth, async (req, res) => {
  const users = await User.find();
  const game = await Game.findOne();
  
  const ranking = (await Promise.all(
    users
      .filter(u => !u.isAdmin)
      .map(async u => {
        const totalTime = await scoreUser(u, game);

        return { username: u.username, totalTime };
      })
  )).sort((a, b) => b.totalTime - a.totalTime);

  res.render("leaderboard", { ranking });
});

module.exports = router;
