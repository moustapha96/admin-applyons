
/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  Space,
  Breadcrumb,
  Progress,
  message,
} from "antd";
import {
  FileTextOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import dashboardService from "@/services/dashboardService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const statusColor = (s) =>
  s === "VALIDATED" ? "green" :
  s === "REJECTED" ? "red" :
  s === "IN_PROGRESS" ? "gold" : "blue";

export default function InstitutDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await dashboardService.getInstitutStats(user.organization.id, { recentDays: 30 });
        setPayload(res);
      } catch (e) {
        console.error(e);
        message.error(e?.message || t("institutDashboard.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.organization?.id, t]);

  // Extraction des données
  const data = payload?.data || {};
  const widgets = data.widgets || {};
  const tables = data.tables || {};
  const charts = data.charts || {};

  // Helper lines
  const mapToRows = (obj) => {
    if (!obj || typeof obj !== "object") return [];
    return Object.entries(obj)
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([key, value]) => ({ key, name: key, value: value ?? 0 }));
  };

  // Données pour les tableaux de répartition
  const demandesTargetOrgRows = useMemo(
    () => mapToRows(widgets.demandesTargetOrg?.byStatus),
    [widgets.demandesTargetOrg?.byStatus]
  );
  const demandesAssignedOrgRows = useMemo(
    () => mapToRows(widgets.demandesAssignedOrg?.byStatus),
    [widgets.demandesAssignedOrg?.byStatus]
  );
  const paymentsByStatusRows = useMemo(
    () => mapToRows(widgets.payments?.byStatus),
    [widgets.payments?.byStatus]
  );
  const usersByRoleRows = useMemo(
    () => mapToRows(widgets.users?.byRole),
    [widgets.users?.byRole]
  );

  // Colonnes i18n
  const simpleCols = [
    { title: t("institutDashboard.tables.simpleCols.name"), dataIndex: "name", key: "name" },
    {
      title: t("institutDashboard.tables.simpleCols.value"),
      dataIndex: "value",
      key: "value",
      render: (v) => (v === null || v === undefined ? 0 : v),
      align: "right",
      width: 100,
    },
  ];

  const listCols = [
    { title: t("institutDashboard.tables.listCols.name"), dataIndex: "name", key: "name" },
    { title: t("institutDashboard.tables.listCols.code"), dataIndex: "code", key: "code" },
    { title: t("institutDashboard.tables.listCols.description"), dataIndex: "description", key: "description" },
  ];

  // Récents (entrants)
  const recent = tables?.recentIncomingDemandes || [];
  const totalRecent = recent.length;
  const byStatus = recent.reduce((acc, { status }) => {
    const k = status || "UNKNOWN";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const statusEntries = Object.entries(byStatus);

  const formatDate = (v) => {
    if (!v) return t("institutDashboard.common.na");
    const locale =
      i18n.language === "zh" ? "zh-CN" :
      i18n.language === "de" ? "de-DE" :
      i18n.language === "es" ? "es-ES" :
      i18n.language === "it" ? "it-IT" :
      i18n.language === "en" ? "en-US" : "fr-FR";
    try {
      return new Date(v).toLocaleString(locale, {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      });
    } catch {
      return v;
    }
  };

  const percentAssigned = charts.targetVsAssigned?.assigned && charts.targetVsAssigned?.target
    ? Math.round(
        (charts.targetVsAssigned.assigned /
          (charts.targetVsAssigned.target + charts.targetVsAssigned.assigned)) * 100
      )
    : 0;

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <Title level={3} className="mb-0">
            {t("institutDashboard.header.title")}
          </Title>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutDashboard.breadcrumb.home")}</Link> },
              { title: t("institutDashboard.breadcrumb.institute") },
            ]}
          />
        </div>
        <Text type="secondary">
          {t("institutDashboard.header.orgLabel")}{" "}
          <Text code>{user.organization?.name || t("institutDashboard.common.undef")}</Text>
        </Text>

        {/* KPIs 1 */}
        <Row gutter={[16, 16]} className="mt-3">
          <Col xs={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.targetRequests")}
                prefix={<FileTextOutlined />}
                value={widgets.demandesTargetOrg?.total ?? 0}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.demandesAuthentificationAttributed")}
                prefix={<BookOutlined />}
                value={widgets.demandesAuthentificationAttributed?.total ?? 0}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.subscriptions")}
                prefix={<SafetyCertificateOutlined />}
                value={`${widgets.subscriptions?.active ?? 0} / ${widgets.subscriptions?.total ?? 0}`}
              />
              <div style={{ marginTop: 8 }}>
                <Tag color="gold">
                  {t("institutDashboard.kpis.expiringSoon", { count: widgets.subscriptions?.expiringSoon ?? 0 })}
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card loading={loading}>
              <Statistic
                title={t("institutDashboard.kpis.usersTotal")}
                prefix={<TeamOutlined />}
                value={widgets.users?.total ?? 0}
              />
            </Card>
          </Col>
        </Row>

      

        {/* Répartition demandes par statut */}
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card title={t("institutDashboard.tables.targetByStatus")} loading={loading}>
              <Table
                rowKey="key"
                size="small"
                columns={simpleCols}
                dataSource={demandesTargetOrgRows}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.common.noData") }}
              />
            </Card>
          </Col>
         
        </Row>

       
        {/* Départements & Filières */}
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} md={12}>
            <Card
              title={t("institutDashboard.lists.departmentsTitle", { n: widgets.departments?.total ?? 0 })}
              loading={loading}
              extra={<Tag color="blue">{widgets.departments?.total ?? 0}</Tag>}
            >
              <Table
                rowKey="id"
                size="small"
                columns={listCols}
                dataSource={widgets.departments?.list || []}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.lists.noDepartment") }}
              />
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={t("institutDashboard.lists.tracksTitle", { n: widgets.filieres?.total ?? 0 })}
              loading={loading}
              extra={<Tag color="blue">{widgets.filieres?.total ?? 0}</Tag>}
            >
              <Table
                rowKey="id"
                size="small"
                columns={[
                  ...listCols,
                  { title: t("institutDashboard.lists.departmentCol"), dataIndex: ["department", "name"], key: "department" },
                ]}
                dataSource={widgets.filieres?.list || []}
                pagination={false}
                locale={{ emptyText: t("institutDashboard.lists.noTrack") }}
              />
            </Card>
          </Col>
        </Row>

        
      </div>
    </div>
  );
}
