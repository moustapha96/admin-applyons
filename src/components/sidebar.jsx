/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SimpleBarReact from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import LogoLight from "../assets/logo.png";
import { AiOutlineHistory, AiOutlineLineChart, AiOutlineUser, AiOutlineUserAdd, AiOutlineFileText } from "react-icons/ai";
import { MdOutlineEmail, MdOutlineEvent, MdOutlineGroups, MdOutlineBusiness, MdOutlineSchool, MdOutlineSend, MdOutlinePayment, MdOutlineBarChart } from "react-icons/md";
import { BiNews, BiListCheck } from "react-icons/bi";
import { RiSettings4Line, RiMailSettingsLine, RiFileList3Line, RiShieldUserLine, RiRouteLine } from "react-icons/ri";
import { FaRegHandshake, FaRegImages, FaRegFileAlt } from "react-icons/fa";
import { BellOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/useAuth";
import { usePermissions } from "../hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { LiaSignOutAltSolid } from "react-icons/lia";
import { HiOutlineDocumentAdd } from "react-icons/hi";

/* -------------------- Helpers permissions / rôles -------------------- */
const getUserPermKeys = (user) =>
  Array.isArray(user?.permissions) ? user.permissions.map((p) => p.key) : [];

const hasAnyPerm = (user, perms = []) => {
  if (!perms?.length) return true;
  const keys = getUserPermKeys(user);
  return perms.some((p) => keys.includes(p));
};

const hasRole = (user, roles = []) => {
  if (!roles?.length) return true;
  const userRoles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];
  return roles.some((r) => userRoles.includes(r));
};

const canSee = (user, item, hasAnyPermission) => {
  if (!hasAnyPermission) {
    // Fallback si hasAnyPermission n'est pas fourni
    return hasRole(user, item.roles) && hasAnyPerm(user, item.anyPerms);
  }
  return hasRole(user, item.roles) && (item.anyPerms?.length ? hasAnyPermission(item.anyPerms) : true);
};



