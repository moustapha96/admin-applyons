import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Breadcrumb, Row, Col, message, Spin } from "antd";
import { SaveOutlined, ArrowLeftOutlined, BookOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationservice";

const OrganizationFiliereEdit = () => {
  const { id: orgId, filiereId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [filiere, setFiliere] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchFiliere();
  }, [filiereId]);

  const fetchFiliere = async () => {
    setLoading(true);
    try {
      const response = await organizationService.getFiliereById(orgId, filiereId);
      setFiliere(response);
      form.setFieldsValue({
        name: response.name,
        description: response.description,
      });
    } catch (error) {
      message.error("Erreur lors de la récupération de la filière");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.updateFiliere(orgId, filiereId, values);
      message.success("Filière mise à jour avec succès");
      navigate(`/admin/organisations/${orgId}/filieres`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || "Erreur lors de la mise à jour de la filière");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !filiere) {
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
          <h5 className="text-lg font-semibold">Modifier la Filière</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Modifier la Filière" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Modifier la Filière" className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Nom de la filière"
                  rules={[{ required: true, message: "Le nom est obligatoire" }]}
                >
                  <Input prefix={<BookOutlined />} placeholder="Nom de la filière" />
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

export default OrganizationFiliereEdit;
