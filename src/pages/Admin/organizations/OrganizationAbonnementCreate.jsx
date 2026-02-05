import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Select, Card, Breadcrumb, Row, Col, message, DatePicker } from "antd";
import { SaveOutlined, ArrowLeftOutlined, CreditCardOutlined } from "@ant-design/icons";
import organizationService from "@/services/organizationService";
import { DATE_FORMAT } from "@/utils/dateFormat";

const { Option } = Select;
const { TextArea } = Input;

const typeOptions = [
  { value: "MENSUEL", label: "Mensuel" },
  { value: "ANNUEL", label: "Annuel" },
  { value: "PONCTUEL", label: "Ponctuel" },
];

const OrganizationAbonnementCreate = () => {
  const { id: orgId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.createAbonnement(orgId, values);
      message.success("Abonnement créé avec succès");
      navigate(`/organisations/${orgId}/abonnements`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      message.error(error?.message || "Erreur lors de la création de l'abonnement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Nouvel Abonnement</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Nouvel Abonnement" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Nouvel Abonnement" className="mt-4">
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
                  <DatePicker style={{ width: "100%" }} format={DATE_FORMAT} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="Date de fin"
                  rules={[{ required: true, message: "La date de fin est obligatoire" }]}
                >
                  <DatePicker style={{ width: "100%" }} format={DATE_FORMAT} />
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
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {loading ? "Création en cours..." : "Créer l'abonnement"}
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

export default OrganizationAbonnementCreate;
