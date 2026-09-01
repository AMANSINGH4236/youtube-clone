// components/video/VideoCard.jsx — pixel-perfect YT dark card
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { formatViews, formatDate } from "../../utils/formatViews.js";
import SaveMenu from "./SaveMenu.jsx";

const FALLBACK_THUMB = "https://placehold.co/320x180/272727/aaaaaa?text=No+Thumbnail";

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function VideoCard({ video }) {
  const { _id, title, thumbnailUrl, channel, views, createdAt, duration } = video;
  const channelName   = channel?.channelName || "Unknown Channel";
  const channelAvatar = channel?.avatar;
  const avatarInitial = channelName[0]?.toUpperCase() || "C";
  const channelId     = channel?._id;
  const durationStr   = formatDuration(duration);

  return (
    <div className="video-card">
      {/* Thumbnail */}
      <Link to={`/video/${_id}`} className="video-card__thumb-wrap" tabIndex={-1}>
        <img
          className="video-card__thumb"
          src={thumbnailUrl || FALLBACK_THUMB}
          alt={title}
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_THUMB; }}
        />
        {durationStr && (
          <span className="video-card__duration">{durationStr}</span>
        )}
        <SaveMenu videoId={_id} />
      </Link>

      {/* Info row */}
      <div className="video-card__info">
        {/* Channel avatar */}
        <Link to={channelId ? `/channel/${channelId}` : "#"} className="video-card__avatar">
          {channelAvatar
            ? <img src={channelAvatar} alt={channelName} />
            : <span>{avatarInitial}</span>
          }
        </Link>

        <div className="video-card__meta">
          <Link to={`/video/${_id}`} className="video-card__title-link">
            <p className="video-card__title">{title}</p>
          </Link>
          <Link to={channelId ? `/channel/${channelId}` : "#"} className="video-card__channel">
            {channelName}
          </Link>
          <p className="video-card__stats">
            {formatViews(views)} · {formatDate(createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

// PropTypes for better type safety
VideoCard.propTypes = {
  video: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string,
    channel: PropTypes.shape({
      _id: PropTypes.string,
      channelName: PropTypes.string,
      avatar: PropTypes.string,
    }),
    views: PropTypes.number,
    createdAt: PropTypes.string,
    duration: PropTypes.number,
  }).isRequired,
};

VideoCard.defaultProps = {
  video: {
    thumbnailUrl: FALLBACK_THUMB,
    views: 0,
    duration: null,
  },
};

export default VideoCard;