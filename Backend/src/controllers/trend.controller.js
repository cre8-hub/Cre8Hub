const { getTrendingKeywords } = require("../services/trends.service");


export const fetchTrends = async (req, res) => {
  try {
    const trends = await getTrendingKeywords();
    res.json({ success: true, trends });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

