// components/video/SaveMenu.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getVideoSaveStatus,
  toggleWatchLater,
  toggleDownload,
} from "../../services/userService.js";
import {
  getMyPlaylists,
  createPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../../services/playlistService.js";
import toast from "react-hot-toast";

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" height="16" width="16" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

function SaveMenu({ videoId }) {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const wrapRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [status, setStatus] = useState({
    inWatchLater: false,
    inDownloads: false,
    playlistIds: [],
  });
  const [playlists, setPlaylists] = useState([]);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const [statusRes, playlistsRes] = await Promise.all([
        getVideoSaveStatus(videoId),
        getMyPlaylists(),
      ]);
      setStatus(statusRes.data);
      setPlaylists(playlistsRes.data);
    } catch {
      // silent
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleTriggerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      navigate("/login");
      return;
    }
    const next = !open;
    setOpen(next);
    setCreating(false);
    setBusy(false); // reset busy on open
    if (next) loadStatus();
  };

  const stopBubble = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // --- toggles ---
  const handleToggleWatchLater = async () => {
    setBusy(true);
    try {
      const res = await toggleWatchLater(videoId);
      setStatus((s) => ({ ...s, inWatchLater: res.data.saved }));
      toast.success(res.data.saved ? "Added to Watch later" : "Removed from Watch later");
    } catch {
      toast.error("Failed to update Watch later");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleDownload = async () => {
    setBusy(true);
    try {
      const res = await toggleDownload(videoId);
      setStatus((s) => ({ ...s, inDownloads: res.data.downloaded }));
      toast.success(res.data.downloaded ? "Downloaded" : "Removed from downloads");
    } catch {
      toast.error("Failed to update downloads");
    } finally {
      setBusy(false);
    }
  };

  const handleTogglePlaylist = async (playlistId, alreadyIn) => {
    setBusy(true);
    try {
      if (alreadyIn) {
        await removeVideoFromPlaylist(playlistId, videoId);
        setStatus((s) => ({
          ...s,
          playlistIds: s.playlistIds.filter((id) => id !== playlistId),
        }));
        toast.success("Removed from playlist");
      } else {
        await addVideoToPlaylist(playlistId, videoId);
        setStatus((s) => ({
          ...s,
          playlistIds: [...s.playlistIds, playlistId],
        }));
        toast.success("Added to playlist");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update playlist");
    } finally {
      setBusy(false);
    }
  };

  // --- CREATE PLAYLIST (now uses onClick) ---
  const handleCreatePlaylist = async () => {
    console.log("🔥 Create playlist button clicked!"); // 👈 DEBUG
    const name = newName.trim();
    if (!name) {
      toast.error("Please enter a playlist name");
      return;
    }

    setBusy(true);
    try {
      const res = await createPlaylist(name);
      console.log("✅ Create playlist response:", res.data);

      // Handle both response formats
      const playlist = res.data.playlist || res.data;
      if (!playlist._id) {
        throw new Error("Invalid response: no playlist ID");
      }

      await addVideoToPlaylist(playlist._id, videoId);

      setPlaylists((prev) => [playlist, ...prev]);
      setStatus((s) => ({
        ...s,
        playlistIds: [...s.playlistIds, playlist._id],
      }));
      setNewName("");
      setCreating(false);
      toast.success(`Playlist "${name}" created and video added!`);
    } catch (err) {
      console.error("❌ Create playlist error:", err);
      toast.error(err.response?.data?.message || "Failed to create playlist.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`save-menu${open ? " save-menu--open" : ""}`} ref={wrapRef}>
      <button
        className="save-menu__trigger"
        onClick={handleTriggerClick}
        aria-label="Save options"
      >
        <MoreIcon />
      </button>

      {open && (
        <div className="save-menu__panel" onClick={stopBubble}>
          {loadingStatus ? (
            <p className="save-menu__loading">Loading…</p>
          ) : (
            <>
              <label className="save-menu__row">
                <input
                  type="checkbox"
                  checked={status.inWatchLater}
                  disabled={busy}
                  onChange={handleToggleWatchLater}
                />
                Watch later
              </label>
              <label className="save-menu__row">
                <input
                  type="checkbox"
                  checked={status.inDownloads}
                  disabled={busy}
                  onChange={handleToggleDownload}
                />
                Download
              </label>

              {playlists.length > 0 && (
                <>
                  <div className="save-menu__divider" />
                  <div className="save-menu__playlists">
                    {playlists.map((p) => (
                      <label key={p._id} className="save-menu__row">
                        <input
                          type="checkbox"
                          checked={status.playlistIds.includes(p._id)}
                          disabled={busy}
                          onChange={() =>
                            handleTogglePlaylist(
                              p._id,
                              status.playlistIds.includes(p._id)
                            )
                          }
                        />
                        <span className="save-menu__row-label">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <div className="save-menu__divider" />

              {creating ? (
                <div className="save-menu__new-form">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Playlist name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    maxLength={60}
                  />
                  <button
                    type="button" // 👈 Not "submit"
                    disabled={busy || !newName.trim()}
                    onClick={handleCreatePlaylist} // 👈 Direct click
                  >
                    {busy ? "Creating…" : "Create"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="save-menu__new-btn"
                  onClick={() => setCreating(true)}
                >
                  + New playlist
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

SaveMenu.propTypes = {
  videoId: PropTypes.string.isRequired,
};

export default SaveMenu;