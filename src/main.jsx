import React from "react";
import { createRoot } from "react-dom/client";
import { App as AntdApp, ConfigProvider, theme as antdTheme } from "antd";
import frFR from "antd/locale/fr_FR";
import "./assets/css/tailwind.css";
import "./assets/css/materialdesignicons.min.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AppProvider } from "./context/AppProvider.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PermissionsProvider } from "./context/PermissionsContext.jsx";
import "react-quill/dist/quill.snow.css";
import "antd/dist/reset.css";
import "./assets/css/style.css";
import "./i18n";

// Désinscription de tout Service Worker pour éviter le cache après déploiement
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
  caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
}

function ThemedApp() {
  const { isDark } = useTheme();
  return (
    <ConfigProvider
      locale={frFR}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {},
      }}
    >
      <AntdApp>
        <AppProvider>
          <AuthProvider>
            <PermissionsProvider>
              <App />
            </PermissionsProvider>
          </AuthProvider>
        </AppProvider>
      </AntdApp>
    </ConfigProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </BrowserRouter>
);
