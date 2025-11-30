import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Breadcrumb, Row, Col, message, Spin } from "antd";
import { SaveOutlined, ArrowLeftOutlined, BankOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationservice";

const OrganizationDepartmentEdit = () => {
  const { id: orgId, deptId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchDepartment();
  }, [deptId]);

  const fetchDepartment = async () => {
    setLoading(true);
    try {
      const response = await organizationService.getDepartmentById(orgId, deptId);
      setDepartment(response);
      form.setFieldsValue({
        name: response.name,
        description: response.description,
      });
    } catch (error) {
      message.error("Erreur lors de la récupération du département");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await organizationService.updateDepartment(orgId, deptId, values);
      message.success("Département mis à jour avec succès");
      navigate(`/admin/organisations/${orgId}/departments`);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      message.error(error?.message || "Erreur lors de la mise à jour du département");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !department) {
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
          <h5 className="text-lg font-semibold">Modifier le Département</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Modifier le Département" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Modifier le Département" className="mt-4">
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

export default OrganizationDepartmentEdit;
