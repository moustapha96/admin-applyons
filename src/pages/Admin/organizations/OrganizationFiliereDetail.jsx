import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Breadcrumb, Card, Descriptions, Space, Button, Divider, Spin } from "antd";
import { BookOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import organizationService from "../../../services/organizationService";

const OrganizationFiliereDetail = () => {
  const { t } = useTranslation();
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
    return <div>{t("adminOrgFiliereDetail.notFound")}</div>;
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminOrgFiliereDetail.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">{t("adminOrgFiliereDetail.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/organisations">{t("adminOrgFiliereDetail.breadcrumb.organisations")}</Link> },
              { title: t("adminOrgFiliereDetail.breadcrumb.detail") },
            ]}
          />
        </div>
        <div className="md:flex md:justify-end justify-end items-center mb-6">
          <Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>
            {t("adminOrgFiliereDetail.buttons.back")}
          </Button>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/organisations/${orgId}/filieres/${filiereId}/edit`)}
            className="ml-2"
          >
            {t("adminOrgFiliereDetail.buttons.edit")}
          </Button>
        </div>
        <Card>
          <Descriptions title={t("adminOrgFiliereDetail.sections.info")} bordered column={3}>
            <Descriptions.Item label={t("adminOrgFiliereDetail.fields.name")} span={2}>
              <Space>
                <BookOutlined />
                <span className="ml-3">{filiere.name}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t("adminOrgFiliereDetail.fields.description")} span={3}>
              {filiere.description || t("common.na")}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminOrgFiliereDetail.fields.createdAt")} span={1}>
              {new Date(filiere.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label={t("adminOrgFiliereDetail.fields.updatedAt")} span={2}>
              {new Date(filiere.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationFiliereDetail;
