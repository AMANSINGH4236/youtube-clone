// client/src/pages/UploadVideoPage.jsx — FE-08
// Protected route. Create mode (/upload) or Edit mode (/upload/:id).
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  createVideo,
  updateVideo,
  getVideoById,
} from "../services/videoService.js";
import { CATEGORIES } from "../constants/categories.js";
import toast from "react-hot-toast";

const EMPTY = {
  title: "",
  description: "",
  thumbnailUrl: "",
  videoUrl: "",
  category: "",
  isShort: false,
};

function UploadVideoPage() {
  const { id } = useParams(); // present only in edit mode
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingVideo, setFetchingVideo] = useState(isEdit);

  // Edit mode: prefill from existing video
  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    setFetchingVideo(true);
    setApiError("");

    getVideoById(id)
      .then((res) => {
        if (cancelled) return;
        // ✅ FIX: Backend returns video directly
        const v = res.data;
        setFields({
          title: v.title || "",
          description: v.description || "",
          thumbnailUrl: v.thumbnailUrl || "",
          videoUrl: v.videoUrl || "",
          category: v.category || "",
          isShort: Boolean(v.isShort),
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setApiError(err.response?.data?.message || "Failed to load video for editing.");
        }
      })
      .finally(() => {
        if (!cancelled) setFetchingVideo(false);
      });

    return () => { cancelled = true; };
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleShortToggle = (e) => {
    setFields((prev) => ({ ...prev, isShort: e.target.checked }));
  };

  const validate = () => {
    const errs = {};
    if (!fields.title.trim()) errs.title = "Title is required";
    if (!fields.thumbnailUrl.trim()) errs.thumbnailUrl = "Thumbnail URL is required";
    if (!fields.videoUrl.trim()) errs.videoUrl = "Video URL is required";
    if (!fields.category) errs.category = "Please select a category";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      if (isEdit) {
        await updateVideo(id, fields);
        toast.success("Video updated successfully!");
        navigate(`/video/${id}`);
      } else {
        const res = await createVideo(fields);
        toast.success("Video uploaded successfully!");
        navigate(`/video/${res.data.video._id}`);
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        "Failed to save video. Make sure you have a channel first."
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingVideo) {
    return <div className="uvp-loading">Loading video…</div>;
  }

  return (
    <div className="uvp-body">
      <div className="uvp-card">
        <div className="uvp-heading-row">
          <h1 className="uvp-heading">
            {isEdit ? "Edit Video" : "Upload Video"}
          </h1>
          <Link to="/" className="uvp-cancel">Cancel</Link>
        </div>

        {apiError && <div className="auth-api-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={fields.title}
              onChange={handleChange}
              className={errors.title ? "input-error" : ""}
              placeholder="Enter video title"
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={fields.description}
              onChange={handleChange}
              placeholder="Tell viewers about your video"
              rows={4}
              className="uvp-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="thumbnailUrl">Thumbnail URL *</label>
            <input
              id="thumbnailUrl"
              name="thumbnailUrl"
              type="url"
              value={fields.thumbnailUrl}
              onChange={handleChange}
              className={errors.thumbnailUrl ? "input-error" : ""}
              placeholder="https://example.com/thumbnail.jpg"
            />
            {errors.thumbnailUrl && (
              <span className="field-error">{errors.thumbnailUrl}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="videoUrl">Video URL *</label>
            <input
              id="videoUrl"
              name="videoUrl"
              type="url"
              value={fields.videoUrl}
              onChange={handleChange}
              className={errors.videoUrl ? "input-error" : ""}
              placeholder="https://example.com/video.mp4"
            />
            {errors.videoUrl && (
              <span className="field-error">{errors.videoUrl}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={fields.category}
              onChange={handleChange}
              className={`uvp-select${errors.category ? " input-error" : ""}`}
            >
              <option value="">— Select a category —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <span className="field-error">{errors.category}</span>
            )}
          </div>

          <div className="form-group uvp-checkbox-group">
            <label className="uvp-checkbox-label">
              <input
                type="checkbox"
                checked={fields.isShort}
                onChange={handleShortToggle}
              />
              This is a Short (vertical, under 60s)
            </label>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading
              ? isEdit ? "Saving…" : "Uploading…"
              : isEdit ? "Save Changes" : "Upload Video"
            }
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadVideoPage;