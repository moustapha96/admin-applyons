import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Select, Card, Breadcrumb, Row, Col, message } from "antd";
import { SaveOutlined, ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import organizationService from "@/services/organizationservice";

const { Option } = Select;
const { TextArea } = Input;

const OrganizationDemandeCreate = () => {
  const { t } = useTranslation();
  const { id: orgId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const typeOptions = [
    { value: "TRADUCTION", label: t("organizationDemandeCreate.form.types.TRADUCTION") },
    { value: "VERIFICATION", label: t("organizationDemandeCreate.form.types.VERIFICATION") },
    { value: "AUTRE", label: t("organizationDemandeCreate.form.types.AUTRE") },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.createDemande(orgId, values);
      message.success(t("organizationDemandeCreate.messages.success"));
      navigate(`/admin/organisations/${orgId}/demandes`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      message.error(error?.message || t("organizationDemandeCreate.messages.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("organizationDemandeCreate.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">{t("organizationDemandeCreate.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/organisations">{t("organizationDemandeCreate.breadcrumb.organizations")}</Link> },
              { title: t("organizationDemandeCreate.breadcrumb.newDemande") },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("organizationDemandeCreate.actions.back")}
          </Button>
        </div>
        <Card title={t("organizationDemandeCreate.cardTitle")} className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label={t("organizationDemandeCreate.form.title")}
                  rules={[{ required: true, message: t("organizationDemandeCreate.form.titleRequired") }]}
                >
                  <Input prefix={<FileTextOutlined />} placeholder={t("organizationDemandeCreate.form.titlePlaceholder")} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="type"
                  label={t("organizationDemandeCreate.form.type")}
                  rules={[{ required: true, message: t("organizationDemandeCreate.form.typeRequired") }]}
                >
                  <Select placeholder={t("organizationDemandeCreate.form.typePlaceholder")}>
                    {typeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label={t("organizationDemandeCreate.form.description")}
                  rules={[{ required: true, message: t("organizationDemandeCreate.form.descriptionRequired") }]}
                >
                  <TextArea rows={4} placeholder={t("organizationDemandeCreate.form.descriptionPlaceholder")} />
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
                    {loading ? t("organizationDemandeCreate.actions.creating") : t("organizationDemandeCreate.actions.create")}
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

export default OrganizationDemandeCreate;
