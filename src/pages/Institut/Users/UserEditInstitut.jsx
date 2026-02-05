// /* eslint-disable react/no-unescaped-entities */
// /* eslint-disable no-unused-vars */
// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { Form, Input, Button, Checkbox, Upload, Breadcrumb, Card, Avatar, Row, Col, Divider, Select, Spin } from "antd";
// import { UserOutlined, UploadOutlined, SaveFilled, ArrowLeftOutlined } from "@ant-design/icons";
// import userService from "@/services/userService";
// import { getPermissionLabel, PERMS } from "@/auth/permissions";
// import { useAuth } from "../../../hooks/useAuth";

// const { Option } = Select;

// /** Édition d’un user de l’institut (avatar + perms via FormData) */
// export default function UserEditInstitut() {
//   const { id } = useParams();
//   const { user: me } = useAuth();
//   const [form] = Form.useForm();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [imageUrl, setImageUrl] = useState(null);
//   const navigate = useNavigate();

//   const permissionsOptions = Object.entries(PERMS).map(([_, value]) => ({ label: getPermissionLabel(value), value }));

//   useEffect(() => {
//     document.documentElement.setAttribute("dir", "ltr");
//     document.documentElement.classList.add("light");
//     document.documentElement.classList.remove("dark");
//     load();
//   }, [id]);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await userService.getById(id);
//       const u = res.user;
//       setUser(u);
//       form.setFieldsValue({
//         firstName: u.firstName || "",
//         lastName: u.lastName || "",
//         email: u.email,
//         phone: u.phone || "",
//         role:  me.role || "INSTITUT",
//         enabled: !!u.enabled,
//         country: u.country || "",
//         permissions: u.permissions?.map((p) => p.key) || [],
//       });
//       if (u.avatar) setImageUrl(u.avatar);
//     } finally { setLoading(false); }
//   };

//   const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

//   const handleSubmit = async (values) => {
//     setLoading(true);
//     console.log(values)
//     try {
//       const fd = new FormData();
//       fd.append("email", values.email);
//       fd.append("firstName", values.firstName);
//       fd.append("lastName", values.lastName);
//       fd.append("phone", values.phone || "");
//       fd.append("role", values.role || "INSTITUT");
//       fd.append("enabled", values.enabled);
//       fd.append("country", values.country || "");
//       if (values.upload?.[0]) fd.append("avatar", values.upload[0].originFileObj);
//       values.permissions?.forEach((p) => fd.append("permissions[]", p));
//       await userService.update(id, fd);
//       navigate("/organisations/users");
//     } finally { setLoading(false); }
//   };

//   if (loading && !user) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Modifier l'utilisateur</h5>
//           <Breadcrumb items={[
//             { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//             { title: <Link to="/organisations/users">Utilisateurs</Link> },
//             { title: "Modifier" },
//           ]}/>
//         </div>

//         <div className="md:flex md:justify-end justify-end items-center mb-6">
//           <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Retour</Button>
//         </div>

//         <Card title="Modifier l'utilisateur" className="mt-4">
//           <Form form={form} layout="vertical" onFinish={handleSubmit}>
//             <Row gutter={16}>
//               <Col span={6}>
//                 <Form.Item label="Photo de profil" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
//                   <Upload name="avatar" listType="picture-card" showUploadList={false} beforeUpload={() => false}
//                           onChange={({ file }) => setImageUrl(URL.createObjectURL(file))}>
//                     {imageUrl ? <Avatar size={128} src={imageUrl} icon={<UserOutlined />} /> : (
//                       <div><UploadOutlined /><div style={{ marginTop: 8 }}>Téléverser</div></div>
//                     )}
//                   </Upload>
//                 </Form.Item>
//               </Col>
//               <Col span={18}>
//                 <Form.Item name="firstName" label="Prénom" rules={[{ required: true }]}><Input /></Form.Item>
//                 <Form.Item name="lastName" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
//                 <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input disabled /></Form.Item>
//                 <Form.Item name="phone" label="Téléphone"><Input /></Form.Item>
//                 <Form.Item name="country" label="Pays de résidence"><Input /></Form.Item>

