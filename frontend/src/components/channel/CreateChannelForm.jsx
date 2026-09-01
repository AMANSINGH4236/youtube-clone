// components/channel/CreateChannelForm.jsx — FE-07
// "How you'll appear" — matches the rubric screenshot style.
import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function CreateChannelForm({ onSubmit, loading }) {
  const navigate = useNavigate();
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelName.trim()) {
      setError("Channel name is required");
      return;
    }
    setError("");
    await onSubmit({ channelName: channelName.trim(), description });
    // Reset form after successful submit (parent handles navigation)
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="ccf-backdrop">
      <div className="ccf-modal">
        <h2 className="ccf-heading">How you&apos;ll appear</h2>

        {/* Avatar preview */}
        <div className="ccf-avatar-wrap">
          <div 
            className="ccf-avatar"
            aria-label={`Channel avatar preview: ${channelName || '?'}`}
          >
            {channelName ? channelName[0].toUpperCase() : "?"}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="ccf-form">
          <div className="form-group">
            <label htmlFor="channelName">Channel name</label>
            <input
              id="channelName"
              type="text"
              value={channelName}
              onChange={(e) => { 
                setChannelName(e.target.value); 
                if (error) setError(""); 
              }}
              placeholder="Your channel name"
              className={error ? "input-error" : ""}
              maxLength={50}
              aria-describedby={error ? "name-error" : undefined}
            />
            {error && <span id="name-error" className="field-error">{error}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your channel"
              rows={3}
              className="ccf-textarea"
              maxLength={200}
            />
            <span className="ccf-char-count">{description.length}/200</span>
          </div>

          <p className="ccf-notice">
            By creating a channel you agree to our Terms of Service.
            Changes made to your name and profile picture are visible only on this site.
          </p>

          <div className="ccf-footer">
            <button
              type="button"
              className="ccf-cancel-btn"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="auth-btn" 
              disabled={loading}
              aria-disabled={loading}
            >
              {loading ? "Creating…" : "Create channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// PropTypes for better type safety
CreateChannelForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

CreateChannelForm.defaultProps = {
  loading: false,
};

export default CreateChannelForm;