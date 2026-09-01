// components/comments/CommentItem.jsx — FE-06
import { useState } from "react";
import PropTypes from "prop-types";
import CommentForm from "./CommentForm.jsx";
import { formatDate } from "../../utils/formatViews.js";

function CommentItem({ comment, isOwner, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = comment.user?.username?.[0]?.toUpperCase() || "U";

  const handleEditSubmit = async (text) => {
    try {
      await onEdit(comment._id, text);
      setEditing(false); // ✅ Only close on success
    } catch (error) {
      // Error is handled by the parent (toast)
      // Keep editing mode open so user can retry
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this comment?")) return;
    setDeleting(true);
    try {
      await onDelete(comment._id);
      // Parent will remove the comment from the list
    } catch (error) {
      // Error is handled by the parent (toast)
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="comment-item">
      <div 
        className="ci-avatar"
        aria-label={`Avatar for ${comment.user?.username || 'User'}`}
      >
        {initials}
      </div>
      <div className="ci-body">
        <div className="ci-meta">
          <span className="ci-username">@{comment.user?.username || "user"}</span>
          <span className="ci-date">{formatDate(comment.createdAt)}</span>
        </div>

        {editing ? (
          <CommentForm
            initialText={comment.text}
            onSubmit={handleEditSubmit}
            submitLabel="Save"
            onCancel={() => setEditing(false)}
          />
        ) : (
          <p className="ci-text">{comment.text}</p>
        )}

        {isOwner && !editing && (
          <div className="ci-actions">
            <button
              className="ci-action-btn"
              onClick={() => setEditing(true)}
              aria-label="Edit comment"
            >
              Edit
            </button>
            <button
              className="ci-action-btn ci-action-btn--delete"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Delete comment"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// PropTypes for better type safety
CommentItem.propTypes = {
  comment: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    user: PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string,
      avatar: PropTypes.string,
    }),
  }).isRequired,
  isOwner: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

CommentItem.defaultProps = {
  comment: {
    user: { username: "Unknown" },
  },
};

export default CommentItem;