// client/src/pages/YourVideosPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getYourVideos } from "../services/userService.js";

function YourVideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getYourVideos()
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly
          setVideos(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load your videos");
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
        <h1>Your videos</h1>
        <Link to="/upload" className="library-page__action-btn">
          + Upload video
        </Link>
      </div>

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        emptyTitle="No videos uploaded"
        emptyMessage="Videos you upload will show up here."
      />
    </div>
  );
}

export default YourVideosPage;