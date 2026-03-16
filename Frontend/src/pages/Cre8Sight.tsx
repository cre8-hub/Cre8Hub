import { useState } from "react";

const Cre8Sight = () => {
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTrends = async () => {
    if (!keyword) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/trends/youtube?keyword=${keyword}`
      );

      if (!res.ok) throw new Error("Failed to fetch trends");

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Cre8Sight 🔍</h1>
      <p>Trend analysis for YouTube keywords</p>

      <input
        type="text"
        placeholder="Enter keyword (eg: AI, finance, startups)"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ padding: "8px", width: "300px" }}
      />

      <button onClick={fetchTrends} style={{ marginLeft: "10px" }}>
        Analyze
      </button>

      {loading && <p>Analyzing trends...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <pre style={{ marginTop: "20px" }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default Cre8Sight;
