const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: String,
  isAdmin: { type: Boolean, default: false },
  missions: [
    {
      missionId: { type: mongoose.Schema.Types.ObjectId, ref: "Missions" },
      difficulty: String,
      revealed: { type: Boolean, default: false },
      failed: { type: Boolean, default: false },
      completed: { type: Boolean, default: false },
      completedAt: Date
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
