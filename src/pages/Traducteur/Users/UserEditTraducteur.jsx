/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Checkbox, Upload, Breadcrumb, Card, Avatar, Row, Col, Divider, Select, Spin } from "antd";
import { UserOutlined, UploadOutlined, SaveFilled, ArrowLeftOutlined } from "@ant-design/icons";
import userService from "@/services/userService";
import { getPermissionLabel, PERMS } from "@/auth/permissions";
import { useAuth } from "../../../hooks/useAuth";
import countries from "@/assets/countries.json"

const { Option } = Select;

/** Édition d’un user de l’institut (avatar + perms via FormData) */
export default function UserEditTraducteur() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const permissionsOptions = Object.entries(PERMS).map(([_, value]) => ({ label: getPermissionLabel(value, t), value }));

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    load();
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
    } finally { setLoading(false); }
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
      values.permissions?.forEach((p) => fd.append("permissions[]", p));
      await userService.update(id, fd);
      navigate("/traducteur/users");
    } finally { setLoading(false); }
  };

  if (loading && !user) return <div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Modifier l'utilisateur</h5>
          <Breadcrumb items={[
            { title: <Link to="/traducteur/dashboard">Tableau de bord</Link> },
            { title: <Link to="/traducteur/users">Utilisateurs</Link> },
            { title: "Modifier" },
          ]} />
        </div>

        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Retour</Button>
        </div>

        <Card title="Modifier l'utilisateur" className="mt-4">
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Photo de profil" name="upload" valuePropName="fileList" getValueFromEvent={normFile}>
                  <Upload name="avatar" listType="picture-card" showUploadList={false} beforeUpload={() => false}
                    onChange={({ file }) => setImageUrl(URL.createObjectURL(file))}>
                    {imageUrl ? <Avatar size={128} src={imageUrl} icon={<UserOutlined />} /> : (
                      <div><UploadOutlined /><div style={{ marginTop: 8 }}>Téléverser</div></div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item name="firstName" label="Prénom" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="lastName" label="Nom" rules={[{ required: true }]}><Input /></Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}><Input disabled /></Form.Item>
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


                <Form.Item name="enabled" label="Statut" valuePropName="checked">
                  <Checkbox>Actif</Checkbox>
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

                <Form.Item>
                  <Button htmlType="submit" type="primary" loading={loading} icon={!loading && <SaveFilled className="mr-1 h-4 w-4" />}>
                    {loading ? "Enregistrement..." : "Enregistrer"}
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
