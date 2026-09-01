// client/src/pages/HistoryPage.jsx
import { useState, useEffect } from "react";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getHistory, clearHistory } from "../services/userService.js";
import toast from "react-hot-toast";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getHistory()
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly
          setHistory(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load watch history");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleClearAll = async () => {
    if (!window.confirm("Clear your entire watch history? This cannot be undone.")) return;
    setClearing(true);
    try {
      await clearHistory();
      setHistory([]);
      toast.success("Watch history cleared!");
    } catch {
      toast.error("Failed to clear history. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  // Each entry is { video, watchedAt } — VideoGrid only needs the video itself.
  const videos = history
  return (
    <div className="library-page">
      <div className="library-page__header">
        <h1>Watch history</h1>
        {videos.length > 0 && (
          <button 
            className="library-page__action-btn" 
            onClick={handleClearAll} 
            disabled={clearing}
          >
            {clearing ? "Clearing…" : "Clear all watch history"}
          </button>
        )}
      </div>

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        emptyTitle="No watch history"
        emptyMessage="Videos you watch will show up here."
      />
    </div>
  );
}

export default HistoryPage;