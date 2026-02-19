const Mission = require("../models/Mission");
const User = require("../models/User");

async function getRandomMission(difficulty) {
  const missions = await Mission.find({ difficulty });
  if (!missions.length) return null;

  const random = missions[Math.floor(Math.random() * missions.length)];
  return random;
}

async function assignMissionsToUser(userId) {
  const user = await User.findById(userId);

  if (!user) return;

  // Évite de réassigner si déjà attribué
  if (user.missions && user.missions.length > 0) return;

  const difficulties = ["easy", "medium", "hard"];
  const assigned = [];

  for (let diff of difficulties) {
    const mission = await getRandomMission(diff);
    if (mission) {
      assigned.push({
        missionId: mission._id,
        difficulty: diff,
        revealed: false,
        completed: false
      });
    }
  }

  user.missions = assigned;
  await user.save();
}

module.exports = assignMissionsToUser;
