import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Space, Button, Divider, Tag, Spin } from "antd";
import { CreditCardOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import organizationService from "../../../services/organizationService";

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

const getStatusColor = (status) => {
  const colors = {
    ACTIVE: "green",
    EXPIRED: "red",
    CANCELLED: "gray",
  };
  return colors[status] || "default";
};

const OrganizationAbonnementDetail = () => {
  const { id: orgId, abonnementId } = useParams();
  const [abonnement, setAbonnement] = useState(null);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      console.error("Erreur lors de la récupération de l'abonnement:", error);
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

  if (!abonnement) {
    return <div>Abonnement non trouvé.</div>;
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">Détails de l'Abonnement</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">Dashboard</Link> },
              { title: <Link to="/admin/organisations">Organisations</Link> },
              { title: "Détails de l'Abonnement" },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            Retour
          </Button>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/organisations/${orgId}/abonnements/${abonnementId}/edit`)}
            className="ml-2"
          >
            Modifier
          </Button>
        </div>
        <Card>
          <Descriptions title="Informations de l'Abonnement" bordered column={3}>
            <Descriptions.Item label="Titre" span={2}>
              <Space>
                <CreditCardOutlined />
                <span className="ml-3">{abonnement.title}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Type" span={1}>
              <Tag color="blue">
                {typeOptions.find(opt => opt.value === abonnement.type)?.label || abonnement.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Statut" span={1}>
              <Tag color={getStatusColor(abonnement.status)}>
                {statusOptions.find(opt => opt.value === abonnement.status)?.label || abonnement.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Prix" span={1}>
              {abonnement.price} USD
            </Descriptions.Item>
            <Descriptions.Item label="Date de début" span={1}>
              {new Date(abonnement.startDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Date de fin" span={1}>
              {new Date(abonnement.endDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={3}>
              {abonnement.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Créé le">
              {new Date(abonnement.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Mis à jour le">
              {new Date(abonnement.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationAbonnementDetail;
