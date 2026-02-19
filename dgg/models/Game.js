const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
  started: { type: Boolean, default: false },
  startTime: Date,
  duration: { type: Number, default: 3600000 * 2 } // 2h
})

gameSchema.virtual('endTime').get(function() {
  return new Date(this.startTime.getTime() + this.duration);
});

module.exports = mongoose.model("Game", gameSchema)