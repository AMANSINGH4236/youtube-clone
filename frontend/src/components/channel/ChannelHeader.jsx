


function ChannelHeader({ channel, isOwner, isSubscribed, subscribeLoading, onToggleSubscribe }) {
  const {
    channelName = "Channel",
    handle,
    description,
    avatar,
    banner,
    subscribers = 0,        // ✅ FIX: subscribers is a number, not an array
    videos = [],
  } = channel;

  const avatarInitial = channelName[0]?.toUpperCase() || "C";
  const subCount = subscribers || 0;                   // ✅ FIX: use directly
  const videoCount = Array.isArray(videos) ? videos.length : 0;

  // Format subscriber count (e.g., 1.2M, 4.5K, 123)
  const formatSubs = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <div className="ch-page-header">
      {/* Banner — edge-to-edge */}
      <div
        className={`ch-banner${banner ? "" : " ch-banner--default"}`}
        style={banner ? { backgroundImage: `url(${banner})` } : {}}
      />

      {/* Channel info row */}
      <div className="ch-info">
        <div className="ch-avatar">
          {avatar
            ? <img src={avatar} alt={channelName} />        // ✅ Added alt
            : avatarInitial
          }
        </div>

        <div className="ch-text">
          <h1 className="ch-name">{channelName}</h1>
          {handle && <p className="ch-handle">@{handle.replace(/^@/, "")}</p>}
          <p className="ch-sub-count">
            {formatSubs(subCount)} subscribers · {videoCount} video{videoCount !== 1 ? "s" : ""}
          </p>
          {description && <p className="ch-desc">{description}</p>}
        </div>

        {/* Owners manage their own channel elsewhere — subscribing to
            yourself isn't a real thing, so the button just doesn't exist. */}
        {!isOwner && (
          <button
            className={`ch-subscribe-btn${isSubscribed ? " ch-subscribe-btn--subscribed" : ""}`}
            onClick={onToggleSubscribe}
            disabled={subscribeLoading}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        )}
      </div>
    </div>
  );
}

export default ChannelHeader;