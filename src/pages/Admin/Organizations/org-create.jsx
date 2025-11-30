import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import organizationService from "../../../services/organizationservice";
import { HiBuildingOffice } from "react-icons/hi2";

const { Option } = Select;

const typeOptions = [
  { value: "ENTREPRISE", label: "Entreprise" },
  { value: "TRADUCTEUR", label: "Agence de Traduction" },
  { value: "BANQUE", label: "Banque" },
  { value: "COLLEGE", label: "Collège" },
  { value: "LYCEE", label: "Lycée" },
  { value: "UNIVERSITE", label: "Université" },
];

const countryOptions = [
  { value: "SN", label: "Sénégal" },
  { value: "FR", label: "France" },
  { value: "US", label: "États-Unis" },
  { value: "CA", label: "Canada" },
];

const OrganizationCreate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.create(values);
      message.success("Organisation créée avec succès");
      navigate("/admin/organisations");
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      message.error(error?.message || "Erreur lors de la création de l'organisation");
    } finally {
      setLoading(false);
    }
  };

  const handleSlugCheck = async (_, value) => {
    if (!value) return Promise.reject("Le slug est obligatoire");
    try {
      const response = await organizationService.checkSlug({ slug: value, name: form.getFieldValue("name") });
      if (!response.available) {
        return Promise.reject("Ce slug est déjà utilisé");
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject("Erreur lors de la vérification du slug");
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Nouvelle Organisation</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Nouvelle Organisation" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Nouvelle Organisation" className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ type: "ENTREPRISE", country: "SN" }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Nom de l'organisation"
                  rules={[{ required: true, message: "Le nom est obligatoire" }]}
                >
                  <Input prefix={<HiBuildingOffice />} placeholder="Nom de l'organisation" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="slug"
                  label="Slug"
                  rules={[
                    { required: true, message: "Le slug est obligatoire" },
                    { validator: handleSlugCheck },
                  ]}
                >
                  <Input prefix={<GlobalOutlined />} placeholder="Slug unique" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Type"
                  rules={[{ required: true, message: "Le type est obligatoire" }]}
                >
                  <Select placeholder="Sélectionner un type">
                    {typeOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "L'email est obligatoire" },
                    { type: "email", message: "Email invalide" },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Téléphone"
                  rules={[{ required: true, message: "Le téléphone est obligatoire" }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Téléphone" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="address"
                  label="Adresse"
                  rules={[{ required: true, message: "L'adresse est obligatoire" }]}
                >
                  <Input placeholder="Adresse" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="website"
                  label="Site Web"
                  rules={[
                    { type: "url", message: "URL invalide" },
                  ]}
                >
                  <Input placeholder="Site Web" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="country"
                  label="Pays"
                  rules={[{ required: true, message: "Le pays est obligatoire" }]}
                >
                  <Select placeholder="Sélectionner un pays">
                    {countryOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
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
                    {loading ? "Création en cours..." : "Créer l'organisation"}
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

export default OrganizationCreate;
