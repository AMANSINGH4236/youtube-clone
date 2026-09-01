// client/src/pages/ShortsPage.jsx
import { useState, useEffect } from "react";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getVideos } from "../services/videoService.js";

function ShortsPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getVideos({ isShort: true })
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly
          setVideos(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load Shorts");
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
        <h1>Shorts</h1>
      </div>

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        emptyTitle="No Shorts yet"
        emptyMessage="Check the Short box when uploading a video to see it here."
      />
    </div>
  );
}

export default ShortsPage;