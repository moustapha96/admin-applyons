import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Breadcrumb, Row, Col, message } from "antd";
import { SaveOutlined, ArrowLeftOutlined, BookOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import organizationService from "../../../services/organizationservice";

const OrganizationFiliereCreate = () => {
  const { t } = useTranslation();
  const { id: orgId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.createFiliere(orgId, values);
      message.success(t("organizationFiliereCreate.messages.success"));
      navigate(`/admin/organisations/${orgId}/filieres`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      message.error(error?.message || t("organizationFiliereCreate.messages.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("organizationFiliereCreate.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">{t("organizationFiliereCreate.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/organisations">{t("organizationFiliereCreate.breadcrumb.organizations")}</Link> },
              { title: t("organizationFiliereCreate.breadcrumb.newFiliere") },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("organizationFiliereCreate.actions.back")}
          </Button>
        </div>
        <Card title={t("organizationFiliereCreate.cardTitle")} className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label={t("organizationFiliereCreate.form.name")}
                  rules={[{ required: true, message: t("organizationFiliereCreate.form.nameRequired") }]}
                >
                  <Input prefix={<BookOutlined />} placeholder={t("organizationFiliereCreate.form.namePlaceholder")} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label={t("organizationFiliereCreate.form.description")}
                >
                  <Input.TextArea rows={4} placeholder={t("organizationFiliereCreate.form.descriptionPlaceholder")} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {loading ? t("organizationFiliereCreate.actions.creating") : t("organizationFiliereCreate.actions.create")}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationFiliereCreate;
