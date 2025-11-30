import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Space, Button, Divider, Tag, Spin } from "antd";
import { FileTextOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationservice";

const statusOptions = [
  { value: "PENDING", label: "En attente" },
  { value: "APPROVED", label: "Approuvée" },
  { value: "REJECTED", label: "Rejetée" },
  { value: "COMPLETED", label: "Terminée" },
];

const typeOptions = [
  { value: "TRADUCTION", label: "Traduction" },
  { value: "VERIFICATION", label: "Vérification" },
  { value: "AUTRE", label: "Autre" },
];

const getStatusColor = (status) => {
  const colors = {
    PENDING: "gold",
    APPROVED: "green",
    REJECTED: "red",
    COMPLETED: "blue",
  };
  return colors[status] || "default";
};

const OrganizationDemandeDetail = () => {
  const { id: orgId, demandeId } = useParams();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error("Erreur lors de la récupération de la demande:", error);
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

  if (!demande) {
    return <div>Demande non trouvée.</div>;
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Détails de la Demande</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Détails de la Demande" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/organisations/${orgId}/demandes/${demandeId}/edit`)}
            className="ml-2"
          >
            Modifier
          </Button>
        </div>
        <Card>
          <Descriptions title="Informations de la Demande" bordered>
            <Descriptions.Item label="Titre" span={2}>
              <Space>
                <FileTextOutlined />
                <span className="ml-3">{demande.title}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color="blue">
                {typeOptions.find(opt => opt.value === demande.type)?.label || demande.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Tag color={getStatusColor(demande.status)}>
                {statusOptions.find(opt => opt.value === demande.status)?.label || demande.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {demande.description}
            </Descriptions.Item>
            <Descriptions.Item label="Créé le">
              {new Date(demande.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Mis à jour le">
              {new Date(demande.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationDemandeDetail;
