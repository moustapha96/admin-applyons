/* eslint-disable no-unused-vars */
"use client";

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
  Empty,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import organizationDemandeNotificationService from "@/services/organizationDemandeNotificationService";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Text } = Typography;

export default function OrganizationNotificationsList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organization?.id;
  console.log(orgId);

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

      // my-org : le backend filtre par l'organisation du user connecté (JWT) → uniquement ses notifications
      const res = await organizationDemandeNotificationService.listForCurrentOrg(orgId, params);

      const data = res?.data ?? res ?? {};
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
        e?.response?.data?.message ??
          e?.message ??
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
      const res = await organizationDemandeNotificationService.statsForCurrentOrg(orgId);
      const data = res?.data ?? res ?? {};
      const statsData = data?.stats ?? data ?? {};

      setStats({
        total: statsData.total ?? 0,
        unviewed: statsData.unviewed ?? 0,
        viewed: statsData.viewed ?? 0,
      });
    } catch {
      // Silencieux : les stats sont secondaires
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

  const handleMarkAsViewed = useCallback(
    async (notificationId) => {
      try {
        await organizationDemandeNotificationService.markAsViewed(notificationId);
        message.success(t("orgNotifications.messages.markedAsViewed"));
        await Promise.all([fetchData(), fetchStats()]);
      } catch (e) {
        message.error(
          e?.response?.data?.message ??
            e?.message ??
            t("orgNotifications.messages.markError")
        );
      }
    },
    [fetchData, fetchStats, t]
  );

  const handleMarkAllAsViewed = useCallback(async () => {
    try {
      await organizationDemandeNotificationService.markAllAsViewedForCurrentOrg();
      message.success(t("orgNotifications.messages.allMarkedAsViewed"));
      await Promise.all([fetchData(), fetchStats()]);
    } catch (e) {
      message.error(
        e?.response?.data?.message ??
          e?.message ??
          t("orgNotifications.messages.markAllError")
      );
    }
  }, [fetchData, fetchStats, t]);

  const getNotificationTypeColor = (type) => {
    const colors = {
      DEMANDE_CREATED: "blue",
      DEMANDE_UPDATED: "orange",
      DEMANDE_ASSIGNED: "green",
      DOCUMENT_ADDED: "purple",
      INVITATION_SENT: "cyan",
      DEFAULT: "default",
    };
    return colors[type] ?? colors.DEFAULT;
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
        width: 160,
        render: (type) => (
          <Tag color={getNotificationTypeColor(type)}>
            {t(`orgNotifications.types.${type || "DEFAULT"}`)}
          </Tag>
        ),
      },
      {
        title: t("orgNotifications.columns.message"),
        key: "message",
        ellipsis: true,
        render: (_, record) => (
          <Text strong={!record.viewed}>
            {record.message ?? record.title ?? "—"}
          </Text>
        ),
      },
      {
        title: t("orgNotifications.columns.demande"),
        key: "demande",
        width: 140,
        render: (_, record) => {
          const demande = record.demandePartage ?? record.demande;
          if (demande?.id) {
            return (
              <Link to={`/organisations/demandes/${demande.id}/details`}>
                {demande.code ?? demande.id}
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
        width: 150,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
      },
      {
        title: t("orgNotifications.columns.actions"),
        key: "actions",
        width: 220,
        fixed: "right",
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
            {(record.demandePartage?.id ?? record.demande?.id) && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() =>
                  navigate(
                    `/organisations/demandes/${
                      record.demandePartage?.id ?? record.demande?.id
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
    [t, navigate, handleMarkAsViewed]
  );

  if (!orgId) {
    return (
      <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
        <div className="layout-specing py-4 sm:py-6">
          <Card>
            <Text type="danger">{t("orgNotifications.errors.noOrgId")}</Text>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
      <div className="layout-specing py-4 sm:py-6">
        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
          <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1">
            {t("orgNotifications.pageTitle")}
          </h5>
          <Breadcrumb
            className="order-1 sm:order-2"
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

        {/* Stats */}
        <Card className="mb-4 sm:mb-6" loading={loadingStats}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title={t("orgNotifications.stats.total")}
                value={stats.total}
                prefix={<BellOutlined />}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title={t("orgNotifications.stats.unviewed")}
                value={stats.unviewed}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col xs={12} sm={8}>
              <Statistic
                title={t("orgNotifications.stats.viewed")}
                value={stats.viewed}
              />
            </Col>
          </Row>
        </Card>

        {/* Filtres */}
        <Card className="mb-4 sm:mb-6">
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Space>
                <Switch
                  checked={filters.unviewedOnly}
                  onChange={(checked) =>
                    setFilters((f) => ({ ...f, unviewedOnly: checked }))
                  }
                />
                <span>{t("orgNotifications.filters.unviewedOnly")}</span>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space>
                <Switch
                  checked={filters.asTarget}
                  onChange={(checked) =>
                    setFilters((f) => ({ ...f, asTarget: checked }))
                  }
                />
                <span>{t("orgNotifications.filters.asTarget")}</span>
              </Space>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space>
                <Switch
                  checked={filters.asNotified}
                  onChange={(checked) =>
                    setFilters((f) => ({ ...f, asNotified: checked }))
                  }
                />
                <span>{t("orgNotifications.filters.asNotified")}</span>
              </Space>
            </Col>
            <Col xs={24}>
              <Space wrap>
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
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card>
          <Table
            rowKey="id"
            loading={loading}
            dataSource={rows}
            columns={columns}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total) =>
                t("orgNotifications.pagination.total", { total }),
            }}
            onChange={onTableChange}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t("orgNotifications.empty")}
                />
              ),
            }}
          />
        </Card>
      </div>
    </div>
  );
}
