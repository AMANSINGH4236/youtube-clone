// components/layout/Sidebar.jsx — pixel-perfect YT dark sidebar
// Mini icon-rail (72px) on desktop; full 240px drawer on mobile/when open
import { NavLink, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth.js";

/* ─── Icons ─────────────────────────────────────────────────── */
// ... (all your icons remain exactly as you have them)
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const ShortsIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M17.77 10.32l-1.2-.5L18 9.06c1.84-.96 2.53-3.23 1.56-5.06s-3.24-2.53-5.07-1.56L6 6.94c-1.29.68-2.07 2.04-2 3.49.07 1.42.93 2.67 2.22 3.25l1.2.5L6 14.93c-1.84.97-2.53 3.23-1.56 5.07.97 1.83 3.23 2.53 5.07 1.56l8.49-4.5c1.29-.68 2.07-2.03 2-3.48-.07-1.42-.94-2.68-2.23-3.26zM10 14.65v-5.3L15 12l-5 2.65z"/>
  </svg>
);

const SubsIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M10 18v-6l5 3-5 3zm7-15H7v1h10V3zm3 3H4v1h16V6zm2 3H2v12h20V9zm-2 10H4v-8h16v8z"/>
  </svg>
);

const YouIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8z"/>
  </svg>
);

const PlaylistIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M3 5h2V3c-1.1 0-2 .9-2 2zm0 8h2v-2H3v2zm4 8h2v-2H7v2zM3 9h2V7H3v2zm10-6h-2v2h2V3zm6 0v2h2c0-1.1-.9-2-2-2zM5 21v-2H3c0 1.1.9 2 2 2zm-2-4h2v-2H3v2zM9 3H7v2h2V3zm2 18h2v-2h-2v2zm8-8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2zm0-12h2V7h-2v2zm0 8h2v-2h-2v2zm-4 4h2v-2h-2v2zm0-16h2V3h-2v2zM7 17h10V7H7v10zm2-8h6v6H9V9z"/>
  </svg>
);

const WatchLaterIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
);

const LikedIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M21 7h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 0S7.08 6.85 7 7H2v13h17c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73V9c0-1.1-.9-2-2-2zM7 18H4V9h3v9zm14-7l-3 7H9V8.07l6.97-6.55-.95 4.48H21v5z"/>
  </svg>
);

const YourVideosIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
  </svg>
);

const DownloadsIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

const ShoppingIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM9 18H7v-7h2v7zm4 0h-2v-7h2v7zm4 0h-2v-7h2v7z"/>
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
  </svg>
);

const MoviesIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" height="18" width="18" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
);

const ReportIcon = () => (
  <svg viewBox="0 0 24 24" height="22" width="22" fill="currentColor">
    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/>
  </svg>
);

