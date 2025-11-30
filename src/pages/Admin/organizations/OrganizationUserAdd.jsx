import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Select, Card, Breadcrumb, Row, Col, message, Spin } from "antd";
import { UserOutlined, SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationService";
import userService from "../../../services/userService";

const { Option } = Select;

const roleOptions = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "MEMBER", label: "Membre" },
  { value: "GUEST", label: "Invité" },
];

const OrganizationUserAdd = () => {
  const { id: orgId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const response = await userService.list({ limit: 1000 });
      setUsers(response.users);
    } catch (error) {
      message.error("Erreur lors de la récupération des utilisateurs");
      console.error(error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Logique pour ajouter un utilisateur à l'organisation
      await organizationService.addUserToOrg(orgId, {
        userId: values.userId,
        role: values.role,
      });
      message.success("Utilisateur ajouté avec succès");
      navigate(`/admin/organisations/${orgId}/users`);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      message.error(error?.message || "Erreur lors de l'ajout de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Ajouter un utilisateur à l'organisation</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Ajouter un utilisateur" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
        </div>
        <Card title="Ajouter un utilisateur" className="mt-4">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="userId"
                  label="Utilisateur"
                  rules={[{ required: true, message: "L'utilisateur est obligatoire" }]}
                >
                  <Select
                    showSearch
                    placeholder="Sélectionner un utilisateur"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    loading={fetchingUsers}
                  >
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="role"
                  label="Rôle dans l'organisation"
                  rules={[{ required: true, message: "Le rôle est obligatoire" }]}
                >
                  <Select placeholder="Sélectionner un rôle">
                    {roleOptions.map(option => (
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
                    {loading ? "Ajout en cours..." : "Ajouter l'utilisateur"}
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

export default OrganizationUserAdd;
