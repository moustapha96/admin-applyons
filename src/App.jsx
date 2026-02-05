"use client"

import { useState } from "react"
import Sidebar from "./components/sidebar"
import Switcher from "./components/switcher"
import Topnav from "./components/topnav"
import PageBackBar from "./components/PageBackBar"
import ScrollToTop from "./components/ScrollToTop"
import { AppRoutes } from "./routes/AppRoutes"
import { useLocation } from "react-router-dom"
import Footer from "./components/footer"
import { useAuth } from "./hooks/useAuth"
import { Toaster } from 'sonner';
import "react-quill/dist/quill.snow.css";

function App() {
  const [toggle, setToggle] = useState(true)
  const location = useLocation()

  const noLayoutRoutes = [
    "/auth/login",
    "/auth/signup",
    "/auth/signup-success",
    "/registration",
    "/auth/re-password",
    "/auth/new-password",
    "/auth/activate",
    "/auth/lock-screen",
    "/auth/not-access",
    "/auth/invitations/accept",
    "/comingsoon",
    "/maintenance",
    "/error",
    "/thankyou",
    "/error-page",
    "*"
  ]

  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 applyons-tacao"></div>
      </div>
    )
  }

  const shouldShowLayout = !noLayoutRoutes.includes(location.pathname)

  return (
    <>
      <Toaster richColors position="top-right" /> 
      {shouldShowLayout ? (
        <div className={`page-wrapper ${toggle ? "toggled" : ""}`}>
          <Sidebar isCollapsed={!toggle} />
          <main className="page-content bg-gray-50 dark:bg-slate-800">
            <Topnav toggle={toggle} setToggle={setToggle} />
            <PageBackBar />
            <ScrollToTop />
            <AppRoutes />
            <Footer />
          </main>
          <Switcher />
        </div>
      ) : (
        <AppRoutes />
      )}
    </>
  )
}

export default App
