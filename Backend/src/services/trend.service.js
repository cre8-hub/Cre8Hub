const getFakeTrends = () => {
  return [
    {
      id: 1,
      platform: "YouTube",
      topic: "AI Tools for Students",
      trendScore: 86,
      growth: "210%",
      bestTime: "7–9 PM"
    },
    {
      id: 2,
      platform: "Instagram",
      topic: "POV: College Life",
      trendScore: 92,
      growth: "180%",
      bestTime: "6–8 PM"
    }
  ];
};

module.exports = {
  getFakeTrends
};
