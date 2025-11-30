import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Select, Card, Breadcrumb, Row, Col, message, Spin } from "antd";
import { SaveOutlined, ArrowLeftOutlined, FileTextOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationService";

const { Option } = Select;
const { TextArea } = Input;

const typeOptions = [
  { value: "TRADUCTION", label: "Traduction" },
  { value: "VERIFICATION", label: "Vérification" },
  { value: "AUTRE", label: "Autre" },
];

const statusOptions = [
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Approuvée" },
  { value: "REJECTED", label: "Rejetée" },
  { value: "COMPLETED", label: "Terminée" },
];

const OrganizationDemandeEdit = () => {
  const { id: orgId, demandeId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [demande, setDemande] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchDemande();
  }, [orgId, demandeId]);

  const fetchDemande = async () => {
    setLoading(true);
    try {
      const response = await organizationService.getDemandeById(orgId, demandeId);
      setDemande(response);
      form.setFieldsValue({
        title: response.title,
        type: response.type,
        description: response.description,
        status: response.status,
      });
    } catch (error) {
      message.error("Erreur lors de la récupération de la demande");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.updateDemande(orgId, demandeId, values);
      message.success("Demande mise à jour avec succès");
      navigate(`/organisations/${orgId}/demandes`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || "Erreur lors de la mise à jour de la demande");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !demande) {
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
          <h5 className="text-lg font-semibold">Modifier la Demande</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Modifier la Demande" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Modifier la Demande" className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="title"
                  label="Titre de la demande"
                  rules={[{ required: true, message: "Le titre est obligatoire" }]}
                >
                  <Input prefix={<FileTextOutlined />} placeholder="Titre de la demande" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="type"
                  label="Type de demande"
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
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: "La description est obligatoire" }]}
                >
                  <TextArea rows={4} placeholder="Description de la demande" />
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

export default OrganizationDemandeEdit;
