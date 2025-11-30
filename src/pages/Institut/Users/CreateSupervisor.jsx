/* eslint-disable no-unused-vars */
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message, Divider } from "antd";
import { useAuth } from "../../../hooks/useAuth";
import userService from "@/services/userService";
import PermissionSelector from "@/components/permissions/PermissionSelector";
import { useTranslation } from "react-i18next";

const { Title, Paragraph } = Typography;

/** Crée un user avec role SUPERVISEUR + permissions choisies.
 * - POST /users avec organizationId, role, permissions[]
 * - Le contrôleur crée le user et connecte les permissions (existantes) — sinon il upsert lors d’un update. :contentReference[oaicite:12]{index=12} :contentReference[oaicite:13]{index=13}
 */
export default function CreateSupervisor() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const orgId = me?.organization?.id;
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [perms, setPerms] = useState([
    "demandes.read",
    "documents.read",
    "dashboard.read",
  ]);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      const res = await userService.create({
        email: v.email,
        password: v.password || undefined,
        role: "SUPERVISEUR",
        enabled: true,
        organizationId: orgId,
        permissions: perms, // accepté par POST /users selon routes + controller :contentReference[oaicite:14]{index=14} :contentReference[oaicite:15]{index=15}
        firstName: v.firstName || undefined,
        lastName: v.lastName || undefined,
      });
      message.success(t("institutUsers.createSupervisor.messages.success"));
      navigate("/organisations/users");
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("institutUsers.createSupervisor.messages.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 md:p-4">
      <Title level={3}>{t("institutUsers.createSupervisor.title")}</Title>
      <Paragraph type="secondary">{t("institutUsers.createSupervisor.subtitle")} <code>{orgId}</code></Paragraph>

      <Card>
        <Form form={form} layout="vertical">
          <Form.Item label={t("institutUsers.createSupervisor.labels.email")} name="email" rules={[{ required: true, type: "email" }]}><Input /></Form.Item>
          <Form.Item label={t("institutUsers.createSupervisor.labels.password")} name="password"><Input.Password /></Form.Item>
          <Form.Item label={t("institutUsers.createSupervisor.labels.firstName")} name="firstName"><Input /></Form.Item>
          <Form.Item label={t("institutUsers.createSupervisor.labels.lastName")} name="lastName"><Input /></Form.Item>

          <Divider />
          <Title level={5}>{t("institutUsers.createSupervisor.labels.permissions")}</Title>
          <PermissionSelector value={perms} onChange={setPerms} />

          <div style={{ marginTop: 16 }}>
            <Button type="primary" loading={loading} onClick={onSubmit}>{t("institutUsers.createSupervisor.buttons.create")}</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => form.resetFields()}>{t("institutUsers.createSupervisor.buttons.reset")}</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
