// components/video/VideoPlayer.jsx — FE-06
import { useState } from "react";
import PropTypes from "prop-types";

function VideoPlayer({ src, poster, autoPlay = false }) {
  const [errored, setErrored] = useState(false);

  const handleRetry = () => {
    setErrored(false);
  };

  if (!src) {
    return (
      <div className="vp-no-src">
        <p>No video URL available.</p>
      </div>
    );
  }

  if (errored) {
    return (
      <div className="vp-error-container">
        {poster && (
          <img
            src={poster}
            alt="Video thumbnail"
            className="vp-error-thumb"
          />
        )}
        <div className="vp-error-overlay">
          <span className="vp-error-icon">⚠️</span>
          <p className="vp-error-text">Video could not be loaded.</p>
          <button className="vp-retry-btn" onClick={handleRetry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vp-wrapper">
      <video
        className="vp-video"
        src={src}
        poster={poster || undefined}
        controls
        controlsList="nodownload"
        playsInline
        autoPlay={autoPlay}
        onError={() => setErrored(true)}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

// PropTypes for better type safety
VideoPlayer.propTypes = {
  src: PropTypes.string,
  poster: PropTypes.string,
  autoPlay: PropTypes.bool,
};

VideoPlayer.defaultProps = {
  src: null,
  poster: null,
  autoPlay: false,
};

export default VideoPlayer;