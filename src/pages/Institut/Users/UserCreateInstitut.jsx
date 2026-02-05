// /* eslint-disable no-unused-vars */
// "use client";

// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Form, Input, Button, Checkbox, Upload, message, Breadcrumb, Card, Avatar, Row, Col, Divider, Select } from "antd";
// import { UserOutlined, UploadOutlined, PlusCircleOutlined } from "@ant-design/icons";
// import { useAuth } from "../../../hooks/useAuth";
// import userService from "@/services/userService";
// import { getPermissionLabel, PERMS } from "@/auth/permissions";

// const { Option } = Select;

// /** Création user dans MON org (institut) + avatar + permissions (FormData) */
// export default function UserCreateInstitut() {
//   const { user: me } = useAuth();
//   const orgId = me?.organization?.id;
//   console.log(me)
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const [imageUrl, setImageUrl] = useState(null);
//   const navigate = useNavigate();

//   const permissionsOptions = Object.entries(PERMS).map(([_, value]) => ({
//     label: getPermissionLabel(value),
//     value,
//   }));

//   useEffect(() => {
//     document.documentElement.setAttribute("dir", "ltr");
//     document.documentElement.classList.add("light");
//     document.documentElement.classList.remove("dark");
//   }, []);

//   const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

//   const handleSubmit = async (values) => {
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("email", values.email);
//       fd.append("firstName", values.firstName);
//       fd.append("lastName", values.lastName);
//       fd.append("phone", values.phone || "");
//       fd.append("role", me.role);
//       fd.append("enabled", true);
//       fd.append("organizationId", orgId);            // <-- org cible
//       if (values.password) fd.append("password", values.password);
//       if (values.confirmPassword) fd.append("confirmPassword", values.confirmPassword);
//       if (values.upload?.[0]) fd.append("avatar", values.upload[0].originFileObj);
//       values.permissions?.forEach((p) => fd.append("permissions[]", p)); // backend accepte les keys

//       await userService.create(fd);
//       message.success("Utilisateur créé avec succès");
//       navigate("/organisations/users");
//     } catch (error) {
//       message.error(error?.message || "Erreur lors de l'envoi des données");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container-fluid relative px-3">
//       <div className="layout-specing">
//         <div className="md:flex justify-between items-center mb-6">
//           <h5 className="text-lg font-semibold">Nouvel utilisateur (mon institut)</h5>
//           <Breadcrumb items={[
//               { title: <Link to="/organisations/dashboard">Dashboard</Link> },
//               { title: <Link to="/organisations/users">Utilisateurs</Link> },
//               { title: "Nouveau" },
//           ]}/>
//         </div>

//         <Card title="Nouvel utilisateur" className="mt-4">
//           <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ enabled: true, role: "DEMANDEUR" }}>
//             <Row gutter={16}>
//               <Col span={6}>
//                 <Form.Item label="Photo de profil" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
//                   <Upload name="avatar" listType="picture-card" showUploadList={false} beforeUpload={() => false}
//                           onChange={({ file }) => setImageUrl(URL.createObjectURL(file))}>
//                     {imageUrl ? (
//                       <Avatar size={128} src={imageUrl} icon={<UserOutlined />} />
//                     ) : (
//                       <div><UploadOutlined /><div style={{ marginTop: 8 }}>Téléverser</div></div>
//                     )}
//                   </Upload>
//                 </Form.Item>
//               </Col>
//               <Col span={18}>
//                 <Form.Item name="firstName" label="Prénom" rules={[{ required: true, message: "Prénom obligatoire" }]}><Input /></Form.Item>
//                 <Form.Item name="lastName" label="Nom" rules={[{ required: true, message: "Nom obligatoire" }]}><Input /></Form.Item>
//                 <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email invalide" }]}><Input /></Form.Item>
//                 <Form.Item name="phone" label="Téléphone"><Input /></Form.Item>

//                 {/* <Form.Item name="role" label="Rôle" rules={[{ required: true }]}>
//                   <Select placeholder="Sélectionner un rôle">
//                     <Option value="DEMANDEUR">Demandeur</Option>
//                     <Option value="TRADUCTEUR">Traducteur</Option>
//                     <Option value="SUPERVISEUR">Superviseur</Option>
//                     <Option value="INSTITUT">Institution</Option>
//                   </Select>
//                 </Form.Item> */}

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

//                 <Divider>Mot de passe</Divider>
//                 <Form.Item name="password" label="Mot de passe" rules={[{ required: true, message: "Mot de passe obligatoire" }]}><Input.Password /></Form.Item>
//                 <Form.Item name="confirmPassword" label="Confirmer le mot de passe" dependencies={["password"]}
//                   rules={[
//                     { required: true, message: "Confirmer le mot de passe obligatoire" },
//                     ({ getFieldValue }) => ({ validator(_, v){ return !v || getFieldValue("password") === v ? Promise.resolve() : Promise.reject(new Error("Les mots de passe ne correspondent pas")); }}),
//                   ]}><Input.Password /></Form.Item>

//                 <Form.Item>
//                   <Button htmlType="submit" type="primary" loading={loading} icon={!loading && <PlusCircleOutlined className="mr-1 h-4 w-4" />}>
//                     {loading ? "Validation..." : "Valider"}
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

