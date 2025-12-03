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

import { Avatar, Tag, Dropdown, Badge, List, Empty, Button, Divider } from "antd";
import { UserOutlined, GlobalOutlined, BellOutlined, MessageOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined } from "@ant-design/icons";

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
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  
  // État pour les notifications (à remplacer par un vrai service)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      titleKey: "notifications.newMessage",
      messageKey: "notifications.messageReceived",
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
      read: false,
      icon: <MessageOutlined />,
      color: "#1e81b0",
    },
    {
      id: 2,
      type: "success",
      titleKey: "notifications.requestApproved",
      messageKey: "notifications.requestApprovedDesc",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      read: false,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
    },
    {
      id: 3,
      type: "warning",
      titleKey: "notifications.actionRequired",
      messageKey: "notifications.actionRequiredDesc",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      icon: <WarningOutlined />,
      color: "#faad14",
    },
  ]);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

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
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) => 
        notification.id === notificationId ? { ...notification, read: true } : notification
      )
    );
  };
  
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  };
  
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return t("notifications.justNow") || "À l'instant";
    if (minutes < 60) return `${minutes} ${t("notifications.minutesAgo") || "min"}`;
    if (hours < 24) return `${hours} ${t("notifications.hoursAgo") || "h"}`;
    return `${days} ${t("notifications.daysAgo") || "j"}`;
  };

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
  const currentLang = i18n.language || "fr";
  const langMenuItems = LANGS.map((l) => ({
    key: l.key,
    label: (
      <span className="flex items-center justify-between">
        <span>{l.label}</span>
        {currentLang === l.key && (
          <span className="ml-2 text-[var(--applyons-orange)]">✓</span>
        )}
      </span>
    ),
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
                placement="bottomRight"
              >
                <button
                  type="button"
                  className="size-8 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-[20px] text-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-gray-800 text-slate-900 dark:text-white rounded-full"
                  title={t("common.selectLanguage") || "Sélectionner la langue"}
                  aria-label={t("common.selectLanguage") || "Sélectionner la langue"}
                >
                  <GlobalOutlined className="text-base" />
                </button>
              </Dropdown>
            </li>

            {/* Notifications */}
            <li className="dropdown inline-block relative" ref={notificationRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications((s) => !s);
                }}
                className="size-8 inline-flex items-center justify-center tracking-wide align-middle duration-500 text-[20px] text-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-gray-800 text-slate-900 dark:text-white rounded-full relative"
                type="button"
                title={t("common.notifications") || "Notifications"}
                aria-label={t("common.notifications") || "Notifications"}
              >
                <BellOutlined className="text-base" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 end-0 flex items-center justify-center bg-red-600 text-white text-[10px] font-bold rounded-full size-4">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <div
                className={`dropdown-menu absolute end-0 m-0 mt-4 z-10 w-80 rounded-md overflow-hidden bg-white dark:bg-slate-900 shadow-lg dark:shadow-gray-700 ${
                  showNotifications ? "" : "hidden"
                }`}
                onClick={stopPropagation}
              >
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-semibold text-base">{t("common.notifications") || "Notifications"}</span>
                  {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={markAllAsRead} className="text-xs">
                      {t("notifications.markAllRead") || "Tout marquer comme lu"}
                    </Button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <Empty
                      description={t("notifications.noNotifications") || "Aucune notification"}
                      className="py-8"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    <List
                      dataSource={notifications}
                      renderItem={(notification) => (
                        <List.Item
                          key={notification.id}
                          className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 ${
                            !notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                icon={notification.icon}
                                style={{ backgroundColor: notification.color }}
                                size="default"
                              />
                            }
                            title={
                              <div className="flex justify-between items-start">
                                <span className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>
                                  {t(notification.titleKey)}
                                </span>
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                                )}
                              </div>
                            }
                            description={
                              <div>
                                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                  {t(notification.messageKey)}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <>
                    <Divider className="my-0" />
                    <div className="px-4 py-3 text-center">
                      <Button type="link" size="small" onClick={() => setShowNotifications(false)}>
                        {t("notifications.viewAll") || "Voir toutes les notifications"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
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
                    {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                      <Tag color={roleColor} className="text-[10px] m-0">
                        {t(`roles.${role}`)}
                      </Tag>
                    )}
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


