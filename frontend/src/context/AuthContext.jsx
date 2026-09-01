// context/AuthContext.jsx


import { createContext, useState, useEffect, useCallback } from "react";
import { registerUser, loginUser, getMe } from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // true while we verify stored token

  // On mount, if a token exists in localStorage, fetch the current user profile
  // so the UI shows the avatar/name immediately after a page refresh.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    getMe()
      .then((res) => {
        // ✅ FIX: Backend returns user directly, not nested in `res.data.user`
        setUser(res.data);
      })
      .catch(() => {
        // Token is invalid/expired — clean up
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const persistToken = (t) => {
    setToken(t);
    localStorage.setItem("token", t);
  };

  // Re-fetches the current user profile from the server and updates state.
  // Needed whenever something changes server-side that the in-memory `user`
  // object doesn't know about — e.g. creating a channel pushes a new id onto
  // user.channels on the backend.
  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      setUser(res.data);
      return res.data;
    } catch (error) {
      // If refresh fails, clear user but keep token (it might be a network error)
      // The axios 401 interceptor will clear the token if it's invalid
      setUser(null);
      throw error;
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    const { token: t, user: u } = res.data;
    persistToken(t);
    setUser(u);
    // Return both user and token so the caller can use them if needed
    return { user: u, token: t };
  }, []);

  const register = useCallback(async (username, email, password) => {
    // Register returns { message, user } – no token (matching backend spec)
    const res = await registerUser({ username, email, password });
    // Return the full response so the caller can access `res.data.user`
    return res.data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  const value = {
    user,
    token,
    loading,       // consumers can gate renders while we rehydrate
    isAuthed: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}