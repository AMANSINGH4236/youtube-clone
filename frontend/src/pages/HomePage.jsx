

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import FilterBar from "../components/video/FilterBar.jsx";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { getVideos } from "../services/videoService.js";
import { useDebounce } from "../hooks/useDebounce.js";

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const activeCategory = searchParams.get("category") || "";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce the search term before hitting the API. The URL itself updates
  // instantly (Layout writes it on every keystroke) — this debounce only
  // guards the network call, so typing fast doesn't fire a request per letter.
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeCategory) params.category = activeCategory;

    getVideos(params)
      .then((res) => {
        if (!cancelled) {
          // ✅ FIX: Backend returns array directly, not nested under "videos"
          setVideos(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load videos");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedSearch, activeCategory]);

  const handleCategorySelect = (cat) => {
    // Clearing search when a category is picked mirrors the original behaviour
    // (search and category filter are mutually exclusive, not combined).
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (cat) next.set("category", cat);
        else next.delete("category");
        next.delete("search");
        return next;
      },
      { replace: false } // ✅ Better for browser history
    );
  };

  return (
    <>
      <FilterBar
        // ✅ FIX: Pass empty string for "All"
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
      />
      <VideoGrid 
        videos={videos} 
        loading={loading} 
        error={error} 
        emptyTitle="No videos found"
        emptyMessage={searchQuery ? `No videos found for "${searchQuery}"` : "Try adjusting your filters"}
      />
    </>
  );
}

HomePage.propTypes = {
  // No props – this is a page component
};

export default HomePage;