//                 {/* <Form.Item  hiden name="role" label="Rôle" rules={[{ required: true }]}>
//                   <Select placeholder="Sélectionner un rôle">
//                     <Option value="DEMANDEUR">Demandeur</Option>
//                     <Option value="TRADUCTEUR">Traducteur</Option>
//                     <Option value="SUPERVISEUR">Superviseur</Option>
//                     <Option value="INSTITUT">Institution</Option>
//                     <Option value="ADMIN">Admin</Option>
//                   </Select>
//                 </Form.Item> */}

//                 <Form.Item name="enabled" label="Statut" valuePropName="checked">
//                   <Checkbox>Actif</Checkbox>
//                 </Form.Item>

//                 <Divider>Permissions</Divider>
//                 <Form.Item name="permissions" label="Permissions">
//                   <Checkbox.Group>
//                     <Row gutter={[0, 16]}>
//                       {permissionsOptions.map((opt) => (
//                         <Col span={8} key={opt.value}><Checkbox value={opt.value}>{opt.label}</Checkbox></Col>
//                       ))}
//                     </Row>
//                   </Checkbox.Group>
//                 </Form.Item>

//                 <Form.Item>
//                   <Button htmlType="submit" type="primary" loading={loading} icon={!loading && <SaveFilled className="mr-1 h-4 w-4" />}>
//                     {loading ? "Enregistrement..." : "Enregistrer"}
//                   </Button>
//                 </Form.Item>
//               </Col>
//             </Row>
//           </Form>
//         </Card>
//       </div>
//     </div>
//   );
// }
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Upload,
  Breadcrumb,
  Card,
  Avatar,
  Row,
  Col,
  Divider,
  Select,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  SaveFilled,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import userService from "@/services/userService";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "../../../utils/imageUtils";

const { Option } = Select;

