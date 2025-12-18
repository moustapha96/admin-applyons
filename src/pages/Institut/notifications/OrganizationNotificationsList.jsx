/* eslint-disable no-unused-vars */
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
  Row,
  Col,
  Statistic,
  Badge,
  Switch,
  Typography,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import organizationDemandeNotificationService from "@/services/organizationDemandeNotificationService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Text } = Typography;

export default function OrganizationNotificationsList() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const navigate = useNavigate();
  const orgId = user?.organization?.id;

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
  });

  const [stats, setStats] = useState({
    total: 0,
    unviewed: 0,
    viewed: 0,
  });
  const fetchData = useCallback(async () => {
    if (!orgId) return;
  
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        unviewedOnly: filters.unviewedOnly ? "true" : undefined,
        asTarget: filters.asTarget ? "true" : undefined,
        asNotified: filters.asNotified ? "true" : undefined,
      };
  
      const res = await organizationDemandeNotificationService.listByOrg(orgId, params);
  
      const data = res?.data || {};
      const notifications = Array.isArray(data.notifications) ? data.notifications : [];
  
      setRows(notifications);
  
      setPagination((p) => ({
        ...p,
        total: data.pagination?.total ?? notifications.length,
      }));
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("orgNotifications.messages.loadError")
      );
    } finally {
      setLoading(false);
    }
  }, [
    orgId,
    pagination.current,
    pagination.pageSize,
    filters.unviewedOnly,
    filters.asTarget,
    filters.asNotified,
    t,
  ]);

  

  const fetchStats = useCallback(async () => {
    if (!orgId) return;
  
    setLoadingStats(true);
    try {
      const res = await organizationDemandeNotificationService.stats(orgId);
  
      const statsData = res?.data?.stats || {};
  
      setStats({
        total: statsData.total ?? 0,
        unviewed: statsData.unviewed ?? 0,
        viewed: statsData.viewed ?? 0,
      });
    } catch (e) {
      console.error("Error loading stats:", e);
      // message.error(e?.response?.data?.message || e?.message || "Erreur stats");
    } finally {
      setLoadingStats(false);
    }
  }, [orgId]);
  

  useEffect(() => {
    if (!orgId) return;
    fetchData();
    fetchStats();
  }, [orgId, fetchData, fetchStats]);

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
      message.success(t("orgNotifications.messages.markedAsViewed"));
      await Promise.all([fetchData(), fetchStats()]);
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("orgNotifications.messages.markError")
      );
    }
  };

  const handleMarkAllAsViewed = async () => {
    try {
      await organizationDemandeNotificationService.markAllAsViewedForCurrentOrg();
      message.success(t("orgNotifications.messages.allMarkedAsViewed"));
      await Promise.all([fetchData(), fetchStats()]);
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          e?.message ||
          t("orgNotifications.messages.markAllError")
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
        title: t("orgNotifications.columns.status"),
        key: "viewed",
        width: 130,
        render: (_, record) => (
          <Badge
            status={record.viewed ? "default" : "processing"}
            text={
              record.viewed
                ? t("orgNotifications.status.viewed")
                : t("orgNotifications.status.unviewed")
            }
          />
        ),
      },
      {
        title: t("orgNotifications.columns.type"),
        dataIndex: "type",
        key: "type",
        render: (type) => (
          <Tag color={getNotificationTypeColor(type)}>
            {t(`orgNotifications.types.${type || "DEFAULT"}`)}
          </Tag>
        ),
      },
      {
        title: t("orgNotifications.columns.message"),
        key: "message",
        render: (_, record) => (
          <Text strong={!record.viewed}>
            {record.message || record.title || "—"}
          </Text>
        ),
      },
      {
        title: t("orgNotifications.columns.demande"),
        key: "demande",
        render: (_, record) => {
          const demande = record.demandePartage || record.demande;
          if (demande?.id) {
            return (
              <Link to={`/organisations/demandes/${demande.id}/details`}>
                {demande.code || demande.id}
              </Link>
            );
          }
          return "—";
        },
      },
      {
        title: t("orgNotifications.columns.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
      },
      {
        title: t("orgNotifications.columns.actions"),
        key: "actions",
        width: 220,
        render: (_, record) => (
          <Space size="small" wrap>
            {!record.viewed && (
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleMarkAsViewed(record.id)}
              >
                {t("orgNotifications.buttons.markAsViewed")}
              </Button>
            )}

            {(record.demandePartage?.id || record.demande?.id) && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() =>
                  navigate(
                    `/organisations/demandes/${
                      (record.demandePartage?.id || record.demande?.id)
                    }/details`
                  )
                }
              >
                {t("orgNotifications.buttons.viewDemande")}
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [t, navigate]
  );

  if (!orgId) {
    return (
      <div className="container-fluid relative px-3">
        <div className="layout-specing">
          <Card>
            <Text type="danger">{t("orgNotifications.errors.noOrgId")}</Text>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">
            {t("orgNotifications.pageTitle")}
          </h5>
          <Breadcrumb
            items={[
              {
                title: (
                  <Link to="/organisations/dashboard">
                    {t("orgNotifications.breadcrumbs.dashboard")}
                  </Link>
                ),
              },
              { title: t("orgNotifications.breadcrumbs.notifications") },
            ]}
          />
        </div>

        {/* Statistiques */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card loading={loadingStats}>
              <Statistic
                title={t("orgNotifications.stats.total")}
                value={stats.total}
                prefix={<BellOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card loading={loadingStats}>
              <Statistic
                title={t("orgNotifications.stats.unviewed")}
                value={stats.unviewed}
                prefix={<Badge status="processing" />}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card loading={loadingStats}>
              <Statistic
                title={t("orgNotifications.stats.viewed")}
                value={stats.viewed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
        <Card className="mb-6">
          <Space wrap>
            <Switch
              checked={filters.unviewedOnly}
              onChange={(checked) => {
                setFilters((f) => ({ ...f, unviewedOnly: checked }));
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              checkedChildren={t("orgNotifications.filters.unviewedOnly")}
              unCheckedChildren={t("orgNotifications.filters.all")}
            />

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
              checkedChildren={t("orgNotifications.filters.asTarget")}
              unCheckedChildren={t("orgNotifications.filters.allNotifications")}
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
              checkedChildren={t("orgNotifications.filters.asNotified")}
              unCheckedChildren={t("orgNotifications.filters.allNotifications")}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchData();
                fetchStats();
              }}
            >
              {t("orgNotifications.buttons.refresh")}
            </Button>

            {stats.unviewed > 0 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleMarkAllAsViewed}
              >
                {t("orgNotifications.buttons.markAllAsViewed")}
              </Button>
            )}
          </Space>
        </Card>

        {/* Table */}
        <Card>
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
                t("orgNotifications.pagination.total", { total }),
            }}
            onChange={onTableChange}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </div>
  );
}
