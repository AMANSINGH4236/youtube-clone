// client/src/pages/PlaylistDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import VideoCard from "../components/video/VideoCard.jsx";
import {
  getPlaylistById,
  renamePlaylist,
  deletePlaylist,
  removeVideoFromPlaylist,
} from "../services/playlistService.js";
import toast from "react-hot-toast";

function PlaylistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getPlaylistById(id)
      .then((res) => {
        if (cancelled) return;
        // ✅ FIX: Backend returns playlist directly
        setPlaylist(res.data);
        setNameInput(res.data.name);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Playlist not found.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const handleRename = async (e) => {
    if (e) e.preventDefault();
    const name = nameInput.trim();
    if (!name || name === playlist.name) {
      setRenaming(false);
      return;
    }
    try {
      const res = await renamePlaylist(id, name);
      // ✅ FIX: Backend returns playlist directly
      setPlaylist(res.data);
      toast.success("Playlist renamed!");
      setRenaming(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to rename playlist.");
      setRenaming(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm(`Delete "${playlist.name}"? This cannot be undone.`)) return;
    try {
      await deletePlaylist(id);
      toast.success(`"${playlist.name}" deleted`);
      navigate("/playlists", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete playlist.");
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await removeVideoFromPlaylist(id, videoId);
      setPlaylist((prev) => ({
        ...prev,
        videos: prev.videos.filter((v) => v._id !== videoId),
      }));
      toast.success("Video removed from playlist");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove video.");
    }
  };

  if (loading) {
    return <div className="library-page__loading">Loading playlist…</div>;
  }

  if (error || !playlist) {
    return (
      <div className="library-page">
        <div className="video-grid__empty">
          <p>{error || "Playlist not found."}</p>
          <Link to="/playlists">← Back to playlists</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-page__header playlist-detail__header">
        {renaming ? (
          <form onSubmit={handleRename} className="playlist-detail__rename-form">
            <input
              autoFocus
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={60}
              onBlur={handleRename}
            />
          </form>
        ) : (
          <h1 onClick={() => setRenaming(true)} title="Click to rename">
            {playlist.name}
          </h1>
        )}
        <div className="playlist-detail__actions">
          <span className="playlist-detail__count">
            {playlist.videos.length} video{playlist.videos.length !== 1 ? "s" : ""}
          </span>
          <button className="library-page__action-btn" onClick={handleDeletePlaylist}>
            Delete playlist
          </button>
        </div>
      </div>

      {playlist.videos.length === 0 ? (
        <div className="video-grid__empty">
          <p className="video-grid__empty-title">No videos in this playlist</p>
          <p>Use the save button on any video to add it here.</p>
        </div>
      ) : (
        <div className="video-grid">
          {playlist.videos.map((v) => (
            <div key={v._id} className="playlist-detail__item">
              <VideoCard video={v} />
              <button
                className="playlist-detail__remove"
                onClick={() => handleRemoveVideo(v._id)}
              >
                Remove from this playlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaylistDetailPage;