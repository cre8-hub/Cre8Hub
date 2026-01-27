import axios from "axios";
import VideoTrend from "../models/VideoTrend.js";

const YOUTUBE_API = "https://www.googleapis.com/youtube/v3/search";

export const fetchTrendingVideos = async (keyword) => {
  const res = await axios.get(YOUTUBE_API, {
    params: {
      part: "snippet",
      q: keyword,
      type: "video",
      maxResults: 25,
      key: process.env.AIzaSyAv5iBJXm2nfq-nAIcRw2YjY0Uxdm6AfVA
    }
  });

  for (const item of res.data.items) {
    await VideoTrend.create({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      keywords: extractKeywords(item.snippet.title)
    });
  }
};
