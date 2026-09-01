// client/src/pages/WatchLaterPage.jsx
import { useState, useEffect } from "react";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getWatchLater } from "../services/userService.js";

function WatchLaterPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getWatchLater()
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly
          setVideos(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load watch later videos");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="library-page">
      <div className="library-page__header">
        <h1>Watch later</h1>
      </div>

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        emptyTitle="No videos saved"
        emptyMessage="Videos you save to watch later will show up here. Use the save button on any video."
      />
    </div>
  );
}

export default WatchLaterPage;