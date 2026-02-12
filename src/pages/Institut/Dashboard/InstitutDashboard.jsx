
/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  Breadcrumb,
  message,
} from "antd";
import {
  FileTextOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  TranslationOutlined,
  BellOutlined,
} from "@ant-design/icons";
import dashboardService from "@/services/dashboardService";
import organizationDemandeNotificationService from "@/services/organizationDemandeNotificationService";
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(null);
  const [notificationStats, setNotificationStats] = useState({ total: 0, unviewed: 0 });

  useEffect(() => {
    const load = async () => {
      if (!user?.organization?.id) return;
      setLoading(true);
      try {
        const res = await dashboardService.getInstitutStats(user.organization.id, { recentDays: 30 });
        setPayload(res?.data ?? res);
      } catch (e) {
        console.error(e);
        message.error(e?.message || t("institutDashboard.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.organization?.id, t]);

  useEffect(() => {
    const loadNotifStats = async () => {
      if (!user?.organization?.id) return;
      try {
        const res = await organizationDemandeNotificationService.statsForCurrentOrg(user.organization.id);
        const stats = res?.data?.stats ?? res?.stats ?? { total: 0, unviewed: 0, viewed: 0 };
        setNotificationStats({ total: stats.total ?? 0, unviewed: stats.unviewed ?? 0 });
      } catch (e) {
        console.warn("Notification stats:", e?.message || e);
      }
    };
    loadNotifStats();
  }, [user?.organization?.id]);

  // Backend returns { success, meta, data: { widgets, tables, charts } }
  const responseBody = payload ?? {};
  const meta = responseBody.meta ?? {};
  const data = responseBody.data ?? responseBody;
  const widgets = data.widgets ?? {};
  const tables = data.tables ?? {};
  const charts = data.charts ?? {};
  const isTraducteur = meta.institutType === "TRADUCTEUR" || user?.organization?.type === "TRADUCTEUR";

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

  const percentAssigned = charts.targetVsAssigned?.assigned && charts.targetVsAssigned?.target
    ? Math.round(
        (charts.targetVsAssigned.assigned /
          (charts.targetVsAssigned.target + charts.targetVsAssigned.assigned)) * 100
      )
    : 0;

  // Données pour le dashboard TRADUCTEUR
  const recentAssigned = tables?.recentAssignedDemandes ?? [];
  const demandesAssignedOrgRowsTraducteur = useMemo(
    () => mapToRows(widgets.demandesAssignedOrg?.byStatus),
    [widgets.demandesAssignedOrg?.byStatus]
  );

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

  // Hauteur minimale pour aligner les cartes KPI (partagé Traducteur / Institut)
  const kpiCardStyle = { minHeight: "132px", display: "flex", flexDirection: "column", justifyContent: "center" };

  // ——— Dashboard TRADUCTEUR : uniquement les données essentielles ———
  if (isTraducteur) {
    return (
      <div className="container-fluid relative px-3">
        <div className="layout-specing">
          {/* En-tête aligné */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
            <div className="flex flex-col gap-1">
              <Title level={3} className="!mb-0">
                {t("institutDashboard.traducteur.header.title")}
              </Title>
              <Text type="secondary" className="text-sm">
                {t("institutDashboard.header.orgLabel")}{" "}
                <Text code>{user?.organization?.name || t("institutDashboard.common.undef")}</Text>
              </Text>
            </div>
            <Breadcrumb
              className="self-start sm:self-center"
              items={[
                { title: <Link to="/organisations/dashboard">{t("institutDashboard.breadcrumb.home")}</Link> },
                { title: t("institutDashboard.traducteur.breadcrumb.institute") },
              ]}
            />
          </div>

          {/* Grille KPI : 3 colonnes md, cartes alignées */}
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={8}>
              <Link to="/organisations/demandes" className="block h-full">
                <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                  <Statistic
                    title={t("institutDashboard.traducteur.kpis.assignedRequests")}
                    prefix={<FileTextOutlined />}
                    value={widgets.demandesAssignedOrg?.total ?? 0}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/organisations/demandes" className="block h-full">
                <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                  <Statistic
                    title={t("institutDashboard.traducteur.kpis.docsToTranslate")}
                    prefix={<TranslationOutlined />}
                    value={widgets.docsToTranslate?.total ?? 0}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/organisations/demandes" className="block h-full">
                <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                  <Statistic
                    title={t("institutDashboard.traducteur.kpis.docsTranslated")}
                    prefix={<BookOutlined />}
                    value={widgets.docsTranslated?.total ?? 0}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/organisations/demandes-authentification" className="block h-full">
                <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                  <Statistic
                    title={t("institutDashboard.kpis.demandesAuthentificationAttributed")}
                    prefix={<BookOutlined />}
                    value={widgets.demandesAuthentificationAttributed?.total ?? 0}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/organisations/abonnements" className="block h-full">
                <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                  <Statistic
                    title={t("institutDashboard.kpis.subscriptions")}
                    prefix={<SafetyCertificateOutlined />}
                    value={`${widgets.subscriptions?.active ?? 0} / ${widgets.subscriptions?.total ?? 0}`}
                  />
                  {(widgets.subscriptions?.expiringSoon ?? 0) > 0 && (
                    <Tag color="gold" style={{ marginTop: 8 }}>
                      {t("institutDashboard.kpis.expiringSoon", { count: widgets.subscriptions.expiringSoon })}
                    </Tag>
                  )}
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/organisations/users" className="block h-full">
                <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                  <Statistic
                    title={t("institutDashboard.kpis.usersTotal")}
                    prefix={<TeamOutlined />}
                    value={widgets.users?.total ?? 0}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/organisations/notifications" className="block h-full">
                <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                  <Statistic
                    title={t("institutDashboard.kpis.notifications")}
                    prefix={<BellOutlined />}
                    value={notificationStats.total}
                    suffix={notificationStats.unviewed > 0 ? (
                      <Tag color="blue">{notificationStats.unviewed} {t("institutDashboard.kpis.unread")}</Tag>
                    ) : null}
                  />
                </Card>
              </Link>
            </Col>
          </Row>

          {/* Tableaux côte à côte */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Link to="/organisations/demandes" className="block h-full">
                <Card
                  title={t("institutDashboard.traducteur.tables.assignedByStatus")}
                  loading={loading}
                  className="h-full hover:shadow-md transition-shadow cursor-pointer"
                >
                  <Table
                    rowKey="key"
                    size="small"
                    columns={simpleCols}
                    dataSource={demandesAssignedOrgRowsTraducteur}
                    pagination={false}
                    locale={{ emptyText: t("institutDashboard.common.noData") }}
                  />
                </Card>
              </Link>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title={t("institutDashboard.traducteur.tables.recentAssigned")}
                loading={loading}
                extra={recentAssigned.length > 0 ? <Tag color="blue">{recentAssigned.length}</Tag> : null}
              >
                <Table
                  rowKey="id"
                  size="small"
                  dataSource={recentAssigned}
                  pagination={false}
                  locale={{ emptyText: t("institutDashboard.common.noData") }}
                  columns={[
                    { title: t("institutDashboard.tables.listCols.code"), dataIndex: "code", key: "code", render: (code, row) => (
                      <a onClick={() => navigate(`/organisations/demandes/${row.id}/details`)}>{code || row.id}</a>
                    )},
                    { title: t("institutDashboard.tables.simpleCols.name"), dataIndex: "status", key: "status", render: (s) => <Tag color={statusColor(s)}>{s}</Tag> },
                    { title: t("institutDashboard.traducteur.tables.date"), dataIndex: "createdAt", key: "createdAt", render: (v) => formatDate(v) },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  // ——— Dashboard INSTITUT standard ———
  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        {/* En-tête aligné */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <div className="flex flex-col gap-1">
            <Title level={3} className="!mb-0">
              {t("institutDashboard.header.title")}
            </Title>
            <Text type="secondary" className="text-sm">
              {t("institutDashboard.header.orgLabel")}{" "}
              <Text code>{user?.organization?.name || t("institutDashboard.common.undef")}</Text>
            </Text>
          </div>
          <Breadcrumb
            className="self-start sm:self-center"
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutDashboard.breadcrumb.home")}</Link> },
              { title: t("institutDashboard.breadcrumb.institute") },
            ]}
          />
        </div>

        {/* Grille KPI : 4 colonnes lg, alignement uniforme */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} lg={6}>
            <Link to="/organisations/demandes" className="block h-full">
              <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                <Statistic
                  title={t("institutDashboard.kpis.targetRequests")}
                  prefix={<FileTextOutlined />}
                  value={widgets.demandesTargetOrg?.total ?? 0}
                />
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Link to="/organisations/demandes-authentification" className="block h-full">
              <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                <Statistic
                  title={t("institutDashboard.kpis.demandesAuthentificationAttributed")}
                  prefix={<BookOutlined />}
                  value={widgets.demandesAuthentificationAttributed?.total ?? 0}
                />
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Link to="/organisations/abonnements" className="block h-full">
              <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                <Statistic
                  title={t("institutDashboard.kpis.subscriptions")}
                  prefix={<SafetyCertificateOutlined />}
                  value={`${widgets.subscriptions?.active ?? 0} / ${widgets.subscriptions?.total ?? 0}`}
                />
                {(widgets.subscriptions?.expiringSoon ?? 0) > 0 && (
                  <Tag color="gold" style={{ marginTop: 8 }}>
                    {t("institutDashboard.kpis.expiringSoon", { count: widgets.subscriptions.expiringSoon })}
                  </Tag>
                )}
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Link to="/organisations/users" className="block h-full">
              <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                <Statistic
                  title={t("institutDashboard.kpis.usersTotal")}
                  prefix={<TeamOutlined />}
                  value={widgets.users?.total ?? 0}
                />
              </Card>
            </Link>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Link to="/organisations/notifications" className="block h-full">
              <Card loading={loading} className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={kpiCardStyle}>
                <Statistic
                  title={t("institutDashboard.kpis.notifications")}
                  prefix={<BellOutlined />}
                  value={notificationStats.total}
                  suffix={notificationStats.unviewed > 0 ? (
                    <Tag color="blue">{notificationStats.unviewed} {t("institutDashboard.kpis.unread")}</Tag>
                  ) : null}
                />
              </Card>
            </Link>
          </Col>
        </Row>

        {/* Tableau répartition par statut */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} lg={12}>
            <Link to="/organisations/demandes" className="block h-full">
              <Card
                title={t("institutDashboard.tables.targetByStatus")}
                loading={loading}
                className="h-full hover:shadow-md transition-shadow cursor-pointer"
              >
                <Table
                  rowKey="key"
                  size="small"
                  columns={simpleCols}
                  dataSource={demandesTargetOrgRows}
                  pagination={false}
                  locale={{ emptyText: t("institutDashboard.common.noData") }}
                />
              </Card>
            </Link>
          </Col>
        </Row>

        {/* Départements et filières côte à côte */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Link to="/organisations/departements" className="block h-full">
              <Card
                title={t("institutDashboard.lists.departmentsTitle", { n: widgets.departments?.total ?? 0 })}
                loading={loading}
                extra={<Tag color="blue">{widgets.departments?.total ?? 0}</Tag>}
                className="h-full hover:shadow-md transition-shadow cursor-pointer"
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
            </Link>
          </Col>
          <Col xs={24} lg={12}>
            <Link to="/organisations/filieres" className="block h-full">
              <Card
                title={t("institutDashboard.lists.tracksTitle", { n: widgets.filieres?.total ?? 0 })}
                loading={loading}
                extra={<Tag color="blue">{widgets.filieres?.total ?? 0}</Tag>}
                className="h-full hover:shadow-md transition-shadow cursor-pointer"
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
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
}
