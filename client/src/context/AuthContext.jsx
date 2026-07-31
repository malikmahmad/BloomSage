import { createContext, useContext, useEffect, useState } from "react";
import { api, saveToken, clearToken, getToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore the session from localStorage
  useEffect(() => {
    async function restoreSession() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.me();
        setUser(user);
      } catch {
        // Token is stale or invalid — clear it and start fresh
        clearToken();
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    const { token, user } = await api.login({ email, password });
    saveToken(token);
    // Mirror the token to the admin key so admins don't have to log in twice
    if (user.role === "admin") {
      localStorage.setItem("bloomsage_admin_token", token);
    }
    setUser(user);
    return user;
  }

  async function register(name, email, password) {
    const { token, user } = await api.register({ name, email, password });
    saveToken(token);
    setUser(user);
    return user;
  }

  function logout() {
    clearToken();
    localStorage.removeItem("bloomsage_admin_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
