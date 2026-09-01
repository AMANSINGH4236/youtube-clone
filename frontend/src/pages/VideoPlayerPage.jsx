// client/src/pages/VideoPlayerPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/video/VideoPlayer.jsx";
import CommentSection from "../components/comments/CommentSection.jsx";
import SaveMenu from "../components/video/SaveMenu.jsx";
import { getVideoById, getVideos, likeVideo, dislikeVideo } from "../services/videoService.js";
import { getCommentsForVideo, addComment, updateComment, deleteComment } from "../services/commentService.js";
import { toggleSubscribe } from "../services/channelService.js";
import { addHistory } from "../services/userService.js";
import { useAuth } from "../hooks/useAuth.js";
import { formatViews, formatDate} from "../utils/formatViews.js";
import toast from "react-hot-toast";

const SUGGESTION_CHIPS = ["All", "Related", "For you", "Recently uploaded", "Watched"];
const FALLBACK_THUMB   = "https://placehold.co/168x94/272727/aaaaaa?text=No+Thumbnail";

function formatDuration(s) {
  if (!s || isNaN(s)) return null;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${m}:${String(sec).padStart(2,"0")}`;
}

function ThumbUpIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      {filled
        ? <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
        : <path d="M9 21h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2zm0-12.41L11.17 6.4l-.41 1.98-.56 2.62H19v1.66l-2.97 6.93L9 18.59V8.59zM1 9h4v12H1z"/>
      }
    </svg>
  );
}

function ThumbDownIcon({ filled }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      {filled
        ? <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
        : <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm0 11.59L12.83 16.6l.41-1.98.56-2.62H5v-1.66L7.97 3.4 15 3.41V14.59zM19 3h4v12h-4z"/>
      }
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
      <path d="M15 5.63 20.66 12 15 18.37V15h-1c-3.96 0-7.14 1-9.75 3.09 1.04-4.74 4.05-8.44 9.75-9.89V5.63M14 3v5c-5.22.7-9.19 4.44-10.5 9.33C2.1 20.19 1 24 1 24s4.22-1.1 6.47-2.65C10.21 19.44 12.94 19 15 19h.5v5l8.5-6-8.5-6z"/>
    </svg>
  );
}

function VideoPlayerPage() {
  const { id } = useParams();
  const { user, isAuthed, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [video,         setVideo]         = useState(null);
  const [videoLoading,  setVideoLoading]  = useState(true);
  const [videoError,    setVideoError]    = useState(false);
  const [comments,      setComments]      = useState([]);
  const [suggestions,   setSuggestions]   = useState([]);
  const [activeChip,    setActiveChip]    = useState("All");
  const [descExpanded,  setDescExpanded]  = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const [likesCount,      setLikesCount]      = useState(0);
  const [dislikesCount,   setDislikesCount]   = useState(0);
  const [userHasLiked,    setUserHasLiked]    = useState(false);
  const [userHasDisliked, setUserHasDisliked] = useState(false);
  const [likeLoading,     setLikeLoading]     = useState(false);

  // Fetch video
  useEffect(() => {
    let cancelled = false;
    setVideoLoading(true);
    setVideoError(false);
    getVideoById(id)
      .then((res) => {
        if (cancelled) return;
        const v = res.data;  // ✅ fixed
        setVideo(v);
        setLikesCount(v.likes?.length ?? 0);
        setDislikesCount(v.dislikes?.length ?? 0);
      })
      .catch(() => {
        if (!cancelled) setVideoError(true);
      })
      .finally(() => {
        if (!cancelled) setVideoLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  // Sync like/dislike states
  useEffect(() => {
    if (!video || !user) {
      setUserHasLiked(false);
      setUserHasDisliked(false);
      return;
    }
    const matchesUser = (uid) => uid === user._id || uid?._id === user._id;
    setUserHasLiked(video.likes?.some(matchesUser) ?? false);
    setUserHasDisliked(video.dislikes?.some(matchesUser) ?? false);
  }, [video, user]);

  // Log history
  useEffect(() => {
    if (isAuthed && video?._id) {
    console.log("📝 Adding to history:", video._id); // 👈 ADD THIS
    addHistory(video._id).catch((err) => {
      console.error("❌ History error:", err); // 👈 ADD THIS
    });
  }
  }, [isAuthed, video?._id]);

  // Fetch comments
  useEffect(() => {
    let cancelled = false;
    getCommentsForVideo(id)
      .then((res) => {
        if (!cancelled) setComments(res.data); // ✅ fixed
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  // Fetch suggestions
  useEffect(() => {
    let cancelled = false;
    getVideos({}) // ✅ removed limit
      .then((res) => {
        if (cancelled) return;
        const vids = res.data || []; // ✅ fixed
        setSuggestions(vids.filter((v) => v._id !== id).slice(0, 15));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  const handleLike = async () => {
    if (!isAuthed || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await likeVideo(id);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
      setUserHasLiked(res.data.userHasLiked);
      if (res.data.userHasLiked) {
        setUserHasDisliked(false);
      }
    } catch {
      toast.error("Failed to like video");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!isAuthed || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await dislikeVideo(id);
      setLikesCount(res.data.likesCount);
      setDislikesCount(res.data.dislikesCount);
      setUserHasDisliked(res.data.userHasDisliked);
      if (res.data.userHasDisliked) {
        setUserHasLiked(false);
      }
    } catch {
      toast.error("Failed to dislike video");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async (videoId, text) => {
    try {
      const res = await addComment({ video: videoId, text });
      setComments((prev) => [res.data.comment, ...prev]);
      toast.success("Comment added!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add comment");
    }
  };

  const handleEditComment = async (commentId, text) => {
    try {
      const res = await updateComment(commentId, { text });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data.comment : c))
      );
      toast.success("Comment updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const channelOwnerId = video?.channel?.owner;
  const isOwnChannel = isAuthed && channelOwnerId && user?._id === channelOwnerId;
  const isSubscribed = isAuthed && (user?.subscribedChannels || []).some(
    (c) => (typeof c === "string" ? c : c._id) === video?.channel?._id
  );

  const handleToggleSubscribe = async () => {
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    setSubscribeLoading(true);
    try {
      await toggleSubscribe(video.channel._id);
      await refreshUser();
      toast.success(isSubscribed ? "Unsubscribed!" : "Subscribed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update subscription.");
    } finally {
      setSubscribeLoading(false);
    }
  };

  if (videoLoading) return <div className="vpp-loading">Loading video…</div>;
  if (videoError || !video) return (
    <div className="vpp-error"><p>Video not found or failed to load.</p><Link to="/">← Back to home</Link></div>
  );

  const channelName = video.channel?.channelName || "Unknown Channel";
  const channelId   = video.channel?._id;
  const subs        = video.channel?.subscribers || 0; // ✅ fixed
  const subText     = subs > 0 ? `${formatNumber(subs)} subscribers` : "";

  return (
    <div className="vpp-layout">
      <div className="vpp-main">
        <VideoPlayer src={video.videoUrl} poster={video.thumbnailUrl} />

        <h1 className="vpp-title">{video.title}</h1>

        <div className="vpp-meta">
          <div className="vpp-channel-row">
            <div className="vpp-channel-info">
              <Link to={channelId ? `/channel/${channelId}` : "#"} className="vpp-channel-avatar">
                {channelName[0]?.toUpperCase()}
              </Link>
              <div className="vpp-channel-name-wrap">
                <Link to={channelId ? `/channel/${channelId}` : "#"} className="vpp-channel-name">
                  {channelName}
                </Link>
                {subText && <span className="vpp-subscriber-count">{subText}</span>}
              </div>
            </div>

            {!isOwnChannel && (
              <button
                className={`vpp-subscribe-btn${isSubscribed ? " vpp-subscribe-btn--subscribed" : ""}`}
                onClick={handleToggleSubscribe}
                disabled={subscribeLoading}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            )}
          </div>

          <div className="vpp-actions">
            <div className="like-dislike">
              <button
                className={`ld-btn${userHasLiked ? " ld-btn--active" : ""}`}
                onClick={handleLike}
                disabled={!isAuthed || likeLoading}
                aria-label="Like"
              >
                <ThumbUpIcon filled={userHasLiked} />
                <span>{likesCount > 0 ? likesCount.toLocaleString() : "Like"}</span>
              </button>
              <div className="ld-divider" />
              <button
                className={`ld-btn${userHasDisliked ? " ld-btn--active" : ""}`}
                onClick={handleDislike}
                disabled={!isAuthed || likeLoading}
                aria-label="Dislike"
              >
                <ThumbDownIcon filled={userHasDisliked} />
                {dislikesCount > 0 && <span>{dislikesCount.toLocaleString()}</span>}
              </button>
            </div>

            <button className="vpp-action-btn">
              <ShareIcon />
              <span>Share</span>
            </button>

            <SaveMenu videoId={id} />
          </div>
        </div>

        <div className="vpp-description">
          <p className="vpp-views">
            {formatViews(video.views)} views · {formatDate(video.createdAt)}
          </p>
          {video.description && (
            <>
              <p style={{ marginTop: 8 }} className={descExpanded ? "" : "vpp-description--clamped"}>
                {video.description}
              </p>
              {video.description.length > 200 && (
                <button className="vpp-desc-toggle" onClick={() => setDescExpanded((p) => !p)}>
                  {descExpanded ? "Show less" : "...more"}
                </button>
              )}
            </>
          )}
        </div>

        <CommentSection
          videoId={id}
          comments={comments}
          onAdd={handleAddComment}
          onEdit={handleEditComment}
          onDelete={handleDeleteComment}
        />
      </div>

      <aside className="vpp-sidebar">
        <div className="vpp-chips">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              className={`vpp-chip${activeChip === chip ? " vpp-chip--active" : ""}`}
              onClick={() => setActiveChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="vpp-suggestions">
          {suggestions.map((v) => (
            <Link key={v._id} to={`/video/${v._id}`} className="vpp-suggestion-card">
              <div className="vpp-suggestion-thumb-wrap">
                <img
                  src={v.thumbnailUrl || FALLBACK_THUMB}
                  alt={v.title}
                  className="vpp-suggestion-thumb"
                  loading="lazy"
                  onError={(e) => { e.target.src = FALLBACK_THUMB; }}
                />
                {v.duration && (
                  <span className="vpp-suggestion-duration">{formatDuration(v.duration)}</span>
                )}
              </div>
              <div className="vpp-suggestion-info">
                <p className="vpp-suggestion-title">{v.title}</p>
                <p className="vpp-suggestion-channel">{v.channel?.channelName || "Unknown"}</p>
                <p className="vpp-suggestion-stats">{formatViews(v.views)} · {formatDate(v.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default VideoPlayerPage;