/** Édition d’un user de l’institut (avatar + perms via FormData) */
export default function UserEditInstitut() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user: me } = useAuth();
  const { permissions, getPermissionLabel, getPermissionsByRole, loading: permissionsLoading } = usePermissions();
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  // Rôle de l'utilisateur en cours d'édition (pour n'afficher que les permissions de son rôle)
  const selectedRole = Form.useWatch("role", form);
  const roleForPermissions = selectedRole || user?.role || "INSTITUT";

  // Filtrer les permissions : uniquement celles du rôle de l'utilisateur édité
  const filteredPermissions = useMemo(() => {
    if (!getPermissionsByRole || typeof getPermissionsByRole !== "function") {
      return [];
    }
    return getPermissionsByRole(roleForPermissions);
  }, [getPermissionsByRole, roleForPermissions]);

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
        role: u.role || "INSTITUT",
        enabled: !!u.enabled,
        country: u.country || "",
        gender: u.gender || "",
        address: u.address || "",
        permissions: u.permissions?.map((p) => p.key) || [],
      });
      if (u.avatar) setImageUrl(u.avatar);
    } catch (e) {
      message.error(t("userEditInstitut.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", values.email);
      fd.append("firstName", values.firstName);
      fd.append("lastName", values.lastName);
      fd.append("phone", values.phone || "");
      fd.append("role", values.role ?? user?.role ?? "INSTITUT");
      fd.append("enabled", String(!!values.enabled));
      fd.append("gender", values.gender || "");
      fd.append("address", values.address || "");
      fd.append("country", values.country || "");
      if (values.upload?.[0]) {
        fd.append("avatar", values.upload[0].originFileObj);
      }
      values.permissions?.forEach((p) => {
        fd.append("permissions[]", p);
      });

      await userService.update(id, fd);
      message.success(t("userEditInstitut.toasts.updated"));
      navigate("/organisations/users");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || t("userEditInstitut.toasts.updateError"));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("userEditInstitut.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("userEditInstitut.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/organisations/users">{t("userEditInstitut.breadcrumb.users")}</Link> },
              { title: t("userEditInstitut.breadcrumb.edit") },
            ]}
          />
        </div>

        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("userEditInstitut.actions.back")}
          </Button>
        </div>

        <Card title={t("userEditInstitut.cardTitle")} className="mt-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={t("userEditInstitut.fields.avatar")}
                  name="upload"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                >
                  <Upload
                    name="avatar"
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={({ file }) => {
                      if (file?.originFileObj) {
                        setImageUrl(URL.createObjectURL(file.originFileObj));
                      } else if (file) {
                        setImageUrl(URL.createObjectURL(file));
                      }
                    }}
                  >
                    {imageUrl ? (
                      <Avatar size={128} src={imageUrl ? buildImageUrl( imageUrl) : user?.avatar ? buildImageUrl(user?.avatar) : undefined} icon={<UserOutlined />} />

                      
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>{t("userEditInstitut.actions.upload")}</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={18}>
                <Form.Item
                  name="firstName"
                  label={t("userEditInstitut.fields.firstName")}
                  rules={[{ required: true, message: t("userEditInstitut.validations.firstName") }]}
                >
                  <Input placeholder={t("userEditInstitut.placeholders.firstName")} />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label={t("userEditInstitut.fields.lastName")}
                  rules={[{ required: true, message: t("userEditInstitut.validations.lastName") }]}
                >
                  <Input placeholder={t("userEditInstitut.placeholders.lastName")} />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={t("userEditInstitut.fields.email")}
                  rules={[{ required: true, type: "email", message: t("userEditInstitut.validations.email") }]}
                >
                  <Input disabled placeholder={t("userEditInstitut.placeholders.email")} />
                </Form.Item>

                <Form.Item name="phone" label={t("userEditInstitut.fields.phone")}>
                  <Input placeholder={t("userEditInstitut.placeholders.phone")} />
                </Form.Item>

                <Form.Item name="address" label={t("userEditInstitut.fields.address")}>
                  <Input placeholder={t("userEditInstitut.placeholders.address")} />
                </Form.Item>

                <Form.Item name="country" label={t("userEditInstitut.fields.country")}>
                  <Input placeholder={t("userEditInstitut.placeholders.country")} />
                </Form.Item>

               
                <Form.Item
                  name="gender"
                  label={t("userEditInstitut.fields.gender")}
                  rules={[{ required: true, message: t("userEditInstitut.validators.gender") }]}
                >
                  <Select placeholder={t("userEditInstitut.placeholders.gender")}>
                    <Option value="MALE">{t("userEditInstitut.roles.MALE")}</Option>
                    <Option value="FEMALE">{t("userEditInstitut.roles.FEMALE")}</Option>
                    <Option value="OTHER">{t("userEditInstitut.roles.OTHER")}</Option>
                  </Select>
                </Form.Item>


                {/* Rôle (si tu veux réactiver, garde les clés i18n) */}
                {/* <Form.Item name="role" label={t("userEditInstitut.fields.role")} rules={[{ required: true }]}>
                  <Select placeholder={t("userEditInstitut.placeholders.role")}>
                    <Option value="DEMANDEUR">{t("usersInstitutList.filters.roles.DEMANDEUR")}</Option>
                    <Option value="TRADUCTEUR">{t("usersInstitutList.filters.roles.TRADUCTEUR")}</Option>
                    <Option value="SUPERVISEUR">{t("usersInstitutList.filters.roles.SUPERVISEUR")}</Option>
                    <Option value="INSTITUT">{t("usersInstitutList.filters.roles.INSTITUT")}</Option>
                    <Option value="ADMIN">Admin</Option>
                  </Select>
                </Form.Item> */}

                <Form.Item name="enabled" label={t("userEditInstitut.fields.status")} valuePropName="checked">
                  <Checkbox>{t("userEditInstitut.labels.active")}</Checkbox>
                </Form.Item>

                <Form.Item name="role" hidden>
                  <Input type="hidden" />
                </Form.Item>

                <Divider>{t("userEditInstitut.sections.permissions")}</Divider>
                <Form.Item name="permissions" label={t("userEditInstitut.fields.permissions")}>
                  {permissionsLoading ? (
                    <div>{t("userEditInstitut.loadingPermissions")}</div>
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
                  <Button
                    htmlType="submit"
                    type="primary"
                    loading={loading}
                    icon={!loading && <SaveFilled className="mr-1 h-4 w-4" />}
                  >
                    {loading ? t("userEditInstitut.actions.saving") : t("userEditInstitut.actions.save")}
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
