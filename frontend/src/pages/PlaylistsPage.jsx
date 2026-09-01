// client/src/pages/PlaylistsPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyPlaylists,
  createPlaylist,
  deletePlaylist,
} from "../services/playlistService.js";
import toast from "react-hot-toast";

const PlaylistPlusIcon = () => (
  <svg viewBox="0 0 24 24" height="28" width="28" fill="currentColor">
    <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z" />
  </svg>
);
const PlaylistIcon = () => (
  <svg viewBox="0 0 24 24" height="28" width="28" fill="currentColor">
    <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm-12 8h8v-2H2v2zm18-6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V10h3V8h-5z" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" height="18" width="18" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

function PlaylistsPage() {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyPlaylists()
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly
          setPlaylists(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load playlists");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setCreating(true);
    try {
      const res = await createPlaylist(name);
      // ✅ FIX: Backend returns playlist directly
      toast.success("Playlist created!");
      navigate(`/playlists/${res.data.playlist._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create playlist.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
      toast.success(`"${name}" deleted`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete playlist.");
    }
  };

  if (loading) {
    return <div className="library-page__loading">Loading playlists…</div>;
  }

  return (
    <div className="library-page">
      <div className="library-page__header">
        <h1>Playlists</h1>
      </div>

      {error ? (
        <div className="video-grid__empty">
          <p>⚠️ {error}</p>
        </div>
      ) : (
        <div className="playlist-grid">
          <form className="playlist-card playlist-card--new" onSubmit={handleCreate}>
            <div className="playlist-card__thumb playlist-card__thumb--new">
              <PlaylistPlusIcon />
            </div>
            <input
              type="text"
              placeholder="New playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={60}
            />
            <button type="submit" disabled={creating || !newName.trim()}>
              {creating ? "Creating…" : "Create"}
            </button>
          </form>

          {playlists.map((p) => (
            <Link key={p._id} to={`/playlists/${p._id}`} className="playlist-card">
              <div className="playlist-card__thumb">
                <PlaylistIcon />
                <span className="playlist-card__count">
                  {p.videos.length} video{p.videos.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="playlist-card__meta">
                <p className="playlist-card__name">{p.name}</p>
                <p className="playlist-card__sub">Private playlist</p>
              </div>
              <button
                className="playlist-card__delete"
                onClick={(e) => handleDelete(p._id, p.name, e)}
                aria-label={`Delete ${p.name}`}
              >
                <TrashIcon />
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistsPage;