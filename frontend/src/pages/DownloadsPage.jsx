// client/src/pages/DownloadsPage.jsx
import { useState, useEffect } from "react";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getDownloads } from "../services/userService.js";

function DownloadsPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDownloads()
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly
          setVideos(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load downloaded videos");
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
        <h1>Downloads</h1>
      </div>

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        emptyTitle="No downloaded videos"
        emptyMessage="Videos you download will appear here. Use the save button on any video."
      />
    </div>
  );
}

export default DownloadsPage;