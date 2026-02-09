import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  BellOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import organizationDemandeNotificationService from "@/services/organizationDemandeNotificationService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Text } = Typography;

export default function AdminOrganizationNotificationsList() {
  const { t } = useTranslation();
  const tEn = (key, opts) => t(key, { ...opts, lng: "en" });
  useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

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

  const [organization, setOrganization] = useState(null);

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

      const res = await organizationDemandeNotificationService.list(params);

      const data = res?.data || res;
      const notifications = Array.isArray(data.notifications)
        ? data.notifications
        : Array.isArray(data)
        ? data
        : [];

      setRows(notifications);
      setOrganization(data.organization || null);

      setPagination((p) => ({
        ...p,
        total: data.pagination?.total ?? notifications.length,
      }));
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          tEn("adminOrgNotifications.messages.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current,
    pagination.pageSize,
    filters.unviewedOnly,
    filters.asTarget,
    filters.asNotified,
    filters.search,
    t,
  ]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await organizationDemandeNotificationService.statsGlobal();

      const statsData = res?.data?.stats || {};

      setStats({
        total: statsData.total ?? 0,
        unviewed: statsData.unviewed ?? 0,
        viewed: statsData.viewed ?? 0,
      });
    } catch {
      // Stats optionnels : on garde les valeurs précédentes
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData, fetchStats]);

  const onTableChange = (pg) => {
    setPagination((p) => ({
      ...p,
      current: pg.current,
      pageSize: pg.pageSize,
    }));
  };

  const handleMarkAsViewed = async (notificationId) => {
    try {
      await organizationDemandeNotificationService.markAsViewed(notificationId);
      message.success(tEn("adminOrgNotifications.messages.markedAsViewed"));
      await Promise.all([fetchData(), fetchStats()]);
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          tEn("adminOrgNotifications.messages.markError")
      );
    }
  };

  const handleMarkAllAsViewed = async () => {
    try {
      await organizationDemandeNotificationService.markAllAsViewedForGlobal();
      message.success(tEn("adminOrgNotifications.messages.allMarkedAsViewed"));
      await Promise.all([fetchData(), fetchStats()]);
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          tEn("adminOrgNotifications.messages.markAllError")
      );
    }
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      DEMANDE_CREATED: "blue",
      DEMANDE_UPDATED: "orange",
      DEMANDE_ASSIGNED: "green",
      DOCUMENT_ADDED: "purple",
      INVITATION_SENT: "cyan",
      DEFAULT: "default",
    };
    return colors[type] || colors.DEFAULT;
  };

  const columns = useMemo(
    () => [
      {
        title: tEn("adminOrgNotifications.columns.status"),
        key: "viewed",
        width: 130,
        render: (_, record) => (
          <Badge
            status={record.viewed ? "default" : "processing"}
            text={
              record.viewed
                ? tEn("adminOrgNotifications.status.viewed")
                : tEn("adminOrgNotifications.status.unviewed")
            }
          />
        ),
      },
      {
        title: tEn("adminOrgNotifications.columns.type"),
        dataIndex: "type",
        key: "type",
        render: (type) => (
          <Tag color={getNotificationTypeColor(type)}>
            {t(`adminOrgNotifications.types.${type || "DEFAULT"}`)}
          </Tag>
        ),
      },
      {
        title: tEn("adminOrgNotifications.columns.message"),
        key: "message",
        render: (_, record) => (
          <Text strong={!record.viewed}>
            {record.message || record.title || "—"}
          </Text>
        ),
      },
      {
        title: tEn("adminOrgNotifications.columns.demande"),
        key: "demande",
        render: (_, record) => {
          const demande = record.demandePartage || record.demande;
          if (demande?.id) {
            return (
              <Link to={`/admin/demandes/${demande.id}/details`}>
                {demande.code || demande.id}
              </Link>
            );
          }
          return "—";
        },
      },
      {
        title: tEn("adminOrgNotifications.columns.user"),
        key: "user",
        render: (_, record) => {
          const user = record.user || record.createdBy;
          if (user?.id) {
            return (
              <Link to={`/admin/users/${user.id}/details`}>
                {user.email || user.username || "—"}
              </Link>
            );
          }
          return "—";
        },
      },
      {
        title: tEn("adminOrgNotifications.columns.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
      },
      {
        title: tEn("adminOrgNotifications.columns.actions"),
        key: "actions",
        width: 280,
        render: (_, record) => (
          <Space size="small" wrap>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/organisations/notifications/${record.id}/details`)}
            >
              {tEn("adminOrgNotifications.buttons.viewDetails")}
            </Button>

            {!record.viewed && (
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleMarkAsViewed(record.id)}
              >
                {tEn("adminOrgNotifications.buttons.markAsViewed")}
              </Button>
            )}

            {(record.demandePartage?.id || record.demande?.id) && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() =>
                  navigate(
                    `/admin/demandes/${
                      record.demandePartage?.id || record.demande?.id
                    }/details`
                  )
                }
              >
                {tEn("adminOrgNotifications.buttons.viewDemande")}
              </Button>
            )}

            {record.user?.id && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/admin/users/${record.user.id}/details`)}
              >
                {tEn("adminOrgNotifications.buttons.viewUser")}
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [t, navigate]
  );

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1 break-words">
            {tEn("adminOrgNotifications.pageTitle")}
          </h5>
          <Breadcrumb
            className="order-1 sm:order-2"
            items={[
              {
                title: (
                  <Link to="/admin/dashboard">
                    {tEn("adminOrgNotifications.breadcrumbs.dashboard")}
                  </Link>
                ),
              },
              {
                title: (
                  <Link to="/admin/organisations">
                    {tEn("adminOrgNotifications.breadcrumbs.organizations")}
                  </Link>
                ),
              },
              { title: <span className="break-words">{organization?.name || "Global"}</span> },
              { title: tEn("adminOrgNotifications.breadcrumbs.notifications") },
            ]}
          />
        </div>

        {/* Statistiques */}
        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          <Col xs={24} sm={8}>
            <Card loading={loadingStats}>
              <Statistic
                title={tEn("adminOrgNotifications.stats.total")}
                value={stats.total}
                prefix={<BellOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card loading={loadingStats}>
              <Statistic
                title={tEn("adminOrgNotifications.stats.unviewed")}
                value={stats.unviewed}
                prefix={<Badge status="processing" />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card loading={loadingStats}>
              <Statistic
                title={tEn("adminOrgNotifications.stats.viewed")}
                value={stats.viewed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
        <Card className="mb-4 sm:mb-6 overflow-hidden">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={10} lg={8}>
              <Input.Search
                placeholder={tEn("adminOrgNotifications.filters.searchPlaceholder")}
                allowClear
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onSearch={() => {
                  setPagination((p) => ({ ...p, current: 1 }));
                  fetchData();
                }}
                className="w-full"
                style={{ minWidth: 0 }}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={tEn("adminOrgNotifications.filters.statusPlaceholder")}
                allowClear
                value={filters.unviewedOnly ? "unviewed" : undefined}
                onChange={(v) => {
                  setFilters((f) => ({ ...f, unviewedOnly: v === "unviewed" }));
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
                className="w-full"
                style={{ minWidth: 0 }}
                options={[
                  { label: tEn("adminOrgNotifications.filters.all"), value: undefined },
                  { label: tEn("adminOrgNotifications.filters.unviewedOnly"), value: "unviewed" },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={24} lg={10}>
              <Space wrap size="middle" className="w-full">
                <Switch
                  checked={filters.asTarget}
                  onChange={(checked) => {
                    setFilters((f) => ({
                      ...f,
                      asTarget: checked,
                      asNotified: checked ? false : f.asNotified,
                    }));
                    setPagination((p) => ({ ...p, current: 1 }));
                  }}
                  checkedChildren={tEn("adminOrgNotifications.filters.asTarget")}
                  unCheckedChildren={tEn("adminOrgNotifications.filters.allNotifications")}
                />
                <Switch
                  checked={filters.asNotified}
                  onChange={(checked) => {
                    setFilters((f) => ({
                      ...f,
                      asNotified: checked,
                      asTarget: checked ? false : f.asTarget,
                    }));
                    setPagination((p) => ({ ...p, current: 1 }));
                  }}
                  checkedChildren={tEn("adminOrgNotifications.filters.asNotified")}
                  unCheckedChildren={tEn("adminOrgNotifications.filters.allNotifications")}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    fetchData();
                    fetchStats();
                  }}
                  className="w-full sm:w-auto"
                >
                  {tEn("adminOrgNotifications.buttons.refresh")}
                </Button>
                {stats.unviewed > 0 && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleMarkAllAsViewed}
                    className="w-full sm:w-auto"
                  >
                    {tEn("adminOrgNotifications.buttons.markAllAsViewed")}
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <Table
            rowKey="id"
            loading={loading}
            dataSource={rows}
            columns={columns}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total) =>
                tEn("adminOrgNotifications.pagination.total", { total }),
            }}
            onChange={onTableChange}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </div>
    </div>
  );
}
