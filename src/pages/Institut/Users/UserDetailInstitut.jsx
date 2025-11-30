// /* eslint-disable no-unused-vars */
// "use client";

// import { useEffect, useState } from "react";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import { Breadcrumb, Card, Descriptions, Avatar, Tag, Space, Button, Spin } from "antd";
// import { UserOutlined, MailOutlined, PhoneOutlined, EditFilled } from "@ant-design/icons";
// import userService from "@/services/userService";
// import { getPermissionColor, getPermissionLabel } from "@/auth/permissions";

// export default function UserDetailInstitut() {
//   const { id } = useParams();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   const fetchUser = async () => {
//     setLoading(true);
//     try {
//       const res = await userService.getById(id);
//       setUser(res.user);
//     } catch (e) {
//       // message.error(e?.message || "Erreur chargement");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     document.documentElement.setAttribute("dir", "ltr");
//     document.documentElement.classList.add("light");
//     document.documentElement.classList.remove("dark");
//     fetchUser();
//   }, [id]);

//   if (loading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
//   if (!user) return <div>Utilisateur non trouvé.</div>;

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Détails utilisateur</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//             { title: <Link to="/organisations/users">Utilisateurs</Link> },
//             { title: `${user.firstName || ""} ${user.lastName || ""}` },
//           ]}/>
//         </div>

//         <div className="md:flex md:justify-end justify-end items-center mb-6">
//           <Button type="primary" onClick={() => navigate(`/organisations/users/${user.id}/edit`)} icon={<EditFilled />}>Modifier</Button>
//         </div>

//         <Card>
//           <Descriptions title="Informations personnelles" bordered>
//             <Descriptions.Item label="Nom complet" span={2}>
//               <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
//               <span className="ml-3">{user.firstName || ""} {user.lastName || ""}</span>
//             </Descriptions.Item>
//             <Descriptions.Item label="Email">
//               <Link to={`mailto:${user.email}`}><MailOutlined /> {user.email}</Link>
//             </Descriptions.Item>
//             <Descriptions.Item label="Téléphone">
//               {user.phone ? <Link to={`tel:${user.phone}`}><PhoneOutlined /> {user.phone}</Link> : "N/A"}
//             </Descriptions.Item>
//             <Descriptions.Item label="Rôle"><Tag>{user.role}</Tag></Descriptions.Item>
//             <Descriptions.Item label="Statut"><Tag color={user.enabled ? "green" : "red"}>{user.enabled ? "Actif" : "Inactif"}</Tag></Descriptions.Item>
//             <Descriptions.Item label="Dernière MAJ">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Jamais"}</Descriptions.Item>
//             <Descriptions.Item label="Créé le">{new Date(user.createdAt).toLocaleString()}</Descriptions.Item>
//           </Descriptions>

//           <h3 className="text-lg font-semibold mb-4">Permissions</h3>
//           <Space wrap>
//             {user.permissions?.length ? user.permissions.map((p) => (
//               <Tag key={p.id} color={getPermissionColor(p.key)}>{getPermissionLabel(p.key)}</Tag>
//             )) : (<Tag color="gray">Aucune permission</Tag>)}
//           </Space>

//           {user.organization && (
//             <>
//               <div className="mt-4" />
//               <h3 className="text-lg font-semibold mb-4">Organisation</h3>
//               <Descriptions bordered>
//                 <Descriptions.Item label="Nom" span={2}>{user.organization.name}</Descriptions.Item>
//                 <Descriptions.Item label="Type">{user.organization.type}</Descriptions.Item>
//                 <Descriptions.Item label="Slug">{user.organization.slug}</Descriptions.Item>
//               </Descriptions>
//             </>
//           )}
//         </Card>
//       </div>
//     </div>
//   );
// }

/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Avatar, Tag, Space, Button, Spin } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, EditFilled } from "@ant-design/icons";
import userService from "@/services/userService";
import { getPermissionColor, getPermissionLabel } from "@/auth/permissions";
import { useTranslation } from "react-i18next";

