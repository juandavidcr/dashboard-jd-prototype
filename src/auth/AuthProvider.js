import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMe() {
      if (!token) return setUser(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:4000"}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setUser(null);
      }
    }
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${process.env.REACT_APP_API_BASE || "http://localhost:4000"}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    setToken(data.token);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    const base = process.env.REACT_APP_API_BASE || "http://localhost:4000";
    try {
      await fetch(`${base}/api/logout`, { method: "POST" });
    } catch (err) {
      // ignore
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const changePassword = async (currentPassword, newPassword) => {
    const base = process.env.REACT_APP_API_BASE || "http://localhost:4000";
    const res = await fetch(`${base}/api/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Change password failed");
    }
    return res.json();
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
