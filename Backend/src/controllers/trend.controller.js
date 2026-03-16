// CommonJS import (IMPORTANT)
const googleTrends = require("google-trends-api");

const getCre8SightData = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Keyword is required",
      });
    }

    const trendsRaw = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      geo: "IN",
    });

    const parsed = JSON.parse(trendsRaw);
    const timeline = parsed?.default?.timelineData || [];

    if (timeline.length === 0) {
      return res.json({
        success: true,
        feature: "Cre8Sight",
        keyword,
        data: [],
      });
    }

    const values = timeline.map((t) => t.value[0]);

    const avg =
      values.reduce((a, b) => a + b, 0) / values.length;

    const recent = values.slice(-7);
    const recentAvg =
      recent.reduce((a, b) => a + b, 0) / recent.length;

    const trendScore = Math.round(recentAvg);

    const data = [
      {
        title: `${keyword} content ideas`,
        platform: "YouTube",
        trendScore,
        signal:
          recentAvg > avg
            ? "Rising 🔥"
            : recentAvg < avg
            ? "Declining ⚠️"
            : "Stable 📊",
        recommendation:
          recentAvg > avg
            ? "Post immediately"
            : "Monitor trend",
      },
    ];

    res.json({
      success: true,
      feature: "Cre8Sight",
      keyword,
      data,
    });
  } catch (error) {
    console.error("❌ Cre8Sight error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trend data",
    });
  }
};

module.exports = { getCre8SightData };
