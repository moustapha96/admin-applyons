// src/pages/Admin/Filieres/DepartmentFiliereCreate.jsx
"use client";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Breadcrumb, Button, Card, Form, Input, Select, Space, message } from "antd";
import { useTranslation } from "react-i18next";

import departmentService from "@/services/departmentService";

const DEPS_BASE = "/admin/departments";

export default function DepartmentFiliereCreate() {
  const { t } = useTranslation();
  const { id: departmentId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const submit = async (values) => {
    try {
      const payload = {
        name: values.name?.trim(),
        code: values.code?.trim() || undefined,
        level: values.level || undefined,
        description: values.description?.trim() || undefined,
      };

      await departmentService.createFiliere(departmentId, payload); // 201 ; 409 si doublon
      message.success(t("departmentFiliereCreate.messages.success"));
      navigate(`${DEPS_BASE}/${departmentId}/filieres`);
    } catch (e) {
      const msg = e?.response?.data?.message;
      if (e?.response?.status === 409) {
        message.error(msg || t("departmentFiliereCreate.messages.errorDuplicate"));
      } else {
        message.error(msg || t("departmentFiliereCreate.messages.error"));
      }
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("departmentFiliereCreate.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("departmentFiliereCreate.breadcrumb.dashboard")}</Link> },
              { title: <Link to={DEPS_BASE}>{t("departmentFiliereCreate.breadcrumb.departments")}</Link> },
              { title: <Link to={`${DEPS_BASE}/${departmentId}`}>{t("departmentFiliereCreate.breadcrumb.detail")}</Link> },
              { title: <Link to={`${DEPS_BASE}/${departmentId}/filieres`}>{t("departmentFiliereCreate.breadcrumb.filieres")}</Link> },
              { title: t("departmentFiliereCreate.breadcrumb.create") },
            ]}
          />
        </div>

        <Card title={t("departmentFiliereCreate.cardTitle")}>
          <Form layout="vertical" form={form} onFinish={submit}>
            <Form.Item
              label={t("departmentFiliereCreate.form.name")}
              name="name"
              rules={[{ required: true, message: t("departmentFiliereCreate.form.nameRequired") }]}
            >
              <Input placeholder={t("departmentFiliereCreate.form.namePlaceholder")} />
            </Form.Item>

            <Form.Item label={t("departmentFiliereCreate.form.code")} name="code">
              <Input placeholder={t("departmentFiliereCreate.form.codePlaceholder")} />
            </Form.Item>

            <Form.Item label={t("departmentFiliereCreate.form.level")} name="level">
              <Select
                allowClear
                placeholder={t("departmentFiliereCreate.form.levelPlaceholder")}
                options={[
                  { value: "Licence", label: t("departmentFiliereCreate.form.levels.Licence") },
                  { value: "Master", label: t("departmentFiliereCreate.form.levels.Master") },
                  { value: "Doctorat", label: t("departmentFiliereCreate.form.levels.Doctorat") },
                ]}
              />
            </Form.Item>

            <Form.Item label={t("departmentFiliereCreate.form.description")} name="description">
              <Input.TextArea rows={4} placeholder={t("departmentFiliereCreate.form.descriptionPlaceholder")} />
            </Form.Item>

            <Space>
              <Button onClick={() => navigate(-1)}>{t("departmentFiliereCreate.actions.cancel")}</Button>
              <Button type="primary" htmlType="submit">
                {t("departmentFiliereCreate.actions.create")}
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    </div>
  );
}
