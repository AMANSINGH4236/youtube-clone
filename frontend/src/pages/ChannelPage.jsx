// client/src/pages/ChannelPage.jsx — FE-07
import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import ChannelHeader from "../components/channel/ChannelHeader.jsx";
import ChannelVideoList from "../components/channel/ChannelVideoList.jsx";
import CreateChannelForm from "../components/channel/CreateChannelForm.jsx";
import { getChannelById, createChannel, toggleSubscribe } from "../services/channelService.js";
import { deleteVideo } from "../services/videoService.js";
import { useAuth } from "../hooks/useAuth.js";
import toast from "react-hot-toast";

function ChannelPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthed, loading: authLoading, refreshUser } = useAuth();

  const path = location.pathname;
  const isMe = path === "/channel/me";
  const isNew = path === "/channel/new";

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  // ── Fetch / redirect ──
  useEffect(() => {
    let cancelled = false;

    if (isMe) {
      if (authLoading) return;
      if (!isAuthed) {
        navigate("/login", { replace: true });
        return;
      }
      if (user?.channels?.length > 0) {
        const firstChannelId = user.channels[0];
        if (firstChannelId) {
          navigate(`/channel/${firstChannelId}`, { replace: true });
          return;
        }
      }
      navigate("/channel/new", { replace: true });
      return;
    }

    if (isNew) {
      setLoading(false);
      setShowCreateForm(isAuthed);
      return;
    }

    if (!id) {
      setError("Channel ID is missing");
      setLoading(false);
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      setError("Invalid channel ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    getChannelById(id)
      .then((res) => {
        if (cancelled) return;
      
        // Handle both direct object and wrapped { channel: ... }
        const channelData = res.data.channel || res.data;
        setChannel(channelData);
      })
      .catch(() => {
        if (!cancelled) setError("Channel not found.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, path, isAuthed, isMe, isNew, authLoading, user, navigate]);

  // ── Ownership & subscription ──
  // Robust: owner can be string ID or populated object
  const ownerId =
    typeof channel?.owner === "string"
      ? channel.owner
      : channel?.owner?._id || null;

  const isOwner =
    isAuthed &&
    channel &&
    user?._id?.toString() === ownerId?.toString();

  // Subscription list may contain string IDs or objects
  const isSubscribed =
    isAuthed &&
    channel &&
    (user?.subscribedChannels || []).some((c) => {
      const cId = typeof c === "string" ? c : c?._id;
      return cId?.toString() === channel._id?.toString();
    });

  // ── Subscribe toggle ──
  const handleToggleSubscribe = async () => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    if (!channel?._id) {
      toast.error("Channel data is not ready. Please refresh.");
     
      return;
    }
    setSubscribeLoading(true);
    try {
      const res = await toggleSubscribe(channel._id);
      setChannel((prev) => ({ ...prev, subscribers: res.data.subscribers }));
      await refreshUser();
      toast.success(res.data.subscribed ? "Subscribed!" : "Unsubscribed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update subscription.");
    } finally {
      setSubscribeLoading(false);
    }
  };

  // ── Create channel ──
  const handleCreateChannel = async (payload) => {
    setCreating(true);
    try {
      const res = await createChannel(payload);
      await refreshUser();
      toast.success("Channel created successfully!");
      navigate(`/channel/${res.data.channel._id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create channel.");
    } finally {
      setCreating(false);
    }
  };

  // ── Delete video ──
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Delete this video? This cannot be undone.")) return;
    try {
      await deleteVideo(videoId);
      setChannel((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
      toast.success("Video deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete video.");
    }
  };

  // ── Render ──
  if (loading) return <div className="cp-loading">Loading channel…</div>;

  if (isNew && !isAuthed) {
    return (
      <div className="cp-gated">
        <p>You need to <Link to="/login">sign in</Link> to create a channel.</p>
      </div>
    );
  }

  if (isNew && showCreateForm) {
    return <CreateChannelForm onSubmit={handleCreateChannel} loading={creating} />;
  }

  if (error || !channel) {
    return (
      <div className="cp-error-page">
        <p>{error || "Channel not found."}</p>
        <Link to="/">← Back to home</Link>
      </div>
    );
  }

  return (
    <div className="cp-body">
      <ChannelHeader
        channel={channel}
        isOwner={isOwner}
        isSubscribed={isSubscribed}
        subscribeLoading={subscribeLoading || !channel._id}
        onToggleSubscribe={handleToggleSubscribe}
      />
      <div className="cp-tabs">
        <button className="cp-tab cp-tab--active">Videos</button>
      </div>
      <div className="cp-content">
        <ChannelVideoList
          videos={channel.videos || []}
          isOwner={isOwner}
          onDelete={handleDeleteVideo}
        />
      </div>
    </div>
  );
}

export default ChannelPage;