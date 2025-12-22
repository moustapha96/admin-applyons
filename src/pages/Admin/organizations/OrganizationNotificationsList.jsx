/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Table,
  Tag,
  Space,
  message,
  Card,
  Select,
  Row,
  Col,
  Statistic,
  Badge,
  Input,
  Switch,
  Typography,
  Spin,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  BellOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import organizationDemandeNotificationService from "../../../services/organizationDemandeNotificationService";
import organizationService from "../../../services/organizationService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Text } = Typography;
const { Search } = Input;

export default function OrganizationNotificationsList() {
  const { t } = useTranslation();
  const { id: orgId } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState({
    unviewedOnly: false,
    asTarget: false,
    asNotified: false,
    search: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    unviewed: 0,
    viewed: 0,
  });

  // Charger les informations de l'organisation
  const fetchOrganization = useCallback(async () => {
    setLoadingOrg(true);
    try {
      const res = await organizationService.getById(orgId);
      setOrganization(res?.organization || res);
    } catch (e) {
      console.error("Erreur lors de la récupération de l'organisation:", e);
      message.error(t("adminOrgNotifications.messages.orgLoadError") || "Erreur lors du chargement de l'organisation");
    } finally {
      setLoadingOrg(false);
    }
  }, [orgId, t]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        unviewedOnly: filters.unviewedOnly,
        asTarget: filters.asTarget,
        asNotified: filters.asNotified,
        search: filters.search || undefined,
      };

      const res = await organizationDemandeNotificationService.listByOrg(orgId, params);

      const data = res?.data || res;
      const notifications = Array.isArray(data.notifications)
        ? data.notifications
        : Array.isArray(data)
        ? data
        : [];

      setRows(notifications);

      setPagination((p) => ({
        ...p,
        total: data.pagination?.total ?? notifications.length,
      }));
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminOrgNotifications.messages.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.current, pagination.pageSize, filters, t]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await organizationDemandeNotificationService.stats(orgId);
      const data = res?.data || res;
      setStats(data.stats || data);
    } catch (e) {
      console.error("Erreur lors de la récupération des statistiques:", e);
    } finally {
      setLoadingStats(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchOrganization();
    fetchData();
    fetchStats();
  }, [fetchOrganization, fetchData, fetchStats]);

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleSearch = (value) => {
    setFilters((f) => ({ ...f, search: value }));
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const handleMarkAsViewed = async (id) => {
    try {
      await organizationDemandeNotificationService.markAsViewed(id);
      message.success(t("adminOrgNotifications.messages.markedAsViewed"));
      await fetchData();
      await fetchStats();
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminOrgNotifications.messages.markError")
      );
    }
  };

  const handleMarkAllAsViewed = async () => {
    try {
      await organizationDemandeNotificationService.markAllAsViewedForOrg(orgId);
      message.success(t("adminOrgNotifications.messages.allMarkedAsViewed"));
      await fetchData();
      await fetchStats();
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("adminOrgNotifications.messages.markAllError")
      );
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      DEMANDE_CREATED: "blue",
      DEMANDE_UPDATED: "cyan",
      DEMANDE_ASSIGNED: "green",
      DOCUMENT_ADDED: "orange",
      INVITATION_SENT: "purple",
    };
    return colors[type] || "default";
  };

  const columns = useMemo(
    () => [
      {
        title: t("adminOrgNotifications.columns.type"),
        dataIndex: "type",
        key: "type",
        width: 150,
        render: (type) => (
          <Tag color={getTypeColor(type)}>
            {t(`adminOrgNotifications.types.${type}`) || type}
          </Tag>
        ),
      },
      {
        title: t("adminOrgNotifications.columns.demande"),
        dataIndex: "demande",
        key: "demande",
        render: (demande) =>
          demande ? (
            <Link to={`/admin/demandes/${demande.id}/details`}>
              {demande.code || demande.id}
            </Link>
          ) : (
            "—"
          ),
      },
      {
        title: t("adminOrgNotifications.columns.targetOrg"),
        dataIndex: "targetOrg",
        key: "targetOrg",
        render: (org) => (org ? <Link to={`/admin/organisations/${org.id}`}>{org.name}</Link> : "—"),
      },
      {
        title: t("adminOrgNotifications.columns.notifiedOrg"),
        dataIndex: "notifiedOrg",
        key: "notifiedOrg",
        render: (org) => (org ? <Link to={`/admin/organisations/${org.id}`}>{org.name}</Link> : "—"),
      },
      {
        title: t("adminOrgNotifications.columns.user"),
        dataIndex: "user",
        key: "user",
        render: (user) => (user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "—"),
      },
      {
        title: t("adminOrgNotifications.columns.viewed"),
        dataIndex: "viewed",
        key: "viewed",
        width: 100,
        render: (viewed) =>
          viewed ? (
            <Badge status="success" text={t("adminOrgNotifications.status.viewed")} />
          ) : (
            <Badge status="default" text={t("adminOrgNotifications.status.unviewed")} />
          ),
      },
      {
        title: t("adminOrgNotifications.columns.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        width: 180,
        sorter: true,
        render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—"),
      },
      {
        title: t("adminOrgNotifications.columns.actions"),
        key: "actions",
        width: 120,
        render: (_, record) => (
          <Space>
            {!record.viewed && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleMarkAsViewed(record.id)}
              >
                {t("adminOrgNotifications.actions.markAsViewed")}
              </Button>
            )}
            <Button
              size="small"
              onClick={() => navigate(`/admin/organisations/notifications/${record.id}/details`)}
            >
              {t("adminOrgNotifications.actions.details")}
            </Button>
          </Space>
        ),
      },
    ],
    [t, navigate, handleMarkAsViewed]
  );

  if (loadingOrg) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!organization) {
    return <div>{t("adminOrgNotifications.messages.orgNotFound") || "Organisation non trouvée"}</div>;
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">
            {t("adminOrgNotifications.pageTitle") || "Notifications de l'organisation"}
          </h5>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/admin/dashboard">
                    {t("adminOrgNotifications.breadcrumbs.dashboard") || "Dashboard"}
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/admin/organisations">
                    {t("adminOrgNotifications.breadcrumbs.organizations") || "Organisations"}
                  </Link>
                ),
              },
              {
                title: (
                  <Link to={`/admin/organisations/${orgId}`}>
                    {organization.name}
                  </Link>
                ),
              },
              { title: t("adminOrgNotifications.breadcrumbs.notifications") || "Notifications" },
            ]}
          />
        </div>

        <div className="mb-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            {t("common.back") || "Retour"}
          </Button>
        </div>

        {/* Statistiques */}
        {stats && (
          <Row gutter={16} className="mb-4">
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title={t("adminOrgNotifications.stats.total") || "Total"}
                  value={stats.total || 0}
                  loading={loadingStats}
                  prefix={<BellOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title={t("adminOrgNotifications.stats.unviewed") || "Non vues"}
                  value={stats.unviewed || 0}
                  valueStyle={{ color: "#cf1322" }}
                  prefix={<Badge status="error" />}
                  loading={loadingStats}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title={t("adminOrgNotifications.stats.viewed") || "Vues"}
                  value={stats.viewed || 0}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<CheckCircleOutlined />}
                  loading={loadingStats}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Filtres */}
        <Card className="mb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
            <Search
              placeholder={t("adminOrgNotifications.searchPlaceholder") || "Rechercher..."}
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              style={{ maxWidth: 400 }}
              onSearch={handleSearch}
              onChange={(e) => {
                if (!e.target.value) {
                  handleSearch("");
                }
              }}
            />
            <Space wrap>
              <Switch
                checked={filters.unviewedOnly}
                onChange={(checked) => handleFilterChange("unviewedOnly", checked)}
                checkedChildren={t("adminOrgNotifications.filters.unviewedOnly") || "Non vues"}
                unCheckedChildren={t("adminOrgNotifications.filters.all") || "Toutes"}
              />
              <Select
                placeholder={t("adminOrgNotifications.filters.role") || "Rôle"}
                allowClear
                style={{ width: 150 }}
                value={filters.asTarget ? "target" : filters.asNotified ? "notified" : undefined}
                onChange={(value) => {
                  handleFilterChange("asTarget", value === "target");
                  handleFilterChange("asNotified", value === "notified");
                }}
              >
                <Select.Option value="target">
                  {t("adminOrgNotifications.filters.asTarget") || "Comme cible"}
                </Select.Option>
                <Select.Option value="notified">
                  {t("adminOrgNotifications.filters.asNotified") || "Comme notifié"}
                </Select.Option>
              </Select>
              <Button icon={<ReloadOutlined />} onClick={() => { fetchData(); fetchStats(); }}>
                {t("common.refresh") || "Actualiser"}
              </Button>
              {stats.unviewed > 0 && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleMarkAllAsViewed}
                >
                  {t("adminOrgNotifications.actions.markAllAsViewed") || "Tout marquer comme vu"}
                </Button>
              )}
            </Space>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={rows}
            loading={loading}
            rowKey="id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total) =>
                t("adminOrgNotifications.pagination.total", { total }) || `Total: ${total} notifications`,
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </div>
  );
}
