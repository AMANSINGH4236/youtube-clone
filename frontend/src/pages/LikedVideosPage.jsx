// client/src/pages/LikedVideosPage.jsx
import { useState, useEffect } from "react";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getLikedVideos } from "../services/userService.js";

function LikedVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getLikedVideos()
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly
          setVideos(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load liked videos");
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
        <h1>Liked videos</h1>
      </div>

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        emptyTitle="No liked videos"
        emptyMessage="Videos you like will show up here. Unlike a video from its watch page to remove it."
      />
    </div>
  );
}

export default LikedVideosPage;