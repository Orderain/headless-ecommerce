import { useState, useEffect } from "react";

export function useMobiles() {
  const [mobiles, setMobiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Check if we have data in Session Storage (Browser Cache)
    const cachedData = sessionStorage.getItem("mobiles_cache");

    if (cachedData) {
      setMobiles(JSON.parse(cachedData));
      setLoading(false);
      return; // Stop here, no need to fetch
    }

    const fetchMobiles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/mobiles");
        if (!res.ok) throw new Error("Failed to fetch mobiles");

        const data = await res.json();

        // 2. Save to Session Storage for next time
        sessionStorage.setItem("mobiles_cache", JSON.stringify(data));

        setMobiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMobiles();
  }, []);

  return { mobiles, loading, error };
}