/* -------------------- Menus de base (Admin/Traducteur/Demandeur) -------------------- */
/** NOTE: on utilise des clés i18n (i18nKey) — l’affichage passe par t('sidebar.<clé>') */
const MENU_ADMIN = [
  { i18nKey: "dashboard", icon: <AiOutlineLineChart />, to: "/admin/dashboard" },

  {
    i18nKey: "users",
    icon: <AiOutlineUser />,
    anyPerms: ["users.read", "users.manage"],
    children: [
      { i18nKey: "userList", to: "/admin/users", anyPerms: ["users.read", "users.manage"], icon: <MdOutlineGroups /> },
      { i18nKey: "userNew", to: "/admin/users/create", anyPerms: ["users.manage"], icon: <AiOutlineUserAdd /> },
    ],
  },

  {
    i18nKey: "organizations",
    icon: <FaRegHandshake />,
    anyPerms: ["organizations.read", "organizations.manage"],
    children: [
      { i18nKey: "organizationsList", to: "/admin/organisations", anyPerms: ["organizations.read"], icon: <MdOutlineBusiness /> },
      { i18nKey: "departments", to: "/admin/departments", anyPerms: ["departments.read"], icon: <MdOutlineSchool /> },
      { i18nKey: "filieres", to: "/admin/filieres", anyPerms: ["filieres.read"], icon: <MdOutlineSchool /> },
      { i18nKey: "organizationInvites", to: "/admin/organization-invites", anyPerms: ["invites.read"], icon: <MdOutlineSend /> },
      { i18nKey: "notifications", to: "/admin/organisations/notifications", anyPerms: ["notifications.read", "demandes.read"], icon: <BellOutlined /> },
    ],
  },

  {
    i18nKey: "demandes",
    icon: <AiOutlineHistory />,
    anyPerms: ["demandes.read", "demandes.manage"],
    children: [{ i18nKey: "allDemandes", to: "/admin/demandes", anyPerms: ["demandes.read"], icon: <BiListCheck /> }],
  },

  {
    i18nKey: "documents",
    icon: <FaRegImages />,
    anyPerms: ["documents.read", "documents.create", "documents.update"],
    children: [{ i18nKey: "myDocuments", to: "/admin/documents", anyPerms: ["documents.read"], icon: <FaRegFileAlt /> }],
  },

  {
    i18nKey: "payments",
    icon: <MdOutlineEvent />,
    anyPerms: ["payments.read", "payments.manage"],
    children: [
      { i18nKey: "paymentList", to: "/admin/payments", anyPerms: ["payments.read"], icon: <MdOutlinePayment /> },
      { i18nKey: "paymentStats", to: "/admin/payments/stats", anyPerms: ["payments.read"], icon: <MdOutlineBarChart /> },
    ],
  },

  {
    i18nKey: "abonnements",
    icon: <BiNews />,
    anyPerms: ["abonnements.read", "abonnements.manage"],
    children: [
      { i18nKey: "abonnementList", to: "/admin/abonnements", anyPerms: ["abonnements.read"], icon: <BiListCheck /> },
      { i18nKey: "abonnementStats", to: "/admin/abonnements/stats", anyPerms: ["abonnements.read"], icon: <MdOutlineBarChart /> },
    ],
  },

  {
    i18nKey: "contacts",
    icon: <MdOutlineEmail />,
    anyPerms: ["contacts.read", "contacts.manage"],
    children: [{ i18nKey: "messages", to: "/admin/contacts", anyPerms: ["contacts.read", "contacts.manage"], icon: <MdOutlineEmail /> }],
  },

  {
    i18nKey: "configurations",
    icon: <RiSettings4Line />,
    roles: ["ADMIN", "SUPER_ADMIN"],
    anyPerms: ["settings.read", "config.read", "permissions.manage"],
    children: [
      { i18nKey: "settings", to: "/admin/config", anyPerms: ["config.read", "config.manage"], icon: <RiSettings4Line /> },
      { i18nKey: "mailer", to: "/admin/mailer", anyPerms: ["config.read", "config.manage"], icon: <RiMailSettingsLine /> },
      { i18nKey: "auditLogs", to: "/admin/audit-logs", anyPerms: ["audit.read", "audit.manage"], icon: <RiFileList3Line /> },
      { i18nKey: "permissions", to: "/admin/permissions", anyPerms: ["permissions.read", "permissions.manage"], icon: <RiShieldUserLine /> },
      { i18nKey: "apiRoutes", to: "/admin/api-routes", anyPerms: ["config.read", "config.manage"], icon: <RiRouteLine /> },
    ],
  },

  { i18nKey: "profile", icon: <AiOutlineUser />, to: "/profile" },
];

const MENU_TRADUCTEUR = [
  { i18nKey: "dashboard", icon: <AiOutlineLineChart />, to: "/traducteur/dashboard" },

  {
    i18nKey: "users",
    icon: <AiOutlineUser />,
    anyPerms: ["users.read", "users.manage"],
    children: [
      { i18nKey: "userList", to: "/traducteur/users", anyPerms: ["users.read", "users.manage"], icon: <MdOutlineGroups /> },
      { i18nKey: "userNew", to: "/traducteur/users/create", anyPerms: ["users.manage"], icon: <AiOutlineUserAdd /> },
    ],
  },
  {
    i18nKey: "demandes",
    icon: <AiOutlineHistory />,
    anyPerms: ["demandes.read"],
    children: [{ i18nKey: "allDemandes", to: "/traducteur/demandes", anyPerms: ["demandes.read"], icon: <BiListCheck /> }],
  },
  { i18nKey: "profile", icon: <AiOutlineUser />, to: "/profile" },
];

