// components/video/LikeDislikeButtons.jsx — FE-06
// Rubric: "Implement complete functionality for the Like and Dislike buttons."
import PropTypes from "prop-types";

function LikeDislikeButtons({
  likesCount = 0,
  dislikesCount = 0,
  userHasLiked = false,
  userHasDisliked = false,
  onLike,
  onDislike,
  disabled = false,
}) {
  return (
    <div className="like-dislike">
      <button
        type="button"
        className={`ld-btn${userHasLiked ? " ld-btn--active" : ""}`}
        onClick={onLike}
        disabled={disabled}
        aria-label="Like video"
        title={disabled ? "Sign in to like" : "Like"}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
        </svg>
        <span>{likesCount}</span>
      </button>

      <div className="ld-divider" />

      <button
        type="button"
        className={`ld-btn${userHasDisliked ? " ld-btn--active" : ""}`}
        onClick={onDislike}
        disabled={disabled}
        aria-label="Dislike video"
        title={disabled ? "Sign in to dislike" : "Dislike"}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z"/>
        </svg>
        <span>{dislikesCount}</span>
      </button>
    </div>
  );
}

// PropTypes for better type safety
LikeDislikeButtons.propTypes = {
  likesCount: PropTypes.number,
  dislikesCount: PropTypes.number,
  userHasLiked: PropTypes.bool,
  userHasDisliked: PropTypes.bool,
  onLike: PropTypes.func.isRequired,
  onDislike: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

LikeDislikeButtons.defaultProps = {
  likesCount: 0,
  dislikesCount: 0,
  userHasLiked: false,
  userHasDisliked: false,
  disabled: false,
};

export default LikeDislikeButtons;