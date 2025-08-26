const mongoose = require("mongoose");

const followersCountSchema = new mongoose.Schema({
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  followerCount: { type: Number, default: 0 },
});

const FollowersCount = mongoose.model("FollowersCount", followersCountSchema);

module.exports = FollowersCount;