export default function UserDetailInstitut() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await userService.getById(id);
      setUser(res.user);
    } catch (e) {
      // message.error(e?.message || t("userDetailInstitut.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fmtDateTime = (v) => {
    if (!v) return t("userDetailInstitut.common.never");
    try {
      const locale =
        i18n.language === "zh" ? "zh-CN" :
        i18n.language === "de" ? "de-DE" :
        i18n.language === "es" ? "es-ES" :
        i18n.language === "it" ? "it-IT" :
        i18n.language === "en" ? "en-US" : "fr-FR";
      return new Date(v).toLocaleString(locale);
    } catch {
      return String(v);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }
  if (!user) return <div>{t("userDetailInstitut.common.notFound")}</div>;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("userDetailInstitut.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("userDetailInstitut.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/organisations/users">{t("userDetailInstitut.breadcrumb.users")}</Link> },
              { title: `${user.firstName || ""} ${user.lastName || ""}` },
            ]}
          />
        </div>

        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button
            type="primary"
            onClick={() => navigate(`/organisations/users/${user.id}/edit`)}
            icon={<EditFilled />}
          >
            {t("userDetailInstitut.actions.edit")}
          </Button>
        </div>

        <Card>
          <Descriptions title={t("userDetailInstitut.sections.personal")} bordered>
            <Descriptions.Item label={t("userDetailInstitut.fields.fullName")} span={2}>
              <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
              <span className="ml-3">{user.firstName || ""} {user.lastName || ""}</span>
            </Descriptions.Item>

            <Descriptions.Item label={t("userDetailInstitut.fields.email")}>
              <Link to={`mailto:${user.email}`}>
                <MailOutlined /> {user.email}
              </Link>
            </Descriptions.Item>

            <Descriptions.Item label={t("userDetailInstitut.fields.phone")}>
              {user.phone ? (
                <Link to={`tel:${user.phone}`}>
                  <PhoneOutlined /> {user.phone}
                </Link>
              ) : t("userDetailInstitut.common.na")}
            </Descriptions.Item>

            <Descriptions.Item label={t("userDetailInstitut.fields.role")}>
              <Tag>{t(`usersInstitutList.filters.roles.${user.role}`, { defaultValue: user.role })}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("userDetailInstitut.fields.status")}>
              <Tag color={user.enabled ? "green" : "red"}>
                {user.enabled
                  ? t("usersInstitutList.filters.status.ACTIVE")
                  : t("usersInstitutList.filters.status.INACTIVE")}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label={t("userDetailInstitut.fields.updatedAt")}>
              {fmtDateTime(user.updatedAt)}
            </Descriptions.Item>
            <Descriptions.Item label={t("userDetailInstitut.fields.createdAt")}>
              {fmtDateTime(user.createdAt)}
            </Descriptions.Item>
          </Descriptions>

          <h3 className="text-lg font-semibold mb-4 mt-6">{t("userDetailInstitut.sections.permissions")}</h3>
          <Space wrap>
            {user.permissions?.length ? (
              user.permissions.map((p) => (
                <Tag key={p.id} color={getPermissionColor(p.key)}>
                  {getPermissionLabel(p.key, t)}
                </Tag>
              ))
            ) : (
              <Tag color="gray">{t("userDetailInstitut.permissions.none")}</Tag>
            )}
          </Space>

          {user.organization && (
            <>
              <div className="mt-4" />
              <h3 className="text-lg font-semibold mb-4">{t("userDetailInstitut.sections.organization")}</h3>
              <Descriptions bordered>
                <Descriptions.Item label={t("userDetailInstitut.org.name")} span={2}>
                  {user.organization.name}
                </Descriptions.Item>
                <Descriptions.Item label={t("userDetailInstitut.org.type")}>
                  {user.organization.type}
                </Descriptions.Item>
                <Descriptions.Item label={t("userDetailInstitut.org.slug")}>
                  {user.organization.slug}
                </Descriptions.Item>
              </Descriptions>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
