// components/comments/CommentForm.jsx — FE-06
// Works for both "add new" and "edit existing" modes.
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth.js";

function CommentForm({ 
  initialText = "", 
  onSubmit, 
  submitLabel = "Comment", 
  onCancel,
  maxLength = 500 
}) {
  const { isAuthed, user } = useAuth();
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Detect if we're in edit mode (initialText exists)
  useEffect(() => {
    setText(initialText);
    setIsEditMode(initialText.length > 0);
  }, [initialText]);

  const initials = user?.username?.[0]?.toUpperCase() || "U";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      // ✅ Only clear if NOT in edit mode
      if (!isEditMode) {
        setText("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthed) {
    return (
      <div className="comment-form comment-form--guest">
        <p>
          <Link to="/login" className="cf-signin-link">Sign in</Link> to leave a comment.
        </p>
      </div>
    );
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="cf-row">
        <div 
          className="cf-avatar"
          aria-label={`Avatar for ${user?.username || 'User'}`}
        >
          {initials}
        </div>
        <div className="cf-body">
          <textarea
            className="cf-textarea"
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            disabled={submitting}
            maxLength={maxLength}
            aria-label="Comment text"
          />
          <div className="cf-actions">
            {onCancel && (
              <button
                type="button"
                className="cf-btn cf-btn--ghost"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="cf-btn cf-btn--primary"
              disabled={!text.trim() || submitting}
            >
              {submitting ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// PropTypes for better type safety
CommentForm.propTypes = {
  initialText: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  onCancel: PropTypes.func,
  maxLength: PropTypes.number,
};

CommentForm.defaultProps = {
  initialText: "",
  submitLabel: "Comment",
  maxLength: 500,
};

export default CommentForm;