import { useEffect, useState } from "react";
import { getTrends } from "../services/cre8sight";

export default function Cre8Sight() {
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    getTrends().then(data => setTrends(data.trends));
  }, []);

  return (
    <div>
      <h1>🔥 Trending Now</h1>
      {trends.map((t:any) => (
        <div key={t.keyword}>
          <strong>{t.keyword}</strong> — {t.count} videos
        </div>
      ))}
    </div>
  );
}


