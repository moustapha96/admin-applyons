/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import SimpleBarReact from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import LogoLight from "../assets/logo.png";
import { AiOutlineHistory, AiOutlineLineChart, AiOutlineUser } from "react-icons/ai";
import { MdOutlineEmail, MdOutlineEvent } from "react-icons/md";
import { BiNews } from "react-icons/bi";
import { RiSettings4Line } from "react-icons/ri";
import { FaRegHandshake, FaRegImages } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

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

const canSee = (user, item) => hasRole(user, item.roles) && hasAnyPerm(user, item.anyPerms);

/* -------------------- Menus de base (Admin/Traducteur/Demandeur) -------------------- */
/** NOTE: on utilise des clés i18n (i18nKey) — l’affichage passe par t('sidebar.<clé>') */
const MENU_ADMIN = [
  { i18nKey: "dashboard", icon: <AiOutlineLineChart />, to: "/admin/dashboard" },

  {
    i18nKey: "users",
    icon: <AiOutlineUser />,
    anyPerms: ["users.read", "users.manage"],
    children: [
      { i18nKey: "userList", to: "/admin/users", anyPerms: ["users.read", "users.manage"] },
      { i18nKey: "userNew", to: "/admin/users/create", anyPerms: ["users.manage"] },
    ],
  },

  {
    i18nKey: "organizations",
    icon: <FaRegHandshake />,
    anyPerms: ["organizations.read", "organizations.manage"],
    children: [
      { i18nKey: "organizationsList", to: "/admin/organisations", anyPerms: ["organizations.read"] },
      { i18nKey: "departments", to: "/admin/departments", anyPerms: ["departments.read"] },
      { i18nKey: "filieres", to: "/admin/filieres", anyPerms: ["filieres.read"] },
    ],
  },

  {
    i18nKey: "demandes",
    icon: <AiOutlineHistory />,
    anyPerms: ["demandes.read", "demandes.manage"],
    children: [{ i18nKey: "allDemandes", to: "/admin/demandes", anyPerms: ["demandes.read"] }],
  },

  {
    i18nKey: "documents",
    icon: <FaRegImages />,
    anyPerms: ["documents.read", "documents.create", "documents.update"],
    children: [{ i18nKey: "myDocuments", to: "/admin/documents", anyPerms: ["documents.read"] }],
  },

  {
    i18nKey: "payments",
    icon: <MdOutlineEvent />,
    anyPerms: ["payments.read", "payments.manage"],
    children: [
      { i18nKey: "paymentList", to: "/admin/payments", anyPerms: ["payments.read"] },
      { i18nKey: "paymentStats", to: "/admin/payments/stats", anyPerms: ["payments.read"] },
    ],
  },

  {
    i18nKey: "abonnements",
    icon: <BiNews />,
    anyPerms: ["abonnements.read", "abonnements.manage"],
    children: [
      { i18nKey: "abonnementList", to: "/admin/abonnements", anyPerms: ["abonnements.read"] },
      { i18nKey: "abonnementStats", to: "/admin/abonnements/stats", anyPerms: ["abonnements.read"] },
    ],
  },

  {
    i18nKey: "contacts",
    icon: <MdOutlineEmail />,
    anyPerms: ["contacts.read", "contacts.manage"],
    children: [{ i18nKey: "messages", to: "/admin/contacts", anyPerms: ["contacts.read", "contacts.manage"] }],
  },

  {
    i18nKey: "configurations",
    icon: <RiSettings4Line />,
    roles: ["ADMIN", "SUPER_ADMIN"],
    anyPerms: ["settings.read", "config.read", "permissions.manage"],
    children: [
      { i18nKey: "settings", to: "/admin/config", anyPerms: ["config.read", "config.manage"] },
      { i18nKey: "mailer", to: "/admin/mailer", anyPerms: ["config.read", "config.manage"] },
      { i18nKey: "auditLogs", to: "/admin/audit-logs", anyPerms: ["audit.read", "audit.manage"] },
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
      { i18nKey: "userList", to: "/traducteur/users", anyPerms: ["users.read", "users.manage"] },
      { i18nKey: "userNew", to: "/traducteur/users/create", anyPerms: ["users.manage"] },
    ],
  },
  {
    i18nKey: "demandes",
    icon: <AiOutlineHistory />,
    anyPerms: ["demandes.read"],
    children: [{ i18nKey: "allDemandes", to: "/traducteur/demandes", anyPerms: ["demandes.read"] }],
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
      { i18nKey: "allDemandes", to: "/demandeur/mes-demandes", anyPerms: ["demandes.read"] },
      { i18nKey: "userNew", to: "/demandeur/mes-demandes/create", anyPerms: ["demandes.manage"] },
    ],
  },
  { i18nKey: "profile", icon: <AiOutlineUser />, to: "/profile" },
];

