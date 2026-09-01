// client/src/pages/SubscriptionsPage.jsx
import { useState, useEffect } from "react";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getSubscriptionsFeed } from "../services/userService.js";
import { useAuth } from "../hooks/useAuth.js";

function SubscriptionsPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getSubscriptionsFeed()
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly
          setVideos(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load subscriptions feed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const hasSubscriptions = (user?.subscribedChannels || []).length > 0;

  return (
    <div className="library-page">
      <div className="library-page__header">
        <h1>Subscriptions</h1>
      </div>

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        emptyTitle={hasSubscriptions ? "No new videos" : "No subscriptions yet"}
        emptyMessage={
          hasSubscriptions
            ? "New videos from channels you follow will show up here."
            : "Subscribe to a channel to see its videos here."
        }
      />
    </div>
  );
}

export default SubscriptionsPage;