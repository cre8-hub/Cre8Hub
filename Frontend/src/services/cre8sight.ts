export const getTrends = async () => {
  const res = await fetch("/api/cre8sight/trends");
  return res.json();
};
