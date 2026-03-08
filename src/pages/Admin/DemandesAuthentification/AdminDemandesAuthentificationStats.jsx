"use client";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Breadcrumb, Card, Col, Row, Statistic, Spin, message } from "antd";
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, StopOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";

const STATUS_KEYS = ["EN_ATTENTE", "DOCUMENTS_RECUS", "TRAITEE", "ANNULEE"];
const STATUS_ICONS = {
  EN_ATTENTE: <ClockCircleOutlined />,
  DOCUMENTS_RECUS: <FileTextOutlined />,
  TRAITEE: <CheckCircleOutlined />,
  ANNULEE: <StopOutlined />,
};
const STATUS_COLORS = { EN_ATTENTE: "#1890ff", DOCUMENTS_RECUS: "#faad14", TRAITEE: "#52c41a", ANNULEE: "#ff4d4f" };

export default function AdminDemandesAuthentificationStats() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await demandeAuthentificationService.getStats();
      const data = res?.data ?? res;
      setStats(data);
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminDemandesAuthentification.stats.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="container-fluid relative px-3">
        <div className="layout-specing flex items-center justify-center min-h-[200px]">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const byStatus = stats?.byStatus ?? {};

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminDemandesAuthentification.stats.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminDemandesAuthentification.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/demandes-authentification">{t("adminDemandesAuthentification.breadcrumb.list")}</Link> },
              { title: t("adminDemandesAuthentification.stats.breadcrumb") },
            ]}
          />
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("adminDemandesAuthentification.stats.total")}
                value={total}
                prefix={<FileTextOutlined />}
              />
              <Link to="/admin/demandes-authentification" className="text-sm text-blue-600 mt-2 block">
                {t("adminDemandesAuthentification.stats.viewAll")}
              </Link>
            </Card>
          </Col>
          {STATUS_KEYS.map((status) => (
            <Col xs={24} sm={12} md={6} key={status}>
              <Card>
                <Statistic
                  title={t(`demandesAuthentification.status.${status}`)}
                  value={byStatus[status] ?? 0}
                  prefix={STATUS_ICONS[status]}
                  valueStyle={{ color: STATUS_COLORS[status] }}
                />
                <Link
                  to={`/admin/demandes-authentification?status=${status}`}
                  className="text-sm text-blue-600 mt-2 block"
                >
                  {t("adminDemandesAuthentification.stats.viewStatus")}
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}
