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
  Typography,
  Empty,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  FileAddOutlined,
  BellOutlined,
} from "@ant-design/icons";
import organizationDemandeNotificationService from "@/services/organizationDemandeNotificationService";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Text } = Typography;

/** Extrait le demandeur (user) depuis une notification (demandePartage.demande.user ou demandePartage.user ou demande.user) */
function getDemandeur(record) {
  const demande = record.demandePartage ?? record.demande;
  return record.demandePartage?.demande?.user ?? record.demandePartage?.user ?? demande?.user ?? null;
}

export default function OrganizationNotificationsList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organization?.id;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchData = useCallback(async () => {
    if (!orgId) return;

    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

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
  }, [orgId, pagination.current, pagination.pageSize, t]);

  useEffect(() => {
    if (!orgId) return;
    fetchData();
  }, [orgId, fetchData]);

  const onTableChange = (pg) => {
    setPagination((p) => ({
      ...p,
      current: pg.current,
      pageSize: pg.pageSize,
    }));
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
    return colors[type] ?? colors.DEFAULT;
  };

  const columns = useMemo(
    () => [
      {
        title: t("orgNotifications.columns.lastName"),
        key: "lastName",
        width: 120,
        render: (_, record) => {
          const demandeur = getDemandeur(record);
          return demandeur?.lastName ?? demandeur?.last_name ?? "—";
        },
      },
      {
        title: t("orgNotifications.columns.firstName"),
        key: "firstName",
        width: 120,
        render: (_, record) => {
          const demandeur = getDemandeur(record);
          return demandeur?.firstName ?? demandeur?.first_name ?? "—";
        },
      },
      {
        title: t("orgNotifications.columns.dateOfBirth"),
        key: "dateOfBirth",
        width: 120,
        render: (_, record) => {
          const demandeur = getDemandeur(record);
          const dob = demandeur?.dateOfBirth ?? demandeur?.dob ?? demandeur?.date_of_birth;
          return dob ? dayjs(dob).format("DD/MM/YYYY") : "—";
        },
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
          <Text>{record.message ?? record.title ?? "—"}</Text>
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
        width: 260,
        fixed: "right",
        render: (_, record) => {
          const demande = record.demandePartage ?? record.demande;
          const demandeId = demande?.id;
          const code = demande?.code ?? "";
          const targetOrgId = record.targetOrgId ?? record.demandePartage?.targetOrgId;
          const isTargetOrg = targetOrgId != null && String(targetOrgId) === String(orgId);

          return (
            <Space size="small" wrap>
              {demandeId && (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/organisations/demandes/${demandeId}/details`)}
                >
                  {t("orgNotifications.buttons.viewDemande")}
                </Button>
              )}
              {isTargetOrg && code && (
                <Button
                  size="small"
                  type="primary"
                  icon={<FileAddOutlined />}
                  onClick={() =>
                    navigate(
                      `/organisations/demandes/ajoute-document?code=${encodeURIComponent(code)}`
                    )
                  }
                >
                  {t("orgNotifications.buttons.addDocument")}
                </Button>
              )}
            </Space>
          );
        },
      },
    ],
    [t, navigate, orgId]
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

        <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2">
          <span className="text-neutral-600 flex items-center gap-1">
            <BellOutlined />
            {t("orgNotifications.stats.total")}: <strong>{pagination.total}</strong>
          </span>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            {t("orgNotifications.buttons.refresh")}
          </Button>
        </div>

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
