/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Card, Form, Input, Spin, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import departmentService from "@/services/departmentService";
import { useTranslation } from "react-i18next";

export default function DepartmentEditInstitut() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await departmentService.getById(id);     // GET /departments/:id :contentReference[oaicite:6]{index=6}
        const d = res?.department;
        form.setFieldsValue({ name: d.name, code: d.code || "", description: d.description || "" });
      } catch {
        message.error(t("departmentEditInstitut.messages.loadError"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSubmit = async () => {
    try {
      const v = await form.validateFields();
      setLoading(true);
      await departmentService.update(id, {                    // PUT /departments/:id :contentReference[oaicite:7]{index=7}
        name: v.name, code: v.code || null, description: v.description || null
      });
      message.success(t("departmentEditInstitut.messages.updated"));
      navigate(`/organisations/departements/${id}`);
    } catch (e) {
      if (!e?.errorFields) {
        message.error(e?.response?.data?.message || e?.message || t("departmentEditInstitut.messages.updateError"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("departmentEditInstitut.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("departmentEditInstitut.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/organisations/departements">{t("departmentEditInstitut.breadcrumbs.departments")}</Link> },
              { title: t("departmentEditInstitut.breadcrumbs.edit") },
            ]}
          />
        </div>

        <Card>
          <Form layout="vertical" form={form}>
            <Form.Item
              name="name"
              label={t("departmentEditInstitut.fields.name")}
              rules={[{ required: true, message: t("departmentEditInstitut.validators.nameRequired") }]}
            >
              <Input placeholder={t("departmentEditInstitut.placeholders.name")} />
            </Form.Item>
            <Form.Item name="code" label={t("departmentEditInstitut.fields.code")}>
              <Input placeholder={t("departmentEditInstitut.placeholders.code")} />
            </Form.Item>
            <Form.Item name="description" label={t("departmentEditInstitut.fields.description")}>
              <Input.TextArea rows={3} placeholder={t("departmentEditInstitut.placeholders.description")} />
            </Form.Item>
            <Button type="primary" icon={<SaveOutlined />} onClick={onSubmit} loading={loading}>
              {t("departmentEditInstitut.buttons.save")}
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
