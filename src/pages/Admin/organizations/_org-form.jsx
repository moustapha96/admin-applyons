// src/pages/Admin/organisations/_org-form.jsx
import { Form, Input, Select, Button, Space, message } from "antd";
import organizationService from "../../../services/organization.service";
import { useEffect } from "react";

const ORG_TYPES = [
  "COLLEGE",
  "BANQUE",
  "UNIVERSITE",
  "LYCEE",
  "ENTREPRISE",
  "TRADUCTEUR",
];

export default function OrgForm({ initialValues, onSubmit, loading }) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.resetFields();
  }, [initialValues, form]);

  const checkSlug = async (_, value) => {
    if (!value || !form.getFieldValue("name")) return Promise.resolve();
    try {
      const res = await organizationService.checkSlug({ slug: value, name: form.getFieldValue("name") });
      if (res?.exists) {
        return Promise.reject(new Error("Ce slug est déjà pris"));
      }
      return Promise.resolve();
    } catch (e) {
      message.warning("Impossible de valider le slug maintenant.");
      return Promise.resolve();
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Form.Item
        name="name"
        label="Nom"
        rules={[{ required: true, message: "Nom requis" }]}
      >
        <Input placeholder="Nom de l'organisation" />
      </Form.Item>

      <Form.Item
        name="slug"
        label="Slug"
        tooltip="Identifiant URL (unique)"
        rules={[
          { required: true, message: "Slug requis" },
          { pattern: /^[a-z0-9-]+$/, message: "Minuscules, chiffres et tirets uniquement" },
          { validator: checkSlug },
        ]}
      >
        <Input placeholder="ex: universite-yaounde" />
      </Form.Item>

      <Form.Item
        name="type"
        label="Type"
        rules={[{ required: true, message: "Type requis" }]}
      >
        <Select options={ORG_TYPES.map(t => ({ label: t, value: t }))} />
      </Form.Item>

      <Form.Item name="email" label="Email">
        <Input type="email" placeholder="contact@org.tld" />
      </Form.Item>

      <Form.Item name="phone" label="Téléphone">
        <Input placeholder="+237 ..." />
      </Form.Item>

      <Form.Item name="website" label="Site web">
        <Input placeholder="https://..." />
      </Form.Item>

      <Form.Item name="address" label="Adresse">
        <Input placeholder="Adresse complète" />
      </Form.Item>

      <Form.Item name="country" label="Pays">
        <Input placeholder="Pays" />
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          Enregistrer
        </Button>
      </Space>
    </Form>
  );
}