/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form, Input, Button, Checkbox, Upload, message,
  Breadcrumb, Card, Avatar, Row, Col, Divider, Select
} from "antd";
import { UserOutlined, UploadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import { usePermissions } from "../../../hooks/usePermissions";
import userService from "@/services/userService";
import { useTranslation } from "react-i18next";

const { Option } = Select;

export default function UserCreateInstitut() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const { permissions, getPermissionLabel, getPermissionsByRole, loading: permissionsLoading } = usePermissions();
  const orgId = me?.organization?.id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  // Rôle assigné au nouvel utilisateur (celui de l'org / connecté) → n'afficher que les permissions de ce rôle
  const roleForNewUser = me?.role || "INSTITUT";

  // Filtrer les permissions : uniquement celles du rôle qui sera assigné au nouvel utilisateur
  const filteredPermissions = useMemo(() => {
    if (!getPermissionsByRole || typeof getPermissionsByRole !== "function") {
      return [];
    }
    return getPermissionsByRole(roleForNewUser);
  }, [getPermissionsByRole, roleForNewUser]);

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
      fd.append("role", me.role);
      fd.append("enabled", true);
      fd.append("gender", values.gender || "");
      fd.append("country", values.country || "");
      fd.append("address", values.address || "");
      fd.append("organizationId", orgId);
      if (values.password) {
        fd.append("password", values.password);
      }
      if (values.confirmPassword) {
        fd.append("confirmPassword", values.confirmPassword);
      }
      if (values.upload?.[0]) {
        fd.append("avatar", values.upload[0].originFileObj);
      }
      values.permissions?.forEach((p) => {
        fd.append("permissions[]", p);
      });

      await userService.create(fd);
      message.success(t("userCreateInstitut.toasts.success"));
      navigate("/organisations/users");
    } catch (error) {
      console.error("Erreur lors de l'envoi des données:", error);
      message.error(error?.message || t("userCreateInstitut.toasts.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("userCreateInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("userCreateInstitut.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/users">{t("userCreateInstitut.breadcrumbs.users")}</Link> },
              { title: t("userCreateInstitut.breadcrumbs.new") },
            ]}
          />
        </div>

        <Card title={t("userCreateInstitut.cardTitle")} className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ enabled: true, role: "DEMANDEUR" }}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label={t("userCreateInstitut.photo.label")}
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
                      <Avatar size={128} src={imageUrl} icon={<UserOutlined />} />
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>{t("userCreateInstitut.photo.upload")}</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={18}>
                <Form.Item
                  name="firstName"
                  label={t("userCreateInstitut.fields.firstName")}
                  rules={[{ required: true, message: t("userCreateInstitut.validators.firstNameRequired") }]}
                >
                  <Input placeholder={t("userCreateInstitut.placeholders.firstName")} />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label={t("userCreateInstitut.fields.lastName")}
                  rules={[{ required: true, message: t("userCreateInstitut.validators.lastNameRequired") }]}
                >
                  <Input placeholder={t("userCreateInstitut.placeholders.lastName")} />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={t("userCreateInstitut.fields.email")}
                  rules={[
                    { required: true, message: t("userCreateInstitut.validators.emailRequired") },
                    { type: "email", message: t("userCreateInstitut.validators.emailInvalid") },
                  ]}
                >
                  <Input placeholder={t("userCreateInstitut.placeholders.email")} />
                </Form.Item>

                <Form.Item name="phone" label={t("userCreateInstitut.fields.phone")}>
                  <Input placeholder={t("userCreateInstitut.placeholders.phone")} />
                </Form.Item>
                <Form.Item name="address" label={t("userCreateInstitut.fields.address")}>
                  <Input placeholder={t("userCreateInstitut.placeholders.address")} />
                </Form.Item>


                <Form.Item name="country" label={t("userCreateInstitut.fields.country")}>
                  <Input placeholder={t("userCreateInstitut.placeholders.country")} />
                </Form.Item>

                <Form.Item
                  name="gender"
                  label={t("userCreateInstitut.fields.gender")}
                  rules={[{ required: true, message: t("userCreateInstitut.validators.gender") }]}
                >
                  <Select
                    placeholder={t("userCreateInstitut.placeholders.gender")}
                  >
                    <Option value="MALE">{t("userCreateInstitut.roles.MALE")}</Option>
                    <Option value="FEMALE">{t("userCreateInstitut.roles.FEMALE")}</Option>
                    <Option value="OTHER">{t("userCreateInstitut.roles.OTHER")}</Option>
                  </Select>
                </Form.Item>

                <Divider>{t("userCreateInstitut.dividers.permissions")}</Divider>
                <Form.Item name="permissions" label={t("userCreateInstitut.fields.permissions")}>
                  {permissionsLoading ? (
                    <div>{t("userCreateInstitut.loadingPermissions")}</div>
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

                <Divider>{t("userCreateInstitut.dividers.password")}</Divider>

                <Form.Item
                  name="password"
                  label={t("userCreateInstitut.fields.password")}
                  rules={[{ required: true, message: t("userCreateInstitut.validators.passwordRequired") }]}
                >
                  <Input.Password placeholder={t("userCreateInstitut.fields.password")} />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label={t("userCreateInstitut.fields.confirmPassword")}
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: t("userCreateInstitut.validators.confirmRequired") },
                    ({ getFieldValue }) => ({
                      validator(_, v) {
                        return !v || getFieldValue("password") === v
                          ? Promise.resolve()
                          : Promise.reject(new Error(t("userCreateInstitut.validators.confirmMismatch")));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder={t("userCreateInstitut.fields.confirmPassword")} />
                </Form.Item>

                <Form.Item>
                  <Button
                    htmlType="submit"
                    type="primary"
                    loading={loading}
                    icon={!loading && <PlusCircleOutlined className="mr-1 h-4 w-4" />}
                  >
                    {loading ? t("userCreateInstitut.buttons.submitting") : t("userCreateInstitut.buttons.submit")}
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
