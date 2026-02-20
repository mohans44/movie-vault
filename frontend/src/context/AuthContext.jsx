import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, signupUser, updateUserProfile } from "../utils/api";

const AuthContext = createContext();

function getTokenExpiryMs(token) {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const expiryMs = getTokenExpiryMs(token);
  if (!expiryMs) return false;
  return Date.now() >= expiryMs;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!storedUser || !token) return null;
    if (isTokenExpired(token)) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
    return JSON.parse(storedUser);
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token && !isTokenExpired(token) && !user) {
      setUser(JSON.parse(storedUser));
    }
    if ((!storedUser || !token || isTokenExpired(token)) && user) {
      setUser(null);
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) return undefined;

    const timeoutMs = Math.max(0, expiryMs - Date.now());
    const timerId = setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    }, timeoutMs);

    return () => clearTimeout(timerId);
  }, [user]);

  useEffect(() => {
    const onAuthExpired = () => setUser(null);
    window.addEventListener("auth:expired", onAuthExpired);
    return () => window.removeEventListener("auth:expired", onAuthExpired);
  }, []);

  const login = async (userInput, password) => {
    setLoading(true);
    try {
      const data = await loginUser(userInput, password);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signup = async (form) => {
    setLoading(true);
    try {
      const data = await signupUser(form);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const data = await updateUserProfile(payload);
    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    return data?.user || null;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
