
// Shows channel videos; if owner, shows Edit/Delete buttons per video.
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { formatViews, formatDate } from "../../utils/formatViews.js";

const FALLBACK = "https://placehold.co/320x180/1a1a1a/ffffff?text=No+Thumbnail";

function ChannelVideoList({ videos = [], isOwner, onDelete }) {
  if (videos.length === 0) {
    return (
      <div className="cvl-empty">
        <p>No videos yet.{isOwner ? " Upload your first video!" : ""}</p>
        {isOwner && (
          <Link to="/upload" className="cvl-upload-btn">
            + Upload Video
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="cvl">
      {isOwner && (
        <div className="cvl-owner-bar">
          <Link to="/upload" className="cvl-upload-btn">+ Upload Video</Link>
        </div>
      )}

      <div className="cvl-grid">
        {videos.map((video) => (
          <div key={video._id} className="cvl-card">
            <Link to={`/video/${video._id}`} className="cvl-thumb-link">
              <div className="cvl-thumb-wrap">
                <img
                  src={video.thumbnailUrl || FALLBACK}
                  alt={video.title}
                  className="cvl-thumb"
                  onError={(e) => { e.target.src = FALLBACK; }}
                  loading="lazy"
                />
              </div>
            </Link>

            <div className="cvl-info">
              <Link to={`/video/${video._id}`} className="cvl-title">
                {video.title}
              </Link>
              <p className="cvl-meta">
                {formatViews(video.views)} · {formatDate(video.createdAt)}
              </p>

              {isOwner && (
                <div className="cvl-actions">
                  <Link
                    to={`/upload/${video._id}`}
                    className="cvl-action-btn"
                  >
                    Edit
                  </Link>
                  <button
                    className="cvl-action-btn cvl-action-btn--delete"
                    onClick={() => onDelete(video._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Optional: PropTypes for better type safety
ChannelVideoList.propTypes = {
  videos: PropTypes.array,
  isOwner: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
};

ChannelVideoList.defaultProps = {
  videos: [],
  isOwner: false,
};

export default ChannelVideoList;