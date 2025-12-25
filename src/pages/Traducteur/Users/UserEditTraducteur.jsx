/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Checkbox, Upload, Breadcrumb, Card, Avatar, Row, Col, Divider, Select, Spin, message } from "antd";
import { UserOutlined, UploadOutlined, SaveFilled, ArrowLeftOutlined } from "@ant-design/icons";
import userService from "@/services/userService";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "../../../utils/imageUtils";
import countries from "@/assets/countries.json"

const { Option } = Select;

/** Édition d'un user traducteur (avatar + perms via FormData) */
export default function UserEditTraducteur() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user: me } = useAuth();
  const { permissions, getPermissionLabel, getPermissionsByRole, loading: permissionsLoading } = usePermissions();
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.getById(id);
      const u = res.user;
      setUser(u);
      form.setFieldsValue({
        firstName: u.firstName || "",
        lastName: u.lastName || "",
        email: u.email,
        phone: u.phone || "",
        role: me.role,
        enabled: !!u.enabled,
        country: u.country || "",
        permissions: u.permissions?.map((p) => p.key) || [],
      });
      if (u.avatar) setImageUrl(u.avatar);
    } catch (e) {
      message.error(t("userEditTraducteur.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  };

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
      fd.append("enabled", values.enabled);
      fd.append("country", values.country || "");
      if (values.upload?.[0]) fd.append("avatar", values.upload[0].originFileObj);
      values.permissions?.forEach((p) => {
        fd.append("permissions[]", p);
      });
      await userService.update(id, fd);
      message.success(t("userEditTraducteur.toasts.updated"));
      navigate("/traducteur/users");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || t("userEditTraducteur.toasts.updateError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("userEditTraducteur.title")}</h5>
          <Breadcrumb items={[
            { title: <Link to="/traducteur/dashboard">{t("userEditTraducteur.breadcrumb.dashboard")}</Link> },
            { title: <Link to="/traducteur/users">{t("userEditTraducteur.breadcrumb.users")}</Link> },
            { title: t("userEditTraducteur.breadcrumb.edit") },
          ]} />
        </div>

        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("userEditTraducteur.actions.back")}
          </Button>
        </div>

        <Card title={t("userEditTraducteur.cardTitle")} className="mt-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label={t("userEditTraducteur.fields.avatar")} name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
                  <Upload name="avatar" listType="picture-card" showUploadList={false} beforeUpload={() => false}
                    onChange={({ file }) => {
                      if (file?.originFileObj) {
                        setImageUrl(URL.createObjectURL(file.originFileObj));
                      } else if (file) {
                        setImageUrl(URL.createObjectURL(file));
                      }
                    }}>
                    {imageUrl ? (
                      <Avatar size={128} src={imageUrl ? buildImageUrl(imageUrl) : user?.avatar ? buildImageUrl(user?.avatar) : undefined} icon={<UserOutlined />} />
                    ) : (
                      <div><UploadOutlined /><div style={{ marginTop: 8 }}>{t("userEditTraducteur.actions.upload")}</div></div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item name="firstName" label={t("userEditTraducteur.fields.firstName")} rules={[{ required: true, message: t("userEditTraducteur.validations.firstName") }]}>
                  <Input placeholder={t("userEditTraducteur.placeholders.firstName")} />
                </Form.Item>
                <Form.Item name="lastName" label={t("userEditTraducteur.fields.lastName")} rules={[{ required: true, message: t("userEditTraducteur.validations.lastName") }]}>
                  <Input placeholder={t("userEditTraducteur.placeholders.lastName")} />
                </Form.Item>
                <Form.Item name="email" label={t("userEditTraducteur.fields.email")} rules={[{ required: true, type: "email", message: t("userEditTraducteur.validations.email") }]}>
                  <Input disabled placeholder={t("userEditTraducteur.placeholders.email")} />
                </Form.Item>
                <Form.Item name="phone" label={t("userEditTraducteur.fields.phone")}>
                  <Input placeholder={t("userEditTraducteur.placeholders.phone")} />
                </Form.Item>

                <Form.Item
                  label={t("userEditTraducteur.fields.country")}
                  name="country"
                >
                  <Select
                    allowClear
                    showSearch
                    size="large"
                    placeholder={t("userEditTraducteur.placeholders.country")}
                    options={(countries || []).map((f) => ({ value: f.name, label: f.name }))}
                  />
                </Form.Item>

                <Form.Item name="enabled" label={t("userEditTraducteur.fields.status")} valuePropName="checked">
                  <Checkbox>{t("userEditTraducteur.labels.active")}</Checkbox>
                </Form.Item>

                <Divider>{t("userEditTraducteur.sections.permissions")}</Divider>
                <Form.Item name="permissions" label={t("userEditTraducteur.fields.permissions")}>
                  {permissionsLoading ? (
                    <div>{t("userEditTraducteur.loadingPermissions")}</div>
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

                <Form.Item>
                  <Button htmlType="submit" type="primary" loading={loading} icon={!loading && <SaveFilled className="mr-1 h-4 w-4" />}>
                    {loading ? t("userEditTraducteur.actions.saving") : t("userEditTraducteur.actions.save")}
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
