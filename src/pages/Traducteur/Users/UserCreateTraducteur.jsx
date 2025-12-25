


/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, Upload, message, Breadcrumb, Card, Avatar, Row, Col, Divider, Select } from "antd";
import { UserOutlined, UploadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useTranslation } from "react-i18next";
import userService from "@/services/userService";
import countries from "@/assets/countries.json"


const { Option } = Select;

/** Création user dans MON org (traducteur) + avatar + permissions (FormData) */
export default function UserCreateTraducteur() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const { permissions, getPermissionLabel, getPermissionsByRole, loading: permissionsLoading } = usePermissions();
  const orgId = me?.organization?.id;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  // Rôle de l'utilisateur connecté (pour Traducteur)
  const userRole = me?.role || "TRADUCTEUR";

  // Filtrer les permissions selon le rôle de l'utilisateur connecté
  const filteredPermissions = useMemo(() => {
    if (!getPermissionsByRole || typeof getPermissionsByRole !== "function") {
      return permissions;
    }
    return getPermissionsByRole(userRole);
  }, [getPermissionsByRole, userRole, permissions]);

  // Utiliser les permissions du backend filtrées par rôle
  const permissionsOptions = useMemo(() => {
    return filteredPermissions.map((perm) => ({
      label: getPermissionLabel(perm.key) || perm.name || perm.key,
      value: perm.key,
    }));
  }, [filteredPermissions, getPermissionLabel]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
  }, []);

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", values.email);
      fd.append("firstName", values.firstName);
      fd.append("lastName", values.lastName);
      fd.append("phone", values.phone || "");
      fd.append("role", me.role);
      fd.append("enabled", true);
      fd.append("country", values.country || "");

      fd.append("organizationId", orgId);            // <-- org cible
      if (values.password) fd.append("password", values.password);
      if (values.confirmPassword) fd.append("confirmPassword", values.confirmPassword);
      if (values.upload?.[0]) fd.append("avatar", values.upload[0].originFileObj);
      values.permissions?.forEach((p) => fd.append("permissions[]", p)); // backend accepte les keys

      await userService.create(fd);
      message.success(t("userCreateTraducteur.toasts.success"));
      navigate("/traducteur/users");
    } catch (error) {
      message.error(error?.message || t("userCreateTraducteur.toasts.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("userCreateTraducteur.pageTitle")}</h5>
          <Breadcrumb items={[
            { title: <Link to="/traducteur/dashboard">{t("userCreateTraducteur.breadcrumbs.dashboard")}</Link> },
            { title: <Link to="/traducteur/users">{t("userCreateTraducteur.breadcrumbs.users")}</Link> },
            { title: t("userCreateTraducteur.breadcrumbs.new") },
          ]} />
        </div>

        <Card title={t("userCreateTraducteur.cardTitle")} className="mt-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ enabled: true, role: "DEMANDEUR" }}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label={t("userCreateTraducteur.photo.label")} name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
                  <Upload name="avatar" listType="picture-card" showUploadList={false} beforeUpload={() => false}
                    onChange={({ file }) => {
                      if (file?.originFileObj) {
                        setImageUrl(URL.createObjectURL(file.originFileObj));
                      } else if (file) {
                        setImageUrl(URL.createObjectURL(file));
                      }
                    }}>
                    {imageUrl ? (
                      <Avatar size={128} src={imageUrl} icon={<UserOutlined />} />
                    ) : (
                      <div><UploadOutlined /><div style={{ marginTop: 8 }}>{t("userCreateTraducteur.photo.upload")}</div></div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item name="firstName" label={t("userCreateTraducteur.fields.firstName")} rules={[{ required: true, message: t("userCreateTraducteur.validators.firstNameRequired") }]}>
                  <Input placeholder={t("userCreateTraducteur.placeholders.firstName")} />
                </Form.Item>
                <Form.Item name="lastName" label={t("userCreateTraducteur.fields.lastName")} rules={[{ required: true, message: t("userCreateTraducteur.validators.lastNameRequired") }]}>
                  <Input placeholder={t("userCreateTraducteur.placeholders.lastName")} />
                </Form.Item>
                <Form.Item name="email" label={t("userCreateTraducteur.fields.email")} rules={[
                  { required: true, message: t("userCreateTraducteur.validators.emailRequired") },
                  { type: "email", message: t("userCreateTraducteur.validators.emailInvalid") },
                ]}>
                  <Input placeholder={t("userCreateTraducteur.placeholders.email")} />
                </Form.Item>
                <Form.Item name="phone" label={t("userCreateTraducteur.fields.phone")}>
                  <Input placeholder={t("userCreateTraducteur.placeholders.phone")} />
                </Form.Item>

                <Form.Item
                  label={t("userCreateTraducteur.fields.country")}
                  name="country"
                >
                  <Select
                    allowClear
                    showSearch
                    size="large"
                    placeholder={t("userCreateTraducteur.placeholders.country")}
                    options={(countries || []).map((f) => ({ value: f.name, label: f.name }))}
                  />
                </Form.Item>

                <Divider>{t("userCreateTraducteur.dividers.permissions")}</Divider>
                <Form.Item name="permissions" label={t("userCreateTraducteur.fields.permissions")}>
                  {permissionsLoading ? (
                    <div>{t("userCreateTraducteur.loadingPermissions")}</div>
                  ) : (
                    <Checkbox.Group>
                      <Row gutter={[0, 16]}>
                        {permissionsOptions.map((opt) => (
                          <Col span={8} key={opt.value}>
                            <Checkbox value={opt.value}>{opt.label}</Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  )}
                </Form.Item>

                <Divider>{t("userCreateTraducteur.dividers.password")}</Divider>
                <Form.Item name="password" label={t("userCreateTraducteur.fields.password")} rules={[{ required: true, message: t("userCreateTraducteur.validators.passwordRequired") }]}>
                  <Input.Password placeholder={t("userCreateTraducteur.fields.password")} />
                </Form.Item>
                <Form.Item name="confirmPassword" label={t("userCreateTraducteur.fields.confirmPassword")} dependencies={["password"]}
                  rules={[
                    { required: true, message: t("userCreateTraducteur.validators.confirmRequired") },
                    ({ getFieldValue }) => ({
                      validator(_, v) {
                        return !v || getFieldValue("password") === v
                          ? Promise.resolve()
                          : Promise.reject(new Error(t("userCreateTraducteur.validators.confirmMismatch")));
                      },
                    }),
                  ]}>
                  <Input.Password placeholder={t("userCreateTraducteur.fields.confirmPassword")} />
                </Form.Item>

                <Form.Item>
                  <Button htmlType="submit" type="primary" loading={loading} icon={!loading && <PlusCircleOutlined className="mr-1 h-4 w-4" />}>
                    {loading ? t("userCreateTraducteur.buttons.submitting") : t("userCreateTraducteur.buttons.submit")}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
}
