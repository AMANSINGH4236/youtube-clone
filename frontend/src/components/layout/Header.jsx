// components/layout/Header.jsx — pixel-perfect YT dark header
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth.js";

function Header({ onToggleSidebar, onSearch }) {
  const { isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchVal.trim());
  };

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const initials = user?.username?.[0]?.toUpperCase() || "U";
  const handle = user?.username ? `@${user.username}` : "";

  return (
    <header className="yt-header">
      {/* Left — hamburger + logo */}
      <div className="yt-header__left">
        <button className="yt-header__hamburger" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <span /><span /><span />
        </button>
        <Link to="/" className="yt-header__logo">
          <svg height="20" viewBox="0 0 30 20" focusable="false">
            <g>
              <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
              <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
            </g>
          </svg>
          <span className="yt-header__logo-text">YouTube</span>
        </Link>
      </div>

      {/* Center — search */}
      <form className="yt-header__search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search"
          value={searchVal}
          onChange={handleSearchChange}
          aria-label="Search videos"
        />
        <button type="submit" aria-label="Search" className="yt-header__search-btn">
          <svg viewBox="0 0 24 24" height="20" fill="currentColor">
            <path d="M20.87 20.17l-5.59-5.59C16.35 13.35 17 11.75 17 10c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.75 0 3.35-.65 4.58-1.71l5.59 5.59.7-.71zM10 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
          </svg>
        </button>
        <button type="button" className="yt-header__mic" aria-label="Search by voice">
          <svg viewBox="0 0 24 24" height="20" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
      </form>

      {/* Right */}
      <div className="yt-header__right">
        {isAuthed ? (
          <>
            {/* Create button */}
            <Link to="/upload" className="yt-header__create">
              <svg viewBox="0 0 24 24" height="18" fill="currentColor">
                <path d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 14H3V8h14v12zm4-16v18h-2V4H5V2h16c1.1 0 2 .9 2 2z"/>
              </svg>
              <span>Create</span>
            </Link>

            {/* Notifications */}
            <button className="yt-header__icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" height="22" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
              <span className="yt-header__notif-badge">9+</span>
            </button>

            {/* Avatar + dropdown */}
            <div className="yt-header__user" ref={dropdownRef}>
              <button
                className="yt-header__avatar-btn"
                onClick={() => setMenuOpen((p) => !p)}
                aria-label="User menu"
              >
                <span className="yt-header__avatar">{initials}</span>
              </button>

              {menuOpen && (
                <div className="yt-header__dropdown">
                  {/* User info */}
                  <div className="yt-header__dropdown-profile">
                    <span className="yt-header__dropdown-avatar">{initials}</span>
                    <div>
                      <div className="yt-header__dropdown-name">{user.username}</div>
                      <div className="yt-header__dropdown-handle">{handle}</div>
                      <Link to={`/channel/${user.channels?.[0] || "new"}`} className="yt-header__dropdown-channel" onClick={() => setMenuOpen(false)}>
                        View your channel
                      </Link>
                    </div>
                  </div>

                  <div className="yt-header__dropdown-divider" />

                  {/* Section 1 */}
                  <button className="yt-header__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                    Google Account
                  </button>
                  <button className="yt-header__dropdown-item yt-header__dropdown-item--arrow" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/></svg>
                    Switch account
                    <svg className="yt-dropdown-arrow" viewBox="0 0 24 24" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                  <button className="yt-header__dropdown-item" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
                    Sign out
                  </button>

                  <div className="yt-header__dropdown-divider" />

                  {/* Section 2 */}
                  <button className="yt-header__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                    YouTube Studio
                  </button>
                  <button className="yt-header__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>
                    Purchases and memberships
                  </button>

                  <div className="yt-header__dropdown-divider" />

                  {/* Section 3 */}
                  <button className="yt-header__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4c1.4 0 2.8 1.12 2.8 2.5S13.4 10 12 10s-2.8-1.12-2.8-2.5S10.6 5 12 5zm4 11c0 1.5-1.79 2.79-4 2.79s-4-1.29-4-2.79v-.5c0-1.5 1.79-2.5 4-2.5s4 1 4 2.5v.5z"/></svg>
                    Your data in YouTube
                  </button>
                  <button className="yt-header__dropdown-item yt-header__dropdown-item--arrow" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zm-2 5.79V18h-3.52L12 20.48 9.52 18H6v-3.52L3.52 12 6 9.52V6h3.52L12 3.52 14.48 6H18v3.52L20.48 12 18 14.48zM12 6.5c-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5 5.5-2.46 5.5-5.5S15.04 6.5 12 6.5zM13 16h-2v-4H9l3-3 3 3h-2v4z"/></svg>
                    Appearance: Device theme
                    <svg className="yt-dropdown-arrow" viewBox="0 0 24 24" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                  <button className="yt-header__dropdown-item yt-header__dropdown-item--arrow" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>
                    Display language: English
                    <svg className="yt-dropdown-arrow" viewBox="0 0 24 24" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                  <button className="yt-header__dropdown-item yt-header__dropdown-item--arrow" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zM5 13.5H3.06C3.28 8.77 7.1 5 11.84 5.04L11 6.5 13 7l-2.5 4.5L9 11l-1.16 2H11l.5 3.5L8.5 18 5 13.5zm13.94 0L15.5 18 12.5 17l.5-3.5H16l-1.16-2-1.5.5-2.5-4.5 2-1-1-1.48C17.14 5.08 20.79 8.92 18.94 13.5z"/></svg>
                    Restricted Mode: Off
                    <svg className="yt-dropdown-arrow" viewBox="0 0 24 24" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                  <button className="yt-header__dropdown-item yt-header__dropdown-item--arrow" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    Location: India
                    <svg className="yt-dropdown-arrow" viewBox="0 0 24 24" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                  </button>
                  <button className="yt-header__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v6h-2v-6zM7 8h2v2H7V8zm0 3h2v6H7v-6zm10 6h-2v-6h2v6zm0-7h-2V8h2v2z"/></svg>
                    Keyboard shortcuts
                  </button>

                  <div className="yt-header__dropdown-divider" />

                  {/* Section 4 */}
                  <button className="yt-header__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>
                    Settings
                  </button>
                  <button className="yt-header__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                    Help
                  </button>
                  <button className="yt-header__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" height="20" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    Send feedback
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="yt-header__signin">
            <svg viewBox="0 0 24 24" height="16" fill="#1a73e8">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            <span>Sign in</span>
          </Link>
        )}
      </div>
  
    </header>
  );
}

Header.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
};

Header.defaultProps = {
  onSearch: undefined,
};

export default Header;