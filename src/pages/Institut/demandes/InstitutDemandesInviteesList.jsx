/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card, Table, Tag, Space, Button, Input, DatePicker, Select, Typography,
  message, Breadcrumb, Spin
} from "antd";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import { useAuth } from "../../../hooks/useAuth";
import { DATE_FORMAT } from "@/utils/dateFormat";
import {
  EyeOutlined, ReloadOutlined, SearchOutlined, FileAddOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { PERMS_INSTITUT } from "../../../auth/permissions";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusColor = (s) =>
  s === "VALIDATED" ? "green" : s === "REJECTED" ? "red" : s === "IN_PROGRESS" ? "blue" : s === "COMPLETED" ? "green" : s === "CANCELLED" ? "red" : "default";

const inviteeStatusColor = (s) =>
  s === "COMPLETED" ? "green" : s === "IN_PROGRESS" ? "blue" : s === "CANCELLED" ? "red" : "orange";

export default function InstitutDemandesInviteesList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const orgId = user?.organization?.id;

  // ---- Table demandes ----
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [organization, setOrganization] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    from: undefined,
    to: undefined,
    sortBy: "linkedAt",
    sortOrder: "desc"
  });

  /** Liste des demandes invitées */
  const fetchData = useCallback(
    async (page = pagination.page, limit = pagination.limit) => {
      if (!orgId) return;
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          sortBy: filters.sortBy === "linkedAt" ? "createdAt" : filters.sortBy,
          sortOrder: filters.sortOrder,
          search: filters.search || undefined,
          status: filters.status || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined
        };
        const res = await demandeService.listInviteesByOrgId(orgId, params);
        setRows(res?.demandes || []);
        setOrganization(res?.organization || null);
        setPagination({
          page: res?.pagination?.page ?? page,
          limit: res?.pagination?.limit ?? limit,
          total: res?.pagination?.total ?? 0
        });
      } catch (e) {
        message.error(e?.response?.data?.message || e?.message || t("institutDemandesInviteesList.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [orgId, filters, pagination.page, pagination.limit, t]
  );

  useEffect(() => {
    if (orgId) fetchData(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  /** Colonnes */
  const columns = useMemo(
    () => [
      {
        title: t("institutDemandesInviteesList.columns.code"),
        dataIndex: "code",
        render: (v, r) => (
          <Typography.Text copyable={{ text: r?.code }}>
            <Tag>
              {/* <Link to={`/organisations/demandes/${r.id}/details`}>{v || "—"}</Link> */}
              {v || "—"}
            </Tag>
          </Typography.Text>
        )
      },
      {
        title: t("institutDemandesInviteesList.columns.dateDemande"),
        dataIndex: "dateDemande",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
        width: 140
      },
      {
        title: t("institutDemandesInviteesList.columns.demandeur"),
        key: "user",
        render: (_, r) => (
          <Tag>
            {r.user?.email || "—"}
          </Tag>
        )
      },
      {
        title: t("institutDemandesInviteesList.columns.targetOrg"),
        key: "targetOrg",
        render: (_, r) => r.targetOrg?.name || "—"
      },
      {
        title: t("institutDemandesInviteesList.columns.assignedOrg"),
        key: "assignedOrg",
        render: (_, r) => r.assignedOrg?.name || "—"
      },

      {
        title: t("institutDemandesInviteesList.columns.inviteeStatus"),
        dataIndex: "inviteeStatus",
        render: (s) => (
          <Tag color={inviteeStatusColor(s)}>
            {t(`institutDemandesInviteesList.inviteeStatuses.${s || "PENDING"}`)}
          </Tag>
        ),
        width: 140
      },
      {
        title: t("institutDemandesInviteesList.columns.actions"),
        key: "actions",
        fixed: "right",
        width: 200,
        render: (_, r) => (
          <Space>
            {user && user?.permissions?.some((p) => p.key === "invites.manage") && (
              <Button
                type="primary"
                size="small"
                icon={<FileAddOutlined />}
                onClick={() => navigate(`/organisations/demandes/ajoute-document?code=${encodeURIComponent(r.code || '')}&fromInvited=true`)}
              >
                {t("institutDemandesInviteesList.buttons.respond")}
              </Button>
            )}
          </Space>
        )
      }
    ],
    [navigate, t, user]
  );

  /** Filtres */
  const applyFilters = () => fetchData(1, pagination.limit);
  const resetFilters = () => {
    setFilters({
      search: "",
      status: undefined,
      from: undefined,
      to: undefined,
      sortBy: "linkedAt",
      sortOrder: "desc"
    });
    fetchData(1, pagination.limit);
  };

  /** --------- RENDER --------- */
  if (!orgId) {
    return (
      <div className="container-fluid relative px-3">
        <div className="layout-specing">
          <Card>
            <Text type="danger">{t("institutDemandesInviteesList.errors.noOrgId")}</Text>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("institutDemandesInviteesList.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutDemandesInviteesList.breadcrumbs.dashboard")}</Link> },
              { title: t("institutDemandesInviteesList.breadcrumbs.invited") }
            ]}
          />
        </div>

        <div className="p-2 md:p-4">
          {organization && (
            <Card className="mb-3">
              <Text strong>{t("institutDemandesInviteesList.organization.name")}: </Text>
              <Text>{organization.name}</Text>
            </Card>
          )}

          <Card className="mt-3" title={t("institutDemandesInviteesList.section.filters")}>
            <Space wrap>
              <Input
                placeholder={t("institutDemandesInviteesList.filters.searchPlaceholder")}
                value={filters.search}
                allowClear
                prefix={<SearchOutlined />}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                style={{ minWidth: 280 }}
              />
              <Select
                allowClear
                placeholder={t("institutDemandesInviteesList.filters.statusPlaceholder")}
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                style={{ width: 200 }}
                options={["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => ({
                  label: t(`institutDemandesInviteesList.inviteeStatuses.${s}`),
                  value: s
                }))}
              />
              <RangePicker
                format={DATE_FORMAT}
                onChange={(v) =>
                  setFilters((f) => ({
                    ...f,
                    from: v?.[0]?.startOf("day")?.toISOString(),
                    to: v?.[1]?.endOf("day")?.toISOString()
                  }))
                }
              />
              <Select
                value={filters.sortBy}
                onChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))}
                style={{ width: 200 }}
                options={[
                  { value: "linkedAt", label: t("institutDemandesInviteesList.sortByOptions.linkedAt") },
                  { value: "dateDemande", label: t("institutDemandesInviteesList.sortByOptions.dateDemande") },
                  { value: "createdAt", label: t("institutDemandesInviteesList.sortByOptions.createdAt") },
                  { value: "code", label: t("institutDemandesInviteesList.sortByOptions.code") }
                ]}
              />
              <Select
                value={filters.sortOrder}
                onChange={(v) => setFilters((f) => ({ ...f, sortOrder: v }))}
                style={{ width: 140 }}
                options={[
                  { value: "asc", label: t("institutDemandesInviteesList.sortOrderOptions.asc") },
                  { value: "desc", label: t("institutDemandesInviteesList.sortOrderOptions.desc") }
                ]}
              />
              <Button type="primary" onClick={applyFilters}>
                {t("institutDemandesInviteesList.filters.apply")}
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                {t("institutDemandesInviteesList.filters.reset")}
              </Button>
            </Space>
          </Card>

          <Card className="mt-3" title={t("institutDemandesInviteesList.section.list")}>
            <Table
              rowKey={(r) => r.id}
              loading={loading}
              columns={columns}
              dataSource={rows}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                onChange: (p, ps) => fetchData(p, ps),
                showSizeChanger: true
              }}
              scroll={{ x: true }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
