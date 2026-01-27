const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";

export const getYouTubeTrends = async () => {
  const response = await fetch(`${BASE_URL}/api/trends/youtube`, {
    credentials: "include", // important for auth later
  });

  if (!response.ok) {
    throw new Error("Failed to fetch YouTube trends");
  }

  return response.json();
};

