/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Typography, Button, message, Spin } from "antd";
import userService from "@/services/userService";
import PermissionSelector from "@/components/permissions/PermissionSelector";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

/** Édite les permissions d’un user via PATCH /users/:id/permissions */
export default function EditUserPermissions() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [perms, setPerms] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.getById(id); // GET /users/:id renvoie permissions[] :contentReference[oaicite:16]{index=16} :contentReference[oaicite:17]{index=17}
      const u = res.data?.user;
      setUser(u);
      setPerms((u?.permissions || []).map(p => p.key));
    } catch (e) {
      message.error(e?.message || t("institutUsers.editPermissions.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const save = async () => {
    try {
      setSaving(true);
      await userService.updatePermissions(id, perms); // PATCH /users/:id/permissions :contentReference[oaicite:18]{index=18} :contentReference[oaicite:19]{index=19}
      message.success(t("institutUsers.editPermissions.messages.updateSuccess"));
      navigate("/organisations/users");
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("institutUsers.editPermissions.messages.updateError"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <div className="p-2 md:p-4">
      <Title level={3}>{t("institutUsers.editPermissions.title")}</Title>
      <Paragraph type="secondary">{user?.email}</Paragraph>

      <Card>
        <PermissionSelector value={perms} onChange={setPerms} />
        <div style={{ marginTop: 16 }}>
          <Button type="primary" loading={saving} onClick={save}>{t("institutUsers.editPermissions.buttons.save")}</Button>
          <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>{t("institutUsers.editPermissions.buttons.cancel")}</Button>
        </div>
      </Card>
    </div>
  );
}
