import { useQuery } from "@tanstack/react-query";
import { getYouTubeTrends } from "@/services/trendsApi";

export default function YouTubeTrends() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["youtube-trends"],
    queryFn: getYouTubeTrends,
  });

  if (isLoading) return <div>Loading trends...</div>;
  if (error) return <div className="text-red-500">Failed to load trends</div>;

  return (
    <div className="space-y-4">
      {data.trends.map((video, idx) => (
        <div key={idx} className="flex gap-4 p-4 rounded-xl border bg-card">
          <img
            src={video.thumbnail}
            className="w-32 rounded-lg"
            alt={video.title}
          />
          <div>
            <h3 className="font-semibold">{video.title}</h3>
            <p className="text-sm text-muted-foreground">
              {video.channel}
            </p>
            <p className="text-sm">{video.views} views</p>
          </div>
        </div>
      ))}
    </div>
  );
}
