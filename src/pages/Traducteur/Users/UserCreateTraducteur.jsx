


/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, Upload, message, Breadcrumb, Card, Avatar, Row, Col, Divider, Select } from "antd";
import { UserOutlined, UploadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useAuth } from "../../../hooks/useAuth";
import userService from "@/services/userService";
import { getPermissionLabel, PERMS_TRADUCTEUR } from "@/auth/permissions";
import countries from "@/assets/countries.json"


const { Option } = Select;

/** Création user dans MON org (institut) + avatar + permissions (FormData) */
export default function UserCreateTraducteur() {
  const { user: me } = useAuth();
  const orgId = me?.organization?.id;
  console.log(me)
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const permissionsOptions = Object.entries(PERMS_TRADUCTEUR).map(([_, value]) => ({
    label: getPermissionLabel(value, t),
    value,
  }));

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
      message.success("Utilisateur créé avec succès");
      navigate("/traducteur/users");
    } catch (error) {
      message.error(error?.message || "Erreur lors de l'envoi des données");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Nouvel utilisateur (mon institut)</h5>
          <Breadcrumb items={[
            { title: <Link to="/traducteur/dashboard">Tableau de bord</Link> },
            { title: <Link to="/traducteur/users">Utilisateurs</Link> },
            { title: "Nouveau" },
          ]} />
        </div>

        <Card title="Nouvel utilisateur" className="mt-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ enabled: true, role: "DEMANDEUR" }}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Photo de profil" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
                  <Upload name="avatar" listType="picture-card" showUploadList={false} beforeUpload={() => false}
                    onChange={({ file }) => setImageUrl(URL.createObjectURL(file))}>
                    {imageUrl ? (
                      <Avatar size={128} src={imageUrl} icon={<UserOutlined />} />
                    ) : (
                      <div><UploadOutlined /><div style={{ marginTop: 8 }}>Téléverser</div></div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item name="firstName" label="Prénom" rules={[{ required: true, message: "Prénom obligatoire" }]}><Input /></Form.Item>
                <Form.Item name="lastName" label="Nom" rules={[{ required: true, message: "Nom obligatoire" }]}><Input /></Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email invalide" }]}><Input /></Form.Item>
                <Form.Item name="phone" label="Téléphone"><Input /></Form.Item>


                <Form.Item
                  label="Pays de résidence"
                  name="country"
                >
                  <Select
                    allowClear
                    showSearch
                    size="large"
                    placeholder="Select country"
                    options={(countries || []).map((f) => ({ value: f.name, label: f.name }))}
                  />
                </Form.Item>


                <Divider>Permissions</Divider>
                <Form.Item name="permissions" label="Permissions">
                  <Checkbox.Group>
                    <Row gutter={[0, 16]}>
                      {permissionsOptions.map((opt) => (
                        <Col span={8} key={opt.value}><Checkbox value={opt.value}>{opt.label}</Checkbox></Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>

                <Divider>Mot de passe</Divider>
                <Form.Item name="password" label="Mot de passe" rules={[{ required: true, message: "Mot de passe obligatoire" }]}><Input.Password /></Form.Item>
                <Form.Item name="confirmPassword" label="Confirmer le mot de passe" dependencies={["password"]}
                  rules={[
                    { required: true, message: "Confirmer le mot de passe obligatoire" },
                    ({ getFieldValue }) => ({ validator(_, v) { return !v || getFieldValue("password") === v ? Promise.resolve() : Promise.reject(new Error("Les mots de passe ne correspondent pas")); } }),
                  ]}><Input.Password /></Form.Item>

                <Form.Item>
                  <Button htmlType="submit" type="primary" loading={loading} icon={!loading && <PlusCircleOutlined className="mr-1 h-4 w-4" />}>
                    {loading ? "Validation..." : "Valider"}
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
