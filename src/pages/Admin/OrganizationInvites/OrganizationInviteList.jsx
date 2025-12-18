/* eslint-disable no-unused-vars */
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Breadcrumb, Button, Input, Table, Tag, Space, message, Modal, Tooltip, Typography, Card, Select, Row, Col, Statistic } from "antd";
import { PlusOutlined, SearchOutlined, DeleteOutlined, ExclamationCircleOutlined, CopyOutlined, ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import organizationInviteService from "@/services/organizationInviteService";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Text } = Typography;

export default function OrganizationInviteList() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: null });
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0, expired: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await organizationInviteService.list({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      // Support différents formats de réponse : { data: [...] } ou { invites: [...] }
      const rows = res.data || res.invites || (Array.isArray(res) ? res : []);
      setRows(rows);
      setPagination((p) => ({ ...p, total: res.pagination?.total || res.total || rows.length || 0 }));
      
      // Calculer les statistiques
      const now = dayjs();
      const statsData = {
        total: rows.length,
        pending: rows.filter(r => r.status === "PENDING" && (!r.expiresAt || dayjs(r.expiresAt).isAfter(now))).length,
        accepted: rows.filter(r => r.status === "ACCEPTED").length,
        rejected: rows.filter(r => r.status === "REJECTED").length,
        expired: rows.filter(r => r.status === "EXPIRED" || (r.expiresAt && dayjs(r.expiresAt).isBefore(now))).length,
      };
      setStats(statsData);
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("orgInviteList.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onTableChange = (pg) => {
    setPagination({ ...pagination, current: pg.current, pageSize: pg.pageSize });
  };

  const handleDelete = (inviteId) => {
    Modal.confirm({
      title: t("orgInviteList.modals.deleteTitle"),
      icon: <ExclamationCircleOutlined />,
      content: t("orgInviteList.modals.deleteContent"),
      okText: t("orgInviteList.modals.deleteOk"),
      okType: "danger",
      cancelText: t("orgInviteList.modals.deleteCancel"),
      onOk: async () => {
        try {
          await organizationInviteService.delete(inviteId);
          message.success(t("orgInviteList.messages.deleteSuccess"));
          fetchData();
        } catch (e) {
          message.error(e?.response?.data?.message || e?.message || t("orgInviteList.messages.deleteError"));
        }
      },
    });
  };

  const getStatusTag = (status, expiresAt) => {
    if (status === "ACCEPTED") return <Tag color="green">{t("orgInviteList.status.accepted")}</Tag>;
    if (status === "REJECTED") return <Tag color="red">{t("orgInviteList.status.rejected")}</Tag>;
    if (status === "EXPIRED" || (expiresAt && dayjs(expiresAt).isBefore(dayjs()))) {
      return <Tag color="default">{t("orgInviteList.status.expired")}</Tag>;
    }
    return <Tag color="blue">{t("orgInviteList.status.pending")}</Tag>;
  };

  const getInvitationUrl = (token) => {
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    return `${frontendUrl}/auth/invitations/accept?token=${encodeURIComponent(token)}`;
  };

  const copyInvitationLink = (token) => {
    const url = getInvitationUrl(token);
    navigator.clipboard.writeText(url).then(() => {
      message.success(t("orgInviteList.messages.linkCopied"));
    }).catch(() => {
      message.error(t("orgInviteList.messages.copyError"));
    });
  };

  const columns = useMemo(
    () => [
      {
        title: t("orgInviteList.columns.inviteeEmail"),
        dataIndex: "inviteeEmail",
        key: "inviteeEmail",
        sorter: false,
      },
      {
        title: t("orgInviteList.columns.inviteeName"),
        dataIndex: "inviteeName",
        key: "inviteeName",
        render: (v) => v || "—",
      },
      {
        title: t("orgInviteList.columns.inviteeOrg"),
        key: "inviteeOrg",
        render: (_, record) => {
          const orgName = record.inviteeOrg?.name || "—";
          const orgId = record.inviteeOrg?.id;
          if (orgId) {
            return <Link to={`/admin/organisations/${orgId}/details`}>{orgName}</Link>;
          }
          return orgName;
        },
      },
      {
        title: t("orgInviteList.columns.linkedDemande"),
        key: "linkedDemande",
        render: (_, record) => {
          // Chercher la demande liée dans les demandes invitées
          const demande = record.demandePartageInvitee?.demandePartage || record.demandePartage;
          if (demande?.id) {
            return (
              <Space>
                <Tag>
                  <Link to={`/admin/demandes/${demande.id}/details`}>
                    {demande.code || demande.id}
                  </Link>
                </Tag>
              </Space>
            );
          }
          return "—";
        },
      },
      {
        title: t("orgInviteList.columns.linkedUser"),
        key: "linkedUser",
        render: (_, record) => {
          // Chercher l'utilisateur lié (créateur de la demande ou utilisateur de l'invitation)
          const user = record.demandePartageInvitee?.demandePartage?.user || record.user || record.createdBy;
          if (user?.id) {
            return (
              <Space>
                <Link to={`/admin/users/${user.id}/details`}>
                  {user.email || user.username || user.firstName || "—"}
                </Link>
              </Space>
            );
          }
          return "—";
        },
      },
      {
        title: t("orgInviteList.columns.status"),
        key: "status",
        render: (_, record) => getStatusTag(record.status, record.expiresAt),
      },
      {
        title: t("orgInviteList.columns.expiresAt"),
        dataIndex: "expiresAt",
        key: "expiresAt",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
      },
      {
        title: t("orgInviteList.columns.createdAt"),
        dataIndex: "createdAt",
        key: "createdAt",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
      },
      {
        title: t("orgInviteList.columns.invitationLink"),
        key: "invitationLink",
        width: 300,
        render: (_, record) => {
          if (!record.token) return "—";
          const url = getInvitationUrl(record.token);
          return (
            <Space>
              <Text
                copyable={{
                  text: url,
                  tooltips: [t("orgInviteList.tooltips.copy"), t("orgInviteList.tooltips.copied")],
                }}
                ellipsis={{ tooltip: url }}
                style={{ maxWidth: 200 }}
              >
                {url}
              </Text>
              <Tooltip title={t("orgInviteList.tooltips.copy")}>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyInvitationLink(record.token)}
                />
              </Tooltip>
            </Space>
          );
        },
      },
      {
        title: t("orgInviteList.columns.actions"),
        key: "actions",
        width: 250,
        render: (_, record) => {
          const demande = record.demandePartageInvitee?.demandePartage || record.demandePartage;
          const user = record.demandePartageInvitee?.demandePartage?.user || record.user || record.createdBy;
          
          return (
            <Space size="small" wrap>
              {demande?.id && (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/admin/demandes/${demande.id}/details`)}
                >
                  {t("orgInviteList.buttons.viewDemande")}
                </Button>
              )}
              {user?.id && (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/admin/users/${user.id}/details`)}
                >
                  {t("orgInviteList.buttons.viewUser")}
                </Button>
              )}
              {record.status === "PENDING" && me?.permissions?.some((p) => p.key === "invites.manage") && (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id)}
                >
                  {t("orgInviteList.buttons.delete")}
                </Button>
              )}
            </Space>
          );
        },
      },
    ],
    [t, me]
  );

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("orgInviteList.pageTitle")}</h5>
          <Breadcrumb
            items={[
              {
                title: <Link to="/admin/dashboard">{t("orgInviteList.breadcrumbs.dashboard")}</Link>,
              },
              { title: t("orgInviteList.breadcrumbs.invites") },
            ]}
          />
        </div>

        {/* Statistiques */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("orgInviteList.stats.total")}
                value={stats.total}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("orgInviteList.stats.pending")}
                value={stats.pending}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("orgInviteList.stats.accepted")}
                value={stats.accepted}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("orgInviteList.stats.expired")}
                value={stats.expired}
                valueStyle={{ color: "#8c8c8c" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filtres et actions */}
        <Card className="mb-6">
          <div className="flex gap-3 flex-col md:flex-row md:items-center">
            <Input.Search
              placeholder={t("orgInviteList.searchPlaceholder")}
              allowClear
              enterButton={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onSearch={(v) => {
                setFilters({ ...filters, search: v });
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              className="w-full md:w-1/3"
            />
            <Select
              placeholder={t("orgInviteList.filters.statusPlaceholder")}
              allowClear
              value={filters.status}
              onChange={(v) => {
                setFilters({ ...filters, status: v });
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              className="w-full md:w-1/4"
              options={[
                { label: t("orgInviteList.status.pending"), value: "PENDING" },
                { label: t("orgInviteList.status.accepted"), value: "ACCEPTED" },
                { label: t("orgInviteList.status.rejected"), value: "REJECTED" },
                { label: t("orgInviteList.status.expired"), value: "EXPIRED" },
              ]}
            />
            <Space className="ml-auto">
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                {t("orgInviteList.buttons.refresh")}
              </Button>
              {me?.permissions?.some((p) => p.key === "invites.manage") && (
                <Link to="/admin/organization-invites/create">
                  <Button type="primary" icon={<PlusOutlined />}>
                    {t("orgInviteList.buttons.new")}
                  </Button>
                </Link>
              )}
            </Space>
          </div>
        </Card>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => t("orgInviteList.pagination.total", { total }),
          }}
          onChange={onTableChange}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
}
