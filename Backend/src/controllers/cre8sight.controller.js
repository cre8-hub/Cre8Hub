const googleTrends = require('google-trends-api');

exports.getTrends = async (req, res) => {
  try {
    const { keyword = 'technology' } = req.query;

    const results = await googleTrends.interestOverTime({
      keyword,
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
      geo: 'IN'
    });

    const parsed = JSON.parse(results);

    const timelineData =
      parsed.default.timelineData.map(item => ({
        time: item.formattedTime,
        value: item.value[0]
      }));

    res.status(200).json({
      success: true,
      keyword,
      data: timelineData
    });
  } catch (error) {
    console.error('Cre8Sight Trend Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trend data'
    });
  }
};
