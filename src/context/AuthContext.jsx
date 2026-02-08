/* eslint-disable react/prop-types */

"use client";
import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axiosInstance from "@/services/api";
import authService from "@/services/authService";

export const AuthContext = createContext(undefined);

const USER_COOKIE = "applyons_user";
const TOKEN_KEY = "token";
const USER_KEY = "user";
const REMEMBER_KEY = "applyons_remember_me";
const COOKIE_EXPIRES = 7;


const getHomePathForRole = (role) => {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "INSTITUT":
    case "SUPERVISEUR":
      return "/organisations/dashboard";
    case "TRADUCTEUR":
      return "/traducteur/dashboard";
    case "DEMANDEUR":
    default:
      return "/demandeur/dashboard";
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setAuthHeader = useCallback((tkn) => {
    if (tkn) axiosInstance.defaults.headers.common.Authorization = `Bearer ${tkn}`;
    else delete axiosInstance.defaults.headers.common.Authorization;
  }, []);

  const persistAuth = useCallback((u, t, rememberMe = false) => {
    setUser(u || null);
    setToken(t || null);
    setAuthHeader(t);

    const isProd = import.meta.env.MODE === "production";
    const cookieOpts = rememberMe
      ? { expires: COOKIE_EXPIRES, sameSite: "strict", secure: isProd }
      : { sameSite: "strict", secure: isProd };

    if (u && t) {
      Cookies.set(USER_COOKIE, JSON.stringify(u), cookieOpts);
      try {
        localStorage.setItem(REMEMBER_KEY, rememberMe ? "1" : "0");
      } catch (_) {}
      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, t);
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, t);
        sessionStorage.setItem(USER_KEY, JSON.stringify(u));
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    } else {
      Cookies.remove(USER_COOKIE);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    }
  }, [setAuthHeader]);

  // Récupère le profil courant si on a un token
  const fetchProfile = useCallback(async () => {
    try {
      if (!token) return;
      const response = await authService.getProfile();
      const updatedUser = response?.user || response;
      if (updatedUser) {
        setUser(updatedUser);
        Cookies.set(USER_COOKIE, JSON.stringify(updatedUser), {
          expires: COOKIE_EXPIRES,
          sameSite: "strict",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
    }
  }, [token]);

  /** Boot :
   * 1) Si un token est en localStorage → on tente /auth/profile
   * 2) Sinon → on tente /auth/refresh-token (cookie httpOnly)
   */
  useEffect(() => {
    (async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
        const fromLocal = !!localStorage.getItem(TOKEN_KEY);
        if (savedToken) {
          setAuthHeader(savedToken);
          try {
            const prof = await authService.getProfile();
            const freshUser = prof?.user || prof;
            if (freshUser) {
              persistAuth(freshUser, savedToken, fromLocal);
            } else {
              persistAuth(null, null);
            }
          } catch {
            try {
              const r = await authService.refreshToken();
              const t = r?.token || r?.data?.token;
              const u = r?.user || r?.data?.user;
              if (t && u) persistAuth(u, t, true);
              else persistAuth(null, null);
            } catch {
              persistAuth(null, null);
            }
          }
        } else {
          try {
            const r = await authService.refreshToken();
            const t = r?.token || r?.data?.token;
            const u = r?.user || r?.data?.user;
            if (t && u) persistAuth(u, t, true);
          } catch {
            // pas de session
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [persistAuth, setAuthHeader]);

  const login = useCallback(
    async (credentials, rememberMe = false) => {
      // On accepte soit {token, user}, soit un payload "aplati" contenant token + champs user
      const t = credentials?.token || credentials?.accessToken;
      const u = credentials?.user || credentials;
      if (!t || !u) throw new Error("Réponse login invalide");

      persistAuth(u, t, rememberMe);

      // Si compte inactif → lock-screen
      if (u.enabled === false) {
        navigate("/auth/lock-screen"); // écran inactif
        return u;
      }

      // Redirection unique et cohérente
      const target = getHomePathForRole(u.role);
      navigate(target);
      return u;
    },
    [navigate, persistAuth]
  );

  const loginWithPayload = useCallback(
    (payload, rememberMe = false) => {
      const t = payload?.token || payload?.accessToken;
      const u = payload?.user || payload;
      if (!t || !u) throw new Error("Payload login invalide");

      persistAuth(u, t, rememberMe);

      if (u.enabled === false) {
        navigate("/auth/lock-screen");
        return u;
      }

      navigate(getHomePathForRole(u.role));
      return u;
    },
    [navigate, persistAuth]
  );

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const prof = await authService.getProfile();
      const u = prof?.user || prof;
      if (u) {
        persistAuth(u, token, !!localStorage.getItem(TOKEN_KEY));
        return u;
      }
    } catch {
      await logout();
    }
    return null;
  }, [token, persistAuth]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.log(e);
    }
    persistAuth(null, null);
    navigate("/auth/login");
  }, [navigate, persistAuth]);

  const isAuthenticated = !!token && !!user;
  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        loginWithPayload,
        logout,
        refreshProfile,
        fetchProfile,
        authHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
