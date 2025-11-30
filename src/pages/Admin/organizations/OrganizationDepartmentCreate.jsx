import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Breadcrumb, Row, Col, message } from "antd";
import { SaveOutlined, ArrowLeftOutlined, BankOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationService";

const OrganizationDepartmentCreate = () => {
  const { id: orgId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.createDepartment(orgId, values);
      message.success("Département créé avec succès");
      navigate(`/organisations/${orgId}/departments`);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      message.error(error?.message || "Erreur lors de la création du département");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Nouveau Département</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/organisations">Organisations</Link> },
              { title: "Nouveau Département" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Nouveau Département" className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Nom du département"
                  rules={[{ required: true, message: "Le nom est obligatoire" }]}
                >
                  <Input prefix={<BankOutlined />} placeholder="Nom du département" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input.TextArea rows={4} placeholder="Description" />
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
                    {loading ? "Création en cours..." : "Créer le département"}
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

export default OrganizationDepartmentCreate;