/* -------------------- Menu Institut/Superviseur (dynamique avec orgId) -------------------- */
function buildStaffMenu(orgId) {
  return [
    { i18nKey: "dashboard", icon: <AiOutlineLineChart />, to: "/organisations/dashboard" },

    {
      i18nKey: "users",
      icon: <AiOutlineUser />,
      anyPerms: ["users.read", "users.manage"],
      children: [
        { i18nKey: "userList", to: "/organisations/users", anyPerms: ["users.read", "users.manage"] },
        { i18nKey: "userNew", to: "/organisations/users/create", anyPerms: ["users.manage"] },
      ],
    },

    {
      i18nKey: "monInstitut",
      icon: <FaRegHandshake />,
      anyPerms: ["organizations.read"],
      children: [
        { i18nKey: "departments", to: "/organisations/departements", anyPerms: ["departments.read"] },
        { i18nKey: "filieres", to: "/organisations/filieres", anyPerms: ["filieres.read"] },
      ],
    },

    {
      i18nKey: "demandes",
      icon: <AiOutlineHistory />,
      anyPerms: ["demandes.read"],
      children: [
        { i18nKey: "allDemandes", to: "/organisations/demandes", anyPerms: ["demandes.read"] },
        { i18nKey: "ajouteDocument", to: "/organisations/demandes/ajoute-document", anyPerms: ["documents.create"] },
      ],
    },

    {
      i18nKey: "abonnements",
      icon: <BiNews />,
      anyPerms: ["abonnements.read", "abonnements.manage"],
      children: [
        { i18nKey: "mesAbonnements", to: "/organisations/abonnements", anyPerms: ["abonnements.read"] },
        orgId ? { i18nKey: "souscrire", to: `/organisations/${orgId}/abonnement`, anyPerms: ["abonnements.manage"] } : null,
      ].filter(Boolean),
    },

    { i18nKey: "profile", icon: <AiOutlineUser />, to: "/organisations/profile" },
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
        { i18nKey: "userList", to: "/organisations/users", anyPerms: ["users.read", "users.manage"] },
        { i18nKey: "userNew", to: "/organisations/users/create", anyPerms: ["users.manage"] },
      ],
    },

    {
      i18nKey: "monInstitut",
      icon: <FaRegHandshake />,
      anyPerms: ["organizations.read"],
      children: [
        { i18nKey: "departments", to: "/organisations/departements", anyPerms: ["departments.read"] },
        { i18nKey: "filieres", to: "/organisations/filieres", anyPerms: ["filieres.read"] },
      ],
    },

    {
      i18nKey: "demandes",
      icon: <AiOutlineHistory />,
      anyPerms: ["demandes.read"],
      children: [{ i18nKey: "dossiersTraiter", to: "/organisations/dossiers-a-traiter", anyPerms: ["demandes.read"] }],
    },

    { i18nKey: "profile", icon: <AiOutlineUser />, to: "/organisations/profile" },
  ];
}

/* Map rôle -> menu (Staff construit dynamiquement) */
const resolveMenuForUser = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role] : [];
  if (!roles.length) return MENU_DEMANDEUR;
  if (roles.includes("SUPER_ADMIN")) return MENU_ADMIN;
  if (roles.includes("ADMIN")) return MENU_ADMIN;
  if ((roles.includes("INSTITUT") || roles.includes("SUPERVISEUR")) && user?.organization?.type !== "TRADUCTEUR") {
    return buildStaffMenu(user?.organization?.id);
  }
  // if (roles.includes("SUPERVISEUR") && user?.organization?.type !== "TRADUCTEUR") {
  //   return buildStaffMenuSuperviseur(user?.organization?.id);
  // }
  if (roles.includes("TRADUCTEUR")) return MENU_TRADUCTEUR;
  if (roles.includes("DEMANDEUR")) return MENU_DEMANDEUR;
  return MENU_DEMANDEUR;
};

/* -------------------- Sidebar -------------------- */
export default function Sidebar() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const current = location.pathname;

  const [openKey, setOpenKey] = useState("");

  // Menu de base selon le rôle de l'utilisateur
  const baseMenu = useMemo(() => resolveMenuForUser(user), [user]);

  // ouvre automatiquement le parent du chemin courant
  useEffect(() => {
    const parentWithChild = baseMenu.find((m) => m.children?.some?.((c) => c.to === current));
    if (parentWithChild) setOpenKey(parentWithChild.i18nKey);
  }, [current, baseMenu]);

  // Filtrage par permissions + rôles
  const filteredMenu = useMemo(() => {
    return baseMenu
      .filter((item) => canSee(user, item))
      .map((item) => {
        if (item.children?.length) {
          const children = item.children.filter((child) => canSee(user, child));
          if (!children.length) return null;
          return { ...item, children };
        }
        return item;
      })
      .filter(Boolean);
  }, [user, baseMenu]);

  const labelOf = (key) => t(`sidebar.${key}`);

  return (
    <nav className="sidebar-wrapper sidebar-dark">
      <div className="sidebar-content">
        <div className="sidebar-brand">
          <Link to="/"><img src={LogoLight} height="24" alt="" /></Link>
        </div>

        <SimpleBarReact style={{ height: "calc(100% - 70px)" }}>
          <ul className="sidebar-menu border-t border-white/10">
            {filteredMenu.map((item) => {
              const itemLabel = labelOf(item.i18nKey);

              if (!item.children?.length) {
                const active = current === item.to ? "active" : "";
                return (
                  <li key={item.i18nKey} className={active}>
                    <Link to={item.to}>
                      <div className="icon me-3">{item.icon}</div>
                      {itemLabel}
                    </Link>
                  </li>
                );
              }

              const isOpen = openKey === item.i18nKey;
              const isActive = item.children.some((c) => c.to === current);

              return (
                <li key={item.i18nKey} className={`sidebar-dropdown ${isActive ? "active" : ""}`}>
                  <Link to="#" onClick={() => setOpenKey(isOpen ? "" : item.i18nKey)}>
                    <div className="icon me-3">{item.icon}</div>
                    {itemLabel}
                  </Link>

                  <div className={`sidebar-submenu ${isOpen ? "block" : ""}`}>
                    <ul>
                      {item.children.map((child) => {
                        const childLabel = labelOf(child.i18nKey);
                        return (
                          <li key={child.i18nKey} className={`ms-0 ${current === child.to ? "active" : ""}`}>
                            <Link to={child.to}>
                              {child.icon ? <span className="me-2">{child.icon}</span> : null}
                              {childLabel}
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
