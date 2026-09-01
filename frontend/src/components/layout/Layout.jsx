// components/layout/Layout.jsx
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true); // ✅ Default open on desktop
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (query) => {
    const params = new URLSearchParams(location.search);
    if (query) params.set("search", query);
    else params.delete("search");
    params.delete("category"); // Search and category are mutually exclusive

    // ✅ If we're already on home, just update search params
    if (location.pathname === "/") {
      navigate({ search: params.toString() }, { replace: true });
    } else {
      navigate({ pathname: "/", search: params.toString() }, { replace: true });
    }
  };

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  // ✅ Auto-close sidebar on mobile when navigating (optional)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      closeSidebar();
    }
  }, [location.pathname]);

  return (
    <div className="yt-app">
      <Header onToggleSidebar={toggleSidebar} onSearch={handleSearch} />
      <div className="yt-body">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main className={`yt-main${sidebarOpen ? " yt-main--sidebar-open" : ""}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// PropTypes for better type safety
Layout.propTypes = {
  // No props – this is a layout component
};

export default Layout;