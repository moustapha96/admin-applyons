/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Avatar, Tag, Space, Button, Spin } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, EditFilled } from "@ant-design/icons";
import userService from "@/services/userService";
import { getPermissionColor, getPermissionLabel } from "@/auth/permissions";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "@/utils/imageUtils";

export default function UserDetailTraducteur() {
  const { t } = useTranslation();
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
      // message.error(e?.message || "Erreur chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchUser();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;
  if (!user) return <div>Utilisateur non trouvé.</div>;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Détails utilisateur</h5>
          <Breadcrumb items={[
            { title: <Link to="/traducteur/dashboard">Tableau de bord</Link> },
            { title: <Link to="/traducteur/users">Utilisateurs</Link> },
            { title: `${user.firstName || ""} ${user.lastName || ""}` },
          ]}/>
        </div>

        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button type="primary" onClick={() => navigate(`/traducteur/users/${user.id}/edit`)} icon={<EditFilled />}>Modifier</Button>
        </div>

        <Card>
          <Descriptions title="Informations personnelles" bordered>
            <Descriptions.Item label="Nom complet" span={2}>
              <Avatar size="large" icon={<UserOutlined />} src={user.avatar ? buildImageUrl(user.avatar) : undefined} />
              <span className="ml-3">{user.firstName || ""} {user.lastName || ""}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Link to={`mailto:${user.email}`}><MailOutlined /> {user.email}</Link>
            </Descriptions.Item>
            <Descriptions.Item label="Téléphone">
              {user.phone ? <Link to={`tel:${user.phone}`}><PhoneOutlined /> {user.phone}</Link> : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Statut"><Tag color={user.enabled ? "green" : "red"}>{user.enabled ? "Actif" : "Inactif"}</Tag></Descriptions.Item>
            <Descriptions.Item label="Dernière MAJ">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "Jamais"}</Descriptions.Item>
            <Descriptions.Item label="Créé le">{new Date(user.createdAt).toLocaleString()}</Descriptions.Item>
          </Descriptions>

          <h3 className="text-lg font-semibold mb-4">Permissions</h3>
          <Space wrap>
            {user.permissions?.length ? user.permissions.map((p) => (
              <Tag key={p.id} color={getPermissionColor(p.key)}>{getPermissionLabel(p.key, t)}</Tag>
            )) : (<Tag color="gray">Aucune permission</Tag>)}
          </Space>

         
        </Card>
      </div>
    </div>
  );
}
