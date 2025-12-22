import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Space, Button, Divider, Spin } from "antd";
import { BookOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationService";

const OrganizationFiliereDetail = () => {
  const { id: orgId, filiereId } = useParams();
  const [filiere, setFiliere] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("dir", "ltr");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    fetchFiliere();
  }, [orgId, filiereId]);

  const fetchFiliere = async () => {
    setLoading(true);
    try {
      const response = await organizationService.getFiliereById(orgId, filiereId);
      setFiliere(response);
    } catch (error) {
      console.error("Erreur lors de la récupération de la filière:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!filiere) {
    return <div>Filière non trouvée.</div>;
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Détails de la Filière</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Détails de la Filière" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/organisations/${orgId}/filieres/${filiereId}/edit`)}
            className="ml-2"
          >
            Modifier
          </Button>
        </div>
        <Card>
          <Descriptions title="Informations de la Filière" bordered column={3}>
            <Descriptions.Item label="Nom" span={2}>
              <Space>
                <BookOutlined />
                <span className="ml-3">{filiere.name}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {filiere.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Créé le" span={1}>
              {new Date(filiere.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Mis à jour le" span={2}>
              {new Date(filiere.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationFiliereDetail;
