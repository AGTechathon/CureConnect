const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "completed"],
        default: "pending"
    },
    roomId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("EmergencyNotification", emergencySchema);