const MENU_DEMANDEUR = [
  { i18nKey: "dashboard", icon: <AiOutlineLineChart />, to: "/demandeur/dashboard" },
  {
    i18nKey: "demandes",
    icon: <AiOutlineHistory />,
    anyPerms: ["demandes.read", "demandes.manage"],
    children: [
      { i18nKey: "allDemandes", to: "/demandeur/mes-demandes", anyPerms: ["demandes.read"], icon: <BiListCheck /> },
      { i18nKey: "newApplication", to: "/demandeur/mes-demandes/create", anyPerms: ["demandes.manage"], icon: <HiOutlineDocumentAdd /> },
    ],
  },
  { i18nKey: "profile", icon: <AiOutlineUser />, to: "/profile" },
];

/* -------------------- Menu Institut/Superviseur (dynamique avec orgId) -------------------- */
function buildStaffMenu(orgId, handleLogOut) {
  return [
    { i18nKey: "dashboard", icon: <AiOutlineLineChart />, to: "/organisations/dashboard" },

    {
      i18nKey: "users",
      icon: <AiOutlineUser />,
      anyPerms: ["users.read", "users.manage"],
      children: [
        { i18nKey: "userList", to: "/organisations/users", anyPerms: ["users.read", "users.manage"], icon: <MdOutlineGroups /> },
        { i18nKey: "userNew", to: "/organisations/users/create", anyPerms: ["users.manage"], icon: <AiOutlineUserAdd /> },
      ],
    },

    {
      i18nKey: "monInstitut",
      icon: <FaRegHandshake />,
      anyPerms: ["organizations.read"],
      children: [
        { i18nKey: "departments", to: "/organisations/departements", anyPerms: ["departments.read"], icon: <MdOutlineSchool /> },
        { i18nKey: "filieres", to: "/organisations/filieres", anyPerms: ["filieres.read"], icon: <MdOutlineSchool /> },
      ],
    },

    {
      i18nKey: "demandes",
      icon: <AiOutlineHistory />,
      anyPerms: ["demandes.read"],
      children: [
        { i18nKey: "allDemandes", to: "/organisations/demandes", anyPerms: ["demandes.read"], icon: <BiListCheck /> },
        { i18nKey: "invited", to: "/organisations/demandes/invited", anyPerms: ["invites.read", "invites.manage"], icon: <MdOutlineSend /> },
        { i18nKey: "ajouteDocument", to: "/organisations/demandes/ajoute-document", anyPerms: ["documents.create"], icon: <HiOutlineDocumentAdd /> },
        { i18nKey: "notifications", to: "/organisations/notifications", anyPerms: ["notifications.read", "demandes.read"], icon: <BellOutlined /> },
      ],
    },

    {
      i18nKey: "abonnements",
      icon: <BiNews />,
      anyPerms: ["abonnements.read", "abonnements.manage"],
      children: [
        { i18nKey: "mesAbonnements", to: "/organisations/abonnements", anyPerms: ["abonnements.read"], icon: <BiListCheck /> },
        orgId ? { i18nKey: "souscrire", to: `/organisations/${orgId}/abonnement`, anyPerms: ["abonnements.manage"], icon: <BiNews /> } : null,
      ].filter(Boolean),
    },

    { i18nKey: "profile", icon: <AiOutlineUser />, to: "/organisations/profile" },
    { i18nKey: "logout", icon: <LiaSignOutAltSolid />, onClick: handleLogOut },
  ];
}

function buildStaffMenuSuperviseur(orgId) {
  return [
    { i18nKey: "dashboard", icon: <AiOutlineLineChart />, to: "/organisations/dashboard" },

    {
      i18nKey: "users",
      icon: <AiOutlineUser />,
      anyPerms: ["users.read", "users.manage"],
      children: [
        { i18nKey: "userList", to: "/organisations/users", anyPerms: ["users.read", "users.manage"], icon: <MdOutlineGroups /> },
        { i18nKey: "userNew", to: "/organisations/users/create", anyPerms: ["users.manage"], icon: <AiOutlineUserAdd /> },
      ],
    },

    {
      i18nKey: "monInstitut",
      icon: <FaRegHandshake />,
      anyPerms: ["organizations.read"],
      children: [
        { i18nKey: "departments", to: "/organisations/departements", anyPerms: ["departments.read"], icon: <MdOutlineSchool /> },
        { i18nKey: "filieres", to: "/organisations/filieres", anyPerms: ["filieres.read"], icon: <MdOutlineSchool /> },
      ],
    },

    {
      i18nKey: "demandes",
      icon: <AiOutlineHistory />,
      anyPerms: ["demandes.read"],
      children: [{ i18nKey: "dossiersTraiter", to: "/organisations/dossiers-a-traiter", anyPerms: ["demandes.read"], icon: <BiListCheck /> }],
    },

    { i18nKey: "profile", icon: <AiOutlineUser />, to: "/organisations/profile" },
  ];
}

