// src/pages/Filieres/FiliereEdit.jsx
/* eslint-disable react/prop-types */
"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Breadcrumb, Button, Card, Form, Input, Select, Space, Tag, message } from "antd";
import filiereService from "@/services/filiereService";

export default function FiliereEdit() {
  const { id } = useParams(); // filiereId
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [filiere, setFiliere] = useState(null);

  const levelOptions = useMemo(
    () => [
      { value: "Licence", label: "Licence" },
      { value: "Bachelor", label: "Bachelor" }, // si tu l’utilises ailleurs
      { value: "Master", label: "Master" },
      { value: "Doctorat", label: "Doctorat" },
    ],
    []
  );

  useEffect(() => {
    (async () => {
      try {
        // Le back renvoie { filiere } avec include: { department: true } (cf. contrôleur getById)
        const res = await filiereService.getById(id);
        const f = res?.filiere || res;
        setFiliere(f);

        form.setFieldsValue({
          name: f.name,
          code: f.code || "",
          level: f.level || undefined,
          description: f.description || "",
        });
      } catch (e) {
        message.error(e?.response?.data?.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      await filiereService.update(id, {
        name: values.name?.trim(),
        code: values.code || undefined,
        level: values.level || undefined,
        description: values.description || undefined,
      });
      message.success("Filière mise à jour");
      navigate(-1);
    } catch (e) {
      const msg = e?.response?.data?.message;
      if (e?.response?.status === 409) {
        message.error(msg || "Une filière avec ce nom existe déjà dans ce département");
      } else {
        message.error(msg || "Échec de la mise à jour");
      }
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Filières</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to="/filieres">Filières</Link> },
              { title: "Modifier" },
            ]}
          />
        </div>

        <Card title="Modifier la filière" loading={loading}>
          {/* En-tête d’infos rapides */}
          {filiere && (
            <div className="mb-4 flex flex-wrap gap-3">
              <Tag color="blue">{filiere.name}</Tag>
              {filiere?.department?.name && (
                <Tag>{`Département: ${filiere.department.name}`}</Tag>
              )}
              {filiere?.code ? <Tag color="purple">Code: {filiere.code}</Tag> : null}
            </div>
          )}

          <Form layout="vertical" form={form} onFinish={onFinish}>
            <Form.Item
              label="Nom"
              name="name"
              rules={[{ required: true, message: "Nom requis" }]}
            >
              <Input placeholder="Ex: Informatique" />
            </Form.Item>

            <Form.Item label="Code" name="code">
              <Input placeholder="Ex: INFO" />
            </Form.Item>

            <Form.Item label="Niveau" name="level">
              <Select allowClear options={levelOptions} placeholder="Sélectionnez un niveau" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={4} placeholder="Description de la filière" />
            </Form.Item>

            <Space>
              <Button onClick={() => navigate(-1)}>Annuler</Button>
              <Button type="primary" htmlType="submit">Enregistrer</Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
}
