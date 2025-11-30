import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { BiBuilding } from "react-icons/bi";

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

const OrganizationEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const navigate = useNavigate();

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
      console.log(response.organization);
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
      message.error("Erreur lors de la récupération de l'organisation");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.update(id, values);
      message.success("Organisation mise à jour avec succès");
      navigate("/admin/organisations");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || "Erreur lors de la mise à jour de l'organisation");
    } finally {
      setLoading(false);
    }
  };



  if (loading && !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Modifier l'organisation</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Modifier l'organisation" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Modifier l'organisation" className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Nom de l'organisation"
                  rules={[{ required: true, message: "Le nom est obligatoire" }]}
                >
                  <Input prefix={<BiBuilding />} placeholder="Nom de l'organisation" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="slug"
                  label="Slug"
                 
                  rules={[
                    { required: true, message: "Le slug est obligatoire" },
                   
                  ]}
                >
                  <Input  disabled prefix={<GlobalOutlined />} placeholder="Slug unique" />
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
                    {loading ? "Mise à jour en cours..." : "Mettre à jour"}
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
