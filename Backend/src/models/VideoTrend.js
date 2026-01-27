const mongoose = require("mongoose");

const VideoTrendSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  description: String,
  views: Number,
  likes: Number,
  comments: Number,
  publishedAt: Date,
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  keywords: [String]
});

module.exports = mongoose.model("VideoTrend", VideoTrendSchema);
