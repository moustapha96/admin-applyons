import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Breadcrumb,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import organizationService from "../../../services/organizationService";
import { BiBuilding } from "react-icons/bi";
import countries from "@/assets/countries.json";

const { Option } = Select;

const TYPE_KEYS = ["ENTREPRISE", "TRADUCTEUR", "BANQUE", "COLLEGE", "LYCEE", "UNIVERSITE"];

const OrganizationEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const navigate = useNavigate();

  const typeOptions = useMemo(
    () =>
      TYPE_KEYS.map((value) => ({
        value,
        label: t(`adminOrgEdit.types.${value}`),
      })),
    [t]
  );

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchOrganization();
  }, [id]);

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const response = await organizationService.getById(id);
      setOrganization(response.organization);
      form.setFieldsValue({
        name: response.organization.name,
        slug: response.organization.slug,
        type: response.organization.type,
        email: response.organization.email,
        phone: response.organization.phone,
        address: response.organization.address,
        website: response.organization.website,
        country: response.organization.country,
      });
    } catch (error) {
      message.error(t("adminOrgEdit.messages.loadError"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.update(id, values);
      message.success(t("adminOrgEdit.messages.success"));
      navigate("/admin/organisations");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || t("adminOrgEdit.messages.error"));
    } finally {
      setLoading(false);
    }
  };



  if (loading && !organization) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] sm:min-h-screen p-4">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1">
            {t("adminOrgEdit.title")}
          </h5>
          <Breadcrumb
            className="order-1 sm:order-2"
            items={[
              { title: <Link to="/admin/dashboard">{t("adminOrgEdit.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/organisations">{t("adminOrgEdit.breadcrumb.organizations")}</Link> },
              { title: t("adminOrgEdit.breadcrumb.edit") },
            ]}
          />
        </div>
        <div className="flex flex-wrap justify-end items-center gap-2 mb-4 sm:mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />} className="w-full sm:w-auto">
            {t("adminOrgEdit.actions.back")}
          </Button>
        </div>
        <Card title={t("adminOrgEdit.cardTitle")} className="overflow-hidden">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={[16, 24]}>
              <Col xs={24}>
                <Form.Item
                  name="name"
                  label={t("adminOrgEdit.fields.name")}
                  rules={[{ required: true, message: t("adminOrgEdit.validators.nameRequired") }]}
                >
                  <Input prefix={<BiBuilding />} placeholder={t("adminOrgEdit.placeholders.name")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="slug"
                  label={t("adminOrgEdit.fields.slug")}
                  rules={[{ required: true, message: t("adminOrgEdit.validators.slugRequired") }]}
                >
                  <Input disabled prefix={<GlobalOutlined />} placeholder={t("adminOrgEdit.placeholders.slug")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="type"
                  label={t("adminOrgEdit.fields.type")}
                  rules={[{ required: true, message: t("adminOrgEdit.validators.typeRequired") }]}
                >
                  <Select placeholder={t("adminOrgEdit.placeholders.selectType")}>
                    {typeOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="email"
                  label={t("adminOrgEdit.fields.email")}
                  rules={[
                    { required: true, message: t("adminOrgEdit.validators.emailRequired") },
                    { type: "email", message: t("adminOrgEdit.validators.emailInvalid") },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder={t("adminOrgEdit.placeholders.email")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="phone"
                  label={t("adminOrgEdit.fields.phone")}
                  rules={[{ required: true, message: t("adminOrgEdit.validators.phoneRequired") }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder={t("adminOrgEdit.placeholders.phone")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="address"
                  label={t("adminOrgEdit.fields.address")}
                  rules={[{ required: true, message: t("adminOrgEdit.validators.addressRequired") }]}
                >
                  <Input placeholder={t("adminOrgEdit.placeholders.address")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="website"
                  label={t("adminOrgEdit.fields.website")}
                  rules={[{ type: "url", message: t("adminOrgEdit.validators.urlInvalid") }]}
                >
                  <Input placeholder={t("adminOrgEdit.placeholders.website")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  name="country"
                  label={t("adminOrgEdit.fields.country")}
                  rules={[{ required: true, message: t("adminOrgEdit.validators.countryRequired") }]}
                >
                  <Select
                    placeholder={t("adminOrgEdit.placeholders.selectCountry")}
                    showSearch
                    optionFilterProp="label"
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                    options={countries.map((c) => ({ value: c.code, label: c.name }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    className="w-full sm:w-auto"
                  >
                    {loading ? t("adminOrgEdit.buttons.submitting") : t("adminOrgEdit.buttons.submit")}
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

export default OrganizationEdit;