/* Map rôle -> menu (Staff construit dynamiquement) */
const resolveMenuForUser = (user, handleLogOut) => {
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];
  if (!roles.length) return [...MENU_DEMANDEUR, { i18nKey: "logout", icon: <LiaSignOutAltSolid />, onClick: handleLogOut }];
  if (roles.includes("SUPER_ADMIN")) return [...MENU_ADMIN, { i18nKey: "logout", icon: <LiaSignOutAltSolid />, onClick: handleLogOut }];
  if (roles.includes("ADMIN")) return [...MENU_ADMIN, { i18nKey: "logout", icon: <LiaSignOutAltSolid />, onClick: handleLogOut }];
  if ((roles.includes("INSTITUT") || roles.includes("SUPERVISEUR")) && user?.organization?.type !== "TRADUCTEUR") {
    return buildStaffMenu(user?.organization?.id, handleLogOut);
  }
  // if (roles.includes("SUPERVISEUR") && user?.organization?.type !== "TRADUCTEUR") {
  //   return buildStaffMenuSuperviseur(user?.organization?.id);
  // }
  if (roles.includes("TRADUCTEUR")) return [...MENU_TRADUCTEUR, { i18nKey: "logout", icon: <LiaSignOutAltSolid />, onClick: handleLogOut }];
  if (roles.includes("DEMANDEUR")) return [...MENU_DEMANDEUR, { i18nKey: "logout", icon: <LiaSignOutAltSolid />, onClick: handleLogOut }];
  return [...MENU_DEMANDEUR, { i18nKey: "logout", icon: <LiaSignOutAltSolid />, onClick: handleLogOut }];
};

