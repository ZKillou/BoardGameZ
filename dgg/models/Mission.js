const mongoose = require("mongoose")

const missionSchema = new mongoose.Schema({
    description: String,
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"]
    }
})

module.exports = mongoose.model("Missions", missionSchema)
