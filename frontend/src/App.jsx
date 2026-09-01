import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// ── Lazy-load pages ──────────────────────────────────────
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const VideoPlayerPage = lazy(() => import("./pages/VideoPlayerPage.jsx"));
const ChannelPage = lazy(() => import("./pages/ChannelPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const UploadVideoPage = lazy(() => import("./pages/UploadVideoPage.jsx"));
const SubscriptionsPage = lazy(() => import("./pages/SubscriptionsPage.jsx"));
const HistoryPage = lazy(() => import("./pages/HistoryPage.jsx"));
const PlaylistsPage = lazy(() => import("./pages/PlaylistsPage.jsx"));
const PlaylistDetailPage = lazy(() => import("./pages/PlaylistDetailPage.jsx"));
const WatchLaterPage = lazy(() => import("./pages/WatchLaterPage.jsx"));
const LikedVideosPage = lazy(() => import("./pages/LikedVideosPage.jsx"));
const YourVideosPage = lazy(() => import("./pages/YourVideosPage.jsx"));
const DownloadsPage = lazy(() => import("./pages/DownloadsPage.jsx"));
const ShortsPage = lazy(() => import("./pages/ShortsPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

// ── Helper ────────────────────────────────────────────────
const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

// ── Suspense fallback ─────────────────────────────────────
const PageLoader = () => (
  <div style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>
    Loading…
  </div>
);

// ── Router ────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Auth pages – no Layout
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    ),
  },

  // Main app – with Layout
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "/channel",
        element: <Navigate to="/channel/me" replace />,
      },
      {
        path: "/video/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <VideoPlayerPage />
          </Suspense>
        ),
      },
      {
        path: "/channel/me",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChannelPage />
          </Suspense>
        ),
      },
      {
        path: "/channel/new",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChannelPage />
          </Suspense>
        ),
      },
      {
        path: "/channel/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ChannelPage />
          </Suspense>
        ),
      },
      {
        path: "/shorts",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ShortsPage />
          </Suspense>
        ),
      },
      // ── Protected routes ──
      {
        path: "/upload",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<UploadVideoPage />)}
          </Suspense>
        ),
      },
      {
        path: "/upload/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<UploadVideoPage />)}
          </Suspense>
        ),
      },
      {
        path: "/subscriptions",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<SubscriptionsPage />)}
          </Suspense>
        ),
      },
      {
        path: "/history",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<HistoryPage />)}
          </Suspense>
        ),
      },
      {
        path: "/playlists",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<PlaylistsPage />)}
          </Suspense>
        ),
      },
      {
        path: "/playlists/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<PlaylistDetailPage />)}
          </Suspense>
        ),
      },
      {
        path: "/watch-later",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<WatchLaterPage />)}
          </Suspense>
        ),
      },
      {
        path: "/liked",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<LikedVideosPage />)}
          </Suspense>
        ),
      },
      {
        path: "/your-videos",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<YourVideosPage />)}
          </Suspense>
        ),
      },
      {
        path: "/downloads",
        element: (
          <Suspense fallback={<PageLoader />}>
            {protect(<DownloadsPage />)}
          </Suspense>
        ),
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);