/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import dashboardService from "../../../services/dashboardService";
import organizationDemandeNotificationService from "../../../services/organizationDemandeNotificationService";
import { Card, Table, Tag, Row, Col, Breadcrumb, Statistic } from "antd";
import {
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
  FolderOpenOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";

function StatCard({ label, value, sublabel, linkTo, icon, linkLabel }) {
  const navigate = useNavigate();
  const content = (
    <Card
      loading={false}
      className="h-full cursor-pointer hover:shadow-md transition-shadow"
      onClick={linkTo ? () => navigate(linkTo) : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value ?? 0}</div>
          {sublabel ? <div className="mt-1 text-xs text-slate-400">{sublabel}</div> : null}
        </div>
        {icon && <span className="text-2xl text-slate-300">{icon}</span>}
      </div>
      {linkTo && linkLabel && (
        <div className="mt-2 text-xs text-primary font-medium">{linkLabel}</div>
      )}
    </Card>
  );
  return <div className="h-full">{content}</div>;
}

export default function TraducteurDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationStats, setNotificationStats] = useState({ total: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getTraducteurStats(user.id);
        const body = res?.data ?? res;
        setStats(body?.data ?? body);
      } catch (error) {
        console.error("Error fetching traducteur stats:", error);
        toast.error(error?.message || t("traducteurDashboard.error"));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.id, t]);

  useEffect(() => {
    const orgId = user?.organization?.id;
    if (!orgId) return;
    const load = async () => {
      try {
        const res = await organizationDemandeNotificationService.statsForCurrentOrg(orgId);
        const data = res?.data?.stats ?? res?.stats ?? { total: 0, unviewed: 0, viewed: 0 };
        setNotificationStats({ total: data.total ?? 0 });
      } catch (e) {
        console.warn("Notification stats:", e?.message || e);
      }
    };
    load();
  }, [user?.organization?.id]);

  const widgets = stats?.widgets ?? {};
  const tables = stats?.tables ?? {};
  const demandesAsTranslationOrg = widgets.demandesAsTranslationOrg ?? {};
  const organization = widgets.organization ?? {};
  const demandesAssigned = organization.demandesAssigned ?? demandesAsTranslationOrg;

  const kpis = useMemo(
    () => [
      {
        label: t("traducteurDashboard.kpis.demandesAsTranslationOrg"),
        value: demandesAsTranslationOrg.total ?? demandesAssigned.total ?? 0,
        sub: t("traducteurDashboard.kpis.demandesAsTranslationOrgBreakdown", {
          pending: demandesAsTranslationOrg.byStatus?.PENDING ?? demandesAssigned.byStatus?.PENDING ?? 0,
          validated: demandesAsTranslationOrg.byStatus?.VALIDATED ?? demandesAssigned.byStatus?.VALIDATED ?? 0,
        }),
        linkTo: "/traducteur/demandes",
        icon: <FolderOpenOutlined />,
        linkLabel: t("traducteurDashboard.links.goToDemandes"),
      },
    ],
    [t, demandesAsTranslationOrg.total, demandesAsTranslationOrg.byStatus, demandesAssigned.total, demandesAssigned.byStatus]
  );

  const recentDemandes = tables?.recentDemandesAssigned ?? [];
  const formatDate = (v) => {
    if (!v) return "—";
    try {
      const locale =
        i18n.language === "zh" ? "zh-CN" : i18n.language === "de" ? "de-DE" : i18n.language === "es" ? "es-ES" : i18n.language === "it" ? "it-IT" : i18n.language === "en" ? "en-US" : "fr-FR";
      return new Date(v).toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(v);
    }
  };
  const statusColor = (s) =>
    s === "VALIDATED" ? "green" : s === "REJECTED" ? "red" : s === "IN_PROGRESS" ? "gold" : "blue";

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <Breadcrumb
          className="mb-4"
          items={[{ title: t("traducteurDashboard.breadcrumb.dashboard") }]}
        />
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h5 className="text-xl font-bold">
              {t("traducteurDashboard.hello", {
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
              })}
            </h5>
            <h6 className="font-semibold text-slate-400">
              {user?.organization?.name
                ? t("traducteurDashboard.welcomeOrg", { orgName: user.organization.name })
                : t("traducteurDashboard.welcome")}
            </h6>
          </div>
        </div>

        {/* Liens rapides — cartes à hauteur uniforme */}
        <Card title={t("traducteurDashboard.links.title")} className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Link to="/traducteur/dossiers-a-traiter" className="block h-full">
                <Card size="small" className="h-full min-h-[80px] hover:shadow-md transition-shadow border-slate-200" bodyStyle={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <FolderOpenOutlined className="text-2xl text-primary shrink-0" />
                  <span className="font-medium">{t("traducteurDashboard.links.dossiers")}</span>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/traducteur/profile" className="block h-full">
                <Card size="small" className="h-full min-h-[80px] hover:shadow-md transition-shadow border-slate-200" bodyStyle={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <UserOutlined className="text-2xl text-primary shrink-0" />
                  <span className="font-medium">{t("traducteurDashboard.links.profile")}</span>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Link to="/traducteur/users" className="block h-full">
                <Card size="small" className="h-full min-h-[80px] hover:shadow-md transition-shadow border-slate-200" bodyStyle={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <TeamOutlined className="text-2xl text-primary shrink-0" />
                  <span className="font-medium">{t("traducteurDashboard.links.users")}</span>
                </Card>
              </Link>
            </Col>
          </Row>
        </Card>

        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-1" style={{ maxWidth: 360 }}>
            <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        )}

        {!loading && stats && (
          <>
            {/* KPIs — 4 cartes alignées, même hauteur */}
            <Row gutter={[16, 16]} className="mb-4" align="stretch">
              <Col xs={24} sm={12} md={6} style={{ display: "flex" }}>
                <Link to="/traducteur/demandes" className="block w-full h-full" style={{ minHeight: 120, flex: 1 }}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={{ height: "100%", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Statistic
                      title={t("traducteurDashboard.kpis.demandesAsTranslationOrg")}
                      value={demandesAsTranslationOrg.total ?? demandesAssigned.total ?? 0}
                      prefix={<FileTextOutlined className="mr-1" />}
                    />
                  </Card>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6} style={{ display: "flex" }}>
                <Link to="/traducteur/dossiers-a-traiter" className="block w-full h-full" style={{ minHeight: 120, flex: 1 }}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={{ height: "100%", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Statistic
                      title={t("traducteurDashboard.links.dossiers")}
                      value={demandesAsTranslationOrg.total ?? demandesAssigned.total ?? 0}
                      prefix={<FolderOpenOutlined className="mr-1" />}
                    />
                  </Card>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6} style={{ display: "flex" }}>
                <Link to="/traducteur/users" className="block w-full h-full" style={{ minHeight: 120, flex: 1 }}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={{ height: "100%", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Statistic
                      title={t("traducteurDashboard.links.users")}
                      value={organization?.usersCount ?? organization?.totalUsers ?? "—"}
                      prefix={<TeamOutlined className="mr-1" />}
                    />
                  </Card>
                </Link>
              </Col>
              <Col xs={24} sm={12} md={6} style={{ display: "flex" }}>
                <Link to="/traducteur/notifications" className="block w-full h-full" style={{ minHeight: 120, flex: 1 }}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" bodyStyle={{ height: "100%", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <Statistic
                      title={t("traducteurDashboard.links.notifications", { defaultValue: "Notifications" })}
                      value={notificationStats.total}
                      prefix={<BellOutlined className="mr-1" />}
                    />
                  </Card>
                </Link>
              </Col>
            </Row>

            <Link to="/traducteur/demandes" className="block mb-4">
              <Card
                title={t("traducteurDashboard.tables.recentAssigned")}
                loading={loading}
                className="hover:shadow-md transition-shadow cursor-pointer"
                bodyStyle={{ padding: "16px 24px" }}
                extra={
                  recentDemandes.length > 0 ? (
                    <span className="text-primary font-medium">{t("traducteurDashboard.links.seeAll")}</span>
                  ) : null
                }
              >
                <Table
                rowKey="id"
                size="small"
                dataSource={recentDemandes}
                pagination={false}
                locale={{ emptyText: t("traducteurDashboard.empty.noData") }}
                columns={[
                  {
                    title: t("traducteurDashboard.tables.code"),
                    dataIndex: "code",
                    key: "code",
                    render: (code, row) => (
                      <a
                        href={`#/traducteur/demandes/${row.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/traducteur/demandes/${row.id}`);
                        }}
                      >
                        {code || row.id}
                      </a>
                    ),
                  },
                  {
                    title: t("traducteurDashboard.tables.status"),
                    dataIndex: "status",
                    key: "status",
                    render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
                  },
                  {
                    title: t("traducteurDashboard.tables.date"),
                    dataIndex: "createdAt",
                    key: "createdAt",
                    render: (v) => formatDate(v),
                  },
                  {
                    title: "",
                    key: "action",
                    render: (_, row) => (
                      <a
                        href={`#/traducteur/demandes/${row.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/traducteur/demandes/${row.id}`);
                        }}
                      >
                        {t("traducteurDashboard.tables.view")}
                      </a>
                    ),
                  },
                ]}
              />
              </Card>
            </Link>
          </>
        )}

        {!loading && !stats && (
          <Card className="mt-6">
            <div className="py-8 text-center text-slate-500">
              {t("traducteurDashboard.empty.noData")}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
