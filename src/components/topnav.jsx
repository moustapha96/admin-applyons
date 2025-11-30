/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import logoDark from "../assets/images/logo-icon-64-dark.png";
import logoLight from "../assets/images/logo-icon-64.png";
import smallLogo from "../assets/images/logo-icon-32.png";

import * as Icon from "react-feather";
import { IoSettingsOutline } from "react-icons/io5";
import { AiOutlineUser } from "react-icons/ai";
import { LiaSignOutAltSolid } from "react-icons/lia";

import { Avatar, Tag, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";

import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "../utils/imageUtils";

const LANGS = [
  { key: "fr", label: "Français" },
  { key: "en", label: "English" },
  { key: "es", label: "Español" },
  { key: "it", label: "Italiano" },
  { key: "de", label: "Deutsch" },
  { key: "zh", label: "中文" }
];

export default function Topnav({ setToggle, toggle }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // --- Helpers ---
  const getHomePathForRole = (role) => {
    switch (role) {
      case "ADMIN":
      case "SUPER_ADMIN":
        return t("routes.adminDashboard");
      case "INSTITUT":
      case "SUPERVISEUR":
        return t("routes.orgDashboard");
      case "TRADUCTEUR":
        return t("routes.tradDashboard");
      case "DEMANDEUR":
      default:
        return t("routes.demandeurDashboard");
    }
  };

  const profilePathForRole = (role) => {
    switch (role) {
      case "ADMIN":
      case "SUPER_ADMIN":
        return t("routes.adminProfile");
      case "INSTITUT":
      case "SUPERVISEUR":
        return t("routes.orgProfile");
      case "TRADUCTEUR":
        return t("routes.tradProfile");
      case "DEMANDEUR":
      default:
        return t("routes.demandeurProfile");
    }
  };

  const permKeys = useMemo(
    () =>
      Array.isArray(user?.permissions)
        ? user.permissions.map((p) => (typeof p === "object" ? p.key : String(p)))
        : [],
    [user]
  );
  const hasPerm = (k) => permKeys.includes(k);

  const role = user?.role || "UTILISATEUR";
  const fullName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : t("common.user");
  const orgName = user?.organization?.name;

  const handleLogOut = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch {
      navigate("/auth/login");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleHandler = () => setToggle(!toggle);
  const stopPropagation = (e) => e.stopPropagation();

  const showSettings =
    (role === "ADMIN" || role === "SUPER_ADMIN") && (hasPerm("settings.read") || hasPerm("settings.manage"));
  const settingsPath = t("routes.adminSettings");
  const homePath = getHomePathForRole(role);

  const roleColor =
    role === "ADMIN" || role === "SUPER_ADMIN"
      ? "red"
      : role === "INSTITUT" || role === "SUPERVISEUR"
      ? "geekblue"
      : role === "TRADUCTEUR"
      ? "purple"
      : "green";

  // Dropdown AntD pour la langue
  const langMenuItems = LANGS.map((l) => ({
    key: l.key,
    label: l.label,
    onClick: () => i18n.changeLanguage(l.key)
  }));

  return (
    <>
      <div className="top-header">
        <div className="header-bar flex justify-between">
          {/* Left: logo + sidebar toggle */}
          <div className="flex items-center space-x-1">
            <Link to={homePath} className="xl:hidden block me-2" aria-label={t("common.home")}>
              <img src={smallLogo} className="md:hidden block" alt="logo" />
              <span className="md:block hidden">
                <img src={logoDark} className="inline-block dark:hidden" alt="logo" />
                <img src={logoLight} className="hidden dark:inline-block" alt="logo" />
              </span>
            </Link>

            <button
              id="close-sidebar"
              type="button"
              className="size-8 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-[20px] text-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-gray-800 text-slate-900 dark:text-white rounded-full"
              onClick={toggleHandler}
              aria-label={t("common.toggleSidebar")}
              title={t("common.toggleSidebar")}
            >
              <Icon.Menu className="size-4" />
            </button>
          </div>

          {/* Right: lang switch + user menu */}
          <ul className="list-none mb-0 flex items-center gap-2">
            {/* Language switcher */}
            <li>
              <Dropdown
                trigger={["click"]}
                menu={{ items: langMenuItems }}
              >
                <button
                  type="button"
                  className="px-3 h-8 inline-flex items-center justify-center rounded-md border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm"
                  title={i18n.language}
                >
                  {i18n.language?.toUpperCase() || "FR"}
                </button>
              </Dropdown>
            </li>

            {/* User menu */}
            <li className="dropdown inline-block relative" ref={userMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu((s) => !s);
                }}
                className="dropdown-toggle items-center flex"
                type="button"
              >
                <span
                  className="size-8 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-[20px] text-center
                  bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-gray-800
                  text-slate-900 dark:text-white rounded-full"
                >
                  <div className="round-full">
                    <Avatar
                      size={50}
                      src={user?.avatar ? buildImageUrl(user.avatar) : undefined}
                      alt="avatar"
                      icon={<UserOutlined />}
                      style={{
                        cursor: "pointer",
                        border: "4px solid rgba(255,255,255,0.3)",
                        transition: "all 0.3s ease"
                      }}
                    />
                  </div>
                </span>

                <span className="font-semibold text-[16px] ms-2 sm:inline-block hidden text-left">
                  <span className="block leading-5">{fullName || t("common.user")}</span>
                  <span className="flex items-center gap-2">
                    {orgName ? (
                      <span className="text-[12px] text-applyons-orange font-semibold truncate max-w-[180px]" title={orgName}>
                        {orgName}
                      </span>
                    ) : (
                      <span className="text-[12px] text-slate-400">{t("common.organizationMissing")}</span>
                    )}
                    <Tag color={roleColor} className="text-[10px] m-0">
                      {t(`roles.${role}`)}
                    </Tag>
                  </span>
                </span>
              </button>

              {/* Dropdown */}
              <div
                className={`dropdown-menu absolute end-0 m-0 mt-4 z-10 w-48 rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 ${
                  showUserMenu ? "" : "hidden"
                }`}
                onClick={stopPropagation}
              >
                <ul className="py-2 text-start">
                  <li>
                    <Link
                      to={profilePathForRole(role)}
                      className="flex items-center text-[14px] font-semibold py-1.5 px-4 hover:text-[var(--applyons-orange)]"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <AiOutlineUser className="me-2" />
                      {t("common.profile")}
                    </Link>
                  </li>

                 

                  <li>
                    <Link
                      to={homePath}
                      className="flex items-center text-[14px] font-semibold py-1.5 px-4 hover:text-[var(--applyons-orange)]"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon.Compass className="me-2" />
                      {t("common.dashboard")}
                    </Link>
                  </li>

                  <li className="border-t border-gray-100 dark:border-gray-800 my-2"></li>
                  <li>
                    <button
                      onClick={handleLogOut}
                      className="w-full text-left flex items-center text-[14px] font-semibold py-1.5 px-4 hover:text-[var(--applyons-orange)]"
                    >
                      <LiaSignOutAltSolid className="me-2 size-4" />
                      {t("common.logout")}
                    </button>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