const SignInIcon = () => (
  <svg viewBox="0 0 24 24" height="18" width="18" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

/* ─── Reusable nav item wrapper ─────────────────────────────── */
function SidebarNavItem({ to, icon, miniLabel, fullLabel, end = false, onClick }) {
  const cls = ({ isActive }) =>
    `yt-sidebar__item${isActive ? " yt-sidebar__item--active" : ""}`;

  if (to) {
    return (
      <NavLink to={to} className={cls} end={end} onClick={onClick}>
        {icon}
        <span className="yt-sidebar__item-mini-label">{miniLabel}</span>
        <span className="yt-sidebar__item-label">{fullLabel}</span>
      </NavLink>
    );
  }
  return (
    <div className="yt-sidebar__item" onClick={onClick}>
      {icon}
      <span className="yt-sidebar__item-mini-label">{miniLabel}</span>
      <span className="yt-sidebar__item-label">{fullLabel}</span>
    </div>
  );
}

SidebarNavItem.propTypes = {
  to: PropTypes.string,
  icon: PropTypes.node.isRequired,
  miniLabel: PropTypes.string.isRequired,
  fullLabel: PropTypes.string.isRequired,
  end: PropTypes.bool,
  onClick: PropTypes.func,
};

function Sidebar({ isOpen, onClose }) {
  const { isAuthed, user } = useAuth();
  const subscribedChannels = user?.subscribedChannels || [];
  const closeOnNavigate = isOpen ? onClose : undefined;

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          role="button"
          aria-label="Close sidebar"
          tabIndex={-1}
        />
      )}

      <aside className={`yt-sidebar${isOpen ? " yt-sidebar--open" : ""}`}>
        <div className="yt-sidebar__scroll">

          {/* ── Top nav ── */}
          <SidebarNavItem to="/"       icon={<HomeIcon />}   miniLabel="Home"   fullLabel="Home"   end onClick={closeOnNavigate} />
          <SidebarNavItem to="/shorts" icon={<ShortsIcon />} miniLabel="Shorts" fullLabel="Shorts"     onClick={closeOnNavigate} />
          {isAuthed && (
            <SidebarNavItem to="/subscriptions" icon={<SubsIcon />} miniLabel="Subscriptions" fullLabel="Subscriptions" onClick={closeOnNavigate} />
          )}

          {/* ── Divider + You section ── */}
          <div className="yt-sidebar__divider" />

          <div className="yt-sidebar__section-header">
            <span>You</span>
            <ChevronRight />
          </div>

          {isAuthed ? (
            <>
              <SidebarNavItem to="/channel/me" icon={<YouIcon />}       miniLabel="You"         fullLabel="Your channel"  onClick={closeOnNavigate} />
              <SidebarNavItem to="/history"    icon={<HistoryIcon />}   miniLabel="History"     fullLabel="History"       onClick={closeOnNavigate} />
              <SidebarNavItem to="/playlists"  icon={<PlaylistIcon />}  miniLabel="Playlists"   fullLabel="Playlists"     onClick={closeOnNavigate} />
              <SidebarNavItem to="/watch-later"icon={<WatchLaterIcon />}miniLabel="Watch later" fullLabel="Watch later"   onClick={closeOnNavigate} />
              <SidebarNavItem to="/liked"      icon={<LikedIcon />}     miniLabel="Liked"       fullLabel="Liked videos"  onClick={closeOnNavigate} />
              <SidebarNavItem to="/your-videos"icon={<YourVideosIcon />}miniLabel="Your videos" fullLabel="Your videos"   onClick={closeOnNavigate} />
              <SidebarNavItem to="/downloads"  icon={<DownloadsIcon />} miniLabel="Downloads"   fullLabel="Downloads"     onClick={closeOnNavigate} />
            </>
          ) : (
            <div className="yt-sidebar__signin-card">
              <p>Sign in to like videos, comment, and subscribe.</p>
              <Link to="/login" className="yt-sidebar__signin-btn" onClick={closeOnNavigate}>
                <SignInIcon />
                <span>Sign in</span>
              </Link>
            </div>
          )}

          {/* ── Subscriptions shelf ── */}
          {isAuthed && subscribedChannels.length > 0 && (
            <>
              <div className="yt-sidebar__divider" />
              <div className="yt-sidebar__section-header">
                <span>Subscriptions</span>
              </div>

              {subscribedChannels.map((ch) => (
                <Link
                  key={ch._id}
                  to={`/channel/${ch._id}`}
                  className="yt-sidebar__item yt-sidebar__item--channel"
                  onClick={closeOnNavigate}
                >
                  <div className="yt-sidebar__ch-avatar">
                    {ch.avatar
                      ? <img src={ch.avatar} alt={ch.channelName} />
                      : (ch.channelName?.[0]?.toUpperCase() || "C")}
                  </div>
                  <span className="yt-sidebar__item-mini-label" style={{ display: "none" }}></span>
                  <span className="yt-sidebar__item-label yt-sidebar__ch-name">{ch.channelName}</span>
                </Link>
              ))}
            </>
          )}

          {/* ── Explore ── */}
          <div className="yt-sidebar__divider" />
          <div className="yt-sidebar__section-header"><span>Explore</span></div>

          <SidebarNavItem icon={<ShoppingIcon />} miniLabel="Shopping" fullLabel="Shopping" />
          <SidebarNavItem icon={<MusicIcon />}    miniLabel="Music"    fullLabel="Music"    />
          <SidebarNavItem icon={<MoviesIcon />}   miniLabel="Movies"   fullLabel="Movies"   />

          {/* ── More from YouTube ── */}
          <div className="yt-sidebar__divider" />
          <div className="yt-sidebar__section-header"><span>More from YouTube</span></div>

          <div className="yt-sidebar__item">
            <span className="yt-sidebar__yt-icon">
              <svg viewBox="0 0 90 20" height="14" width="32">
                <g>
                  <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
                  <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
                </g>
              </svg>
            </span>
            <span className="yt-sidebar__item-mini-label" style={{ display: "none" }}></span>
            <span className="yt-sidebar__item-label">YouTube Premium</span>
          </div>

          <div className="yt-sidebar__item">
            <ReportIcon />
            <span className="yt-sidebar__item-mini-label">Report</span>
            <span className="yt-sidebar__item-label">Report history</span>
          </div>

          {/* ── Footer ── */}
          <div className="yt-sidebar__divider" />

          <div className="yt-sidebar__footer">
            <p>About Press Copyright Contact us Creators</p>
            <p>Advertise Developers</p>
            <br />
            <p>Terms Privacy Policy &amp; Safety</p>
            <p>How YouTube works</p>
            <p>Test new features</p>
            <br />
            <p>© 2025 Google LLC</p>
          </div>

        </div>
      </aside>
    </>
  );
}

// PropTypes for better type safety
Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Sidebar;