/* -------------------- Sidebar -------------------- */
export default function Sidebar({ isCollapsed = false }) {
  const { user, logout } = useAuth();
  const { hasAnyPermission } = usePermissions();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const current = location.pathname;

  const [openKey, setOpenKey] = useState("");
  const [isManualToggle, setIsManualToggle] = useState(false);

  // Fonction de déconnexion
  const handleLogOut = async () => {
    try {
      await logout();
      navigate("/auth/login");
    } catch {
      navigate("/auth/login");
    }
  };

  // Menu de base selon le rôle de l'utilisateur
  const baseMenu = useMemo(() => resolveMenuForUser(user, handleLogOut), [user, handleLogOut]);

  // Fonction pour vérifier si une route correspond (gère les routes paramétrées)
  const isRouteActive = useCallback((route) => {
    if (!route) return false;
    // Correspondance exacte
    if (current === route) return true;
    // Pour les routes paramétrées, vérifier si le chemin commence par la route suivie d'un "/" ou "?"
    // Éviter les faux positifs : /admin/users ne doit pas correspondre à /admin/user
    const routeWithSlash = route.endsWith("/") ? route : route + "/";
    const routeWithQuery = route + "?";
    return current.startsWith(routeWithSlash) || current.startsWith(routeWithQuery);
  }, [current]);

  // ouvre automatiquement le parent du chemin courant (seulement si pas de toggle manuel récent)
  useEffect(() => {
    if (!isManualToggle) {
      const parentWithChild = baseMenu.find((m) => 
        m.children?.some?.((c) => isRouteActive(c.to))
      );
      if (parentWithChild) {
        setOpenKey(parentWithChild.i18nKey);
      }
    }
  }, [current, baseMenu, isRouteActive, isManualToggle]);

  // Filtrage par permissions + rôles
  const filteredMenu = useMemo(() => {
    return baseMenu
      .filter((item) => canSee(user, item, hasAnyPermission))
      .map((item) => {
        if (item.children?.length) {
          const children = item.children.filter((child) => canSee(user, child, hasAnyPermission));
          if (!children.length) return null;
          return { ...item, children };
        }
        return item;
      })
      .filter(Boolean);
  }, [user, baseMenu, hasAnyPermission]);

  const labelOf = (key) => t(`sidebar.${key}`);

  return (
    <nav className={`sidebar-wrapper sidebar-dark ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-content">
        <div className="sidebar-brand">
          <Link to="/"><img src={LogoLight} height="24" alt="" /></Link>
        </div>

        <SimpleBarReact style={{ height: "calc(100% - 70px)" }}>
          <ul className="sidebar-menu border-t border-white/10">
            {filteredMenu.map((item, itemIndex) => {
              const itemLabel = labelOf(item.i18nKey);
              // Clé unique pour l'item parent : combine i18nKey avec to ou index
              const itemKey = `${item.i18nKey}-${item.to || (item.onClick ? 'action' : 'item')}-${itemIndex}`;

              if (!item.children?.length) {
                const active = item.to && isRouteActive(item.to) ? "active" : "";
                // Gérer les items avec onClick (comme logout)
                if (item.onClick) {
                  return (
                    <li key={itemKey} className={active}>
                      <a 
                        href="#" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation();
                          // Fermer tous les menus déroulants avant la déconnexion
                          setOpenKey("");
                          item.onClick(); 
                        }}
                        className="sidebar-link"
                        role="button"
                      >
                        <div className="icon me-3">{item.icon}</div>
                        <span className="sidebar-label">{itemLabel}</span>
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={itemKey} className={active}>
                    <Link 
                      to={item.to} 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Fermer tous les menus déroulants lors de la navigation vers un item sans enfants
                        setOpenKey("");
                      }}
                    >
                      <div className="icon me-3">{item.icon}</div>
                      <span className="sidebar-label">{itemLabel}</span>
                    </Link>
                  </li>
                );
              }

              const isOpen = openKey === item.i18nKey;
              const isActive = item.children.some((c) => isRouteActive(c.to));

              return (
                <li key={itemKey} className={`sidebar-dropdown ${isActive ? "active" : ""} ${isOpen ? "open" : ""}`}>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsManualToggle(true);
                      setOpenKey(isOpen ? "" : item.i18nKey);
                      // Réinitialiser le flag après un court délai pour permettre l'auto-ouverture future
                      setTimeout(() => setIsManualToggle(false), 100);
                    }}
                    className="sidebar-link"
                    role="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    <div className="icon me-3">{item.icon}</div>
                    <span className="sidebar-label">{itemLabel}</span>
                  </a>

                  <div className={`sidebar-submenu ${isOpen ? "block" : "hidden"}`}>
                    <ul>
                      {item.children.map((child, childIndex) => {
                        const childLabel = labelOf(child.i18nKey);
                        const childActive = isRouteActive(child.to);
                        // Clé unique pour l'enfant : combine parent i18nKey, child i18nKey, to et index
                        const childKey = `${item.i18nKey}-${child.i18nKey}-${child.to || 'no-route'}-${childIndex}`;
                        return (
                          <li key={childKey} className={`ms-0 ${childActive ? "active" : ""}`}>
                            <Link 
                              to={child.to} 
                              onClick={(e) => {
                                e.stopPropagation();
                                // Garder le menu ouvert si on clique sur un sous-menu actif
                                if (!childActive) {
                                  // Si on navigue vers un autre sous-menu, garder le parent ouvert
                                  setOpenKey(item.i18nKey);
                                }
                              }}
                            >
                              {child.icon ? <span className="me-2">{child.icon}</span> : null}
                              <span className="sidebar-label">{childLabel}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </SimpleBarReact>
      </div>
    </nav>
  );
}
