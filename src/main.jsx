import React from "react";
import { createRoot } from "react-dom/client"
import "./assets/css/tailwind.css"
import "./assets/css/materialdesignicons.min.css"
import App from "./App.jsx"
import { BrowserRouter } from "react-router-dom"
import { AppProvider } from "./context/AppProvider.jsx"
import { AuthProvider } from "./context/AuthContext.jsx"
import { PermissionsProvider } from "./context/PermissionsContext.jsx"
import "react-quill/dist/quill.snow.css";

import 'antd/dist/reset.css'; 
import "./assets/css/style.css";
import "./i18n";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppProvider>
      <AuthProvider>
        <PermissionsProvider>
          <App />
        </PermissionsProvider>
      </AuthProvider>
    </AppProvider>
  </BrowserRouter>,
)
