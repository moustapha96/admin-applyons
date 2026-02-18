import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Space, Button, Divider, Tag, Spin } from "antd";
import { FileTextOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import organizationService from "../../../services/organizationService";

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
  const { t } = useTranslation();
  const { id: orgId, demandeId } = useParams();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const statusOptions = [
    { value: "PENDING", label: t("adminOrgDemandeDetail.status.PENDING") },
    { value: "APPROVED", label: t("adminOrgDemandeDetail.status.APPROVED") },
    { value: "REJECTED", label: t("adminOrgDemandeDetail.status.REJECTED") },
    { value: "COMPLETED", label: t("adminOrgDemandeDetail.status.COMPLETED") },
  ];
  const typeOptions = [
    { value: "TRADUCTION", label: t("adminOrgDemandeDetail.type.TRADUCTION") },
    { value: "VERIFICATION", label: t("adminOrgDemandeDetail.type.VERIFICATION") },
    { value: "AUTRE", label: t("adminOrgDemandeDetail.type.AUTRE") },
  ];

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
    return <div>{t("adminOrgDemandeDetail.notFound")}</div>;
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminOrgDemandeDetail.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">{t("adminOrgDemandeDetail.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/organisations">{t("adminOrgDemandeDetail.breadcrumb.organisations")}</Link> },
              { title: t("adminOrgDemandeDetail.breadcrumb.detail") },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("adminOrgDemandeDetail.buttons.back")}
          </Button>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/organisations/${orgId}/demandes/${demandeId}/edit`)}
            className="ml-2"
          >
            {t("adminOrgDemandeDetail.buttons.edit")}
          </Button>
        </div>
        <Card>
          <Descriptions title={t("adminOrgDemandeDetail.sections.info")} bordered column={3}>
            <Descriptions.Item label={t("adminOrgDemandeDetail.fields.title")} span={2}>
              <Space>
                <FileTextOutlined />
                <span className="ml-3">{demande.title}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("adminOrgDemandeDetail.fields.type")} span={1}>
              <Tag color="blue">
                {typeOptions.find(opt => opt.value === demande.type)?.label || demande.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("adminOrgDemandeDetail.fields.status")} span={1}>
              <Tag color={getStatusColor(demande.status)}>
                {statusOptions.find(opt => opt.value === demande.status)?.label || demande.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("adminOrgDemandeDetail.fields.description")} span={3}>
              {demande.description}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminOrgDemandeDetail.fields.createdAt")} span={1}>
              {new Date(demande.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminOrgDemandeDetail.fields.updatedAt")} span={2}>
              {new Date(demande.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationDemandeDetail;
