const VideoTrend = require("../models/VideoTrend");


export const getTrendingKeywords = async () => {
  const videos = await VideoTrend.find({
    fetchedAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });

  const keywordMap = {};

  videos.forEach(video => {
    video.keywords.forEach(word => {
      keywordMap[word] = (keywordMap[word] || 0) + 1;
    });
  });

  return Object.entries(keywordMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({
      keyword,
      count
    }));
};
