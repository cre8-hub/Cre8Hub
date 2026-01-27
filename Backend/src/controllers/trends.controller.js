// Backend/src/controllers/trends.controller.js

const testTrends = (req, res) => {
  res.json({
    success: true,
    message: "Trends controller working"
  });
};

const axios = require("axios");

const getYoutubeTrends = async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,statistics",
          chart: "mostPopular",
          regionCode: "IN",
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY
        }
      }
    );

    const trends = response.data.items.map(video => ({
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      views: video.statistics.viewCount,
      thumbnail: video.snippet.thumbnails.medium.url
    }));

    res.json({
      success: true,
      platform: "YouTube",
      trends
    });
  } catch (error) {
    console.error("YouTube API Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch YouTube trends"
    });
  }
};

module.exports = {
  testTrends,
  getYoutubeTrends
};

