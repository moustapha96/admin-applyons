import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Select, Card, Breadcrumb, Row, Col, message, Spin, DatePicker } from "antd";
import { SaveOutlined, ArrowLeftOutlined, CreditCardOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationService";

const { Option } = Select;
const { TextArea } = Input;

const typeOptions = [
  { value: "MENSUEL", label: "Mensuel" },
  { value: "ANNUEL", label: "Annuel" },
  { value: "PONCTUEL", label: "Ponctuel" },
];

const statusOptions = [
  { value: "ACTIVE", label: "Actif" },
  { value: "EXPIRED", label: "Expiré" },
  { value: "CANCELLED", label: "Annulé" },
];

const OrganizationAbonnementEdit = () => {
  const { id: orgId, abonnementId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [abonnement, setAbonnement] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchAbonnement();
  }, [orgId, abonnementId]);

  const fetchAbonnement = async () => {
    setLoading(true);
    try {
      const response = await organizationService.getAbonnementById(orgId, abonnementId);
      setAbonnement(response);
      form.setFieldsValue({
        title: response.title,
        type: response.type,
        price: response.price,
        startDate: response.startDate ? new Date(response.startDate) : null,
        endDate: response.endDate ? new Date(response.endDate) : null,
        description: response.description,
        status: response.status,
      });
    } catch (error) {
      message.error("Erreur lors de la récupération de l'abonnement");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.updateAbonnement(orgId, abonnementId, values);
      message.success("Abonnement mis à jour avec succès");
      navigate(`/organisations/${orgId}/abonnements`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || "Erreur lors de la mise à jour de l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !abonnement) {
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
          <h5 className="text-lg font-semibold">Modifier l'Abonnement</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/organisations">Organisations</Link> },
              { title: "Modifier l'Abonnement" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Modifier l'Abonnement" className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label="Titre de l'abonnement"
                  rules={[{ required: true, message: "Le titre est obligatoire" }]}
                >
                  <Input prefix={<CreditCardOutlined />} placeholder="Titre de l'abonnement" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="type"
                  label="Type d'abonnement"
                  rules={[{ required: true, message: "Le type est obligatoire" }]}
                >
                  <Select placeholder="Sélectionner un type">
                    {typeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Prix (USD)"
                  rules={[{ required: true, message: "Le prix est obligatoire" }]}
                >
                  <Input type="number" placeholder="Prix" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Date de début"
                  rules={[{ required: true, message: "La date de début est obligatoire" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="Date de fin"
                  rules={[{ required: true, message: "La date de fin est obligatoire" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea rows={4} placeholder="Description de l'abonnement" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="status"
                  label="Statut"
                  rules={[{ required: true, message: "Le statut est obligatoire" }]}
                >
                  <Select placeholder="Sélectionner un statut">
                    {statusOptions.map(option => (
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

export default OrganizationAbonnementEdit;
