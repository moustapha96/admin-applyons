// src/pages/Admin/Demandes/AdminDemandesList.jsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  Tag,
  Space,
  Breadcrumb,
  Button,
  Input,
  Select,
  message,
  DatePicker,
  Badge,
  Card,
} from "antd";
import { SearchOutlined, FileTextOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import demandeService from "@/services/demandeService";
import organizationService from "@/services/organizationService";

const { RangePicker } = DatePicker;

const getStatusColor = (status) => {
  switch (status) {
    case "VALIDATED":   return "green";
    case "REJECTED":    return "red";
    case "IN_PROGRESS": return "gold";
    default:            return "blue";
  }
};

// Couleurs pour paiement
const getPayColor = (s) => {
  switch (s) {
    case "PAID":         return "green";
    case "PENDING":      return "gold";
    case "REQUIRES_ACTION":
    case "REQUIRES_CAPTURE":
    case "requires_action":
    case "processing":   return "blue";
    case "FAILED":
    case "CANCELED":
    case "canceled":
    case "failed":       return "red";
    default:             return "default";
  }
};

// Récupère un statut paiement robuste selon ce que renvoie la liste
// (r.statusPayment || r.payment?.status || r.transaction?.statut || r.transaction?.status)
const extractPayStatus = (r) =>
  r?.statusPayment ||
  r?.payment?.status ||
  r?.transaction?.statut ||
  r?.transaction?.status ||
  null;

const extractPayAmount = (r) => {
  const amt = r?.payment?.amount ?? r?.transaction?.montant ?? r?.transaction?.amount;
  const cur = r?.payment?.currency ?? r?.transaction?.devise ?? r?.transaction?.currency;
  if (amt == null) return null;
  return { amt, cur: cur || "" };
};

export default function AdminDemandesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sort, setSort] = useState({ field: "createdAt", order: "descend" });

  const [orgs, setOrgs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    targetOrgId: undefined,
    assignedOrgId: undefined,
    from: undefined,
    to: undefined,
  });

  const statusOptions = [
    { value: "PENDING",     label: t("adminDemandesList.status.PENDING") },
    { value: "IN_PROGRESS", label: t("adminDemandesList.status.IN_PROGRESS") },
    { value: "VALIDATED",   label: t("adminDemandesList.status.VALIDATED") },
    { value: "REJECTED",    label: t("adminDemandesList.status.REJECTED") },
  ];

  // Charger organisations pour filtres
  useEffect(() => {
    (async () => {
      try {
        const res = await organizationService.list({ page: 1, limit: 500 });
        setOrgs(res?.organizations || []);
      } catch (e) {
        message.error(e?.response?.data?.message || t("adminDemandesList.messages.orgLoadError"));
      }
    })();
  }, [t]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
        targetOrgId: filters.targetOrgId || undefined,
        assignedOrgId: filters.assignedOrgId || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        sortBy: sort.field || "createdAt",
        sortOrder: sort.order === "ascend" ? "asc" : "desc",
      };

      const res = await demandeService.list(params);
      setRows(res?.demandes || []);
      setPagination((p) => ({ ...p, total: res?.pagination?.total || 0 }));
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminDemandesList.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters, sort, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const orgOptions = useMemo(
    () => orgs.map((o) => ({ value: o.id, label: `${o.name} — ${o.type}` })),
    [orgs]
  );

  const columns = [
    {
      title: t("adminDemandesList.columns.code"),
      dataIndex: "code",
      sorter: true,
      width: 170,
      render: (code, r) => (
        <Space>
          <FileTextOutlined />
          <Link to={`/admin/demandes/${r.id}`}>{code}</Link>
        </Space>
      ),
    },
    {
      title: t("adminDemandesList.columns.date"),
      dataIndex: "dateDemande",
      sorter: true,
      width: 150,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : t("adminDemandesList.common.na")),
    },
    {
      title: t("adminDemandesList.columns.demandeur"),
      dataIndex: ["user", "email"],
      render: (_, r) => (
        <div>
          <div>{r.user?.email || t("adminDemandesList.common.na")}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{r.user?.username || ""}</div>
        </div>
      ),
    },
    {
      title: t("adminDemandesList.columns.targetOrg"),
      dataIndex: ["targetOrg", "name"],
      render: (_, r) => (
        <div>
          <div>{r.targetOrg?.name || t("adminDemandesList.common.na")}</div>
          {r.targetOrg?.type ? <Tag style={{ marginTop: 4 }}>{r.targetOrg.type}</Tag> : null}
        </div>
      ),
    },
    {
      title: t("adminDemandesList.columns.assignedOrg"),
      dataIndex: ["assignedOrg", "name"],
      render: (_, r) =>
        r.assignedOrg ? (
          <div>
            <div>{r.assignedOrg.name}</div>
            {/* {r.assignedOrg.slug ? (
              <div style={{ fontSize: 12, color: "#888" }}>{r.assignedOrg.slug}</div>
            ) : null} */}
          </div>
        ) : (
          <Tag>{t("adminDemandesList.common.na")}</Tag>
        ),
    },
    {
      title: t("adminDemandesList.columns.docs"),
      dataIndex: "documentsCount",
      width: 90,
      render: (v) => <Badge count={v || 0} style={{ backgroundColor: "#1677ff" }} />,
    },
    {
      title: t("adminDemandesList.columns.status"),
      dataIndex: "status",
      width: 140,
      render: (s) => <Tag color={getStatusColor(s)}>{s || "PENDING"}</Tag>,
    },
    {
      title: t("adminDemandesList.columns.actions"),
      key: "actions",
      fixed: "right",
      width: 210,
      render: (_, r) => (
        <Space wrap>
          <Link to={`/admin/demandes/${r.id}/details`}>
            <Button size="small">{t("adminDemandesList.actions.details")}</Button>
          </Link>
          <Link to={`/admin/demandes/${r.id}/documents`}>
            <Button size="small">{t("adminDemandesList.actions.documents")}</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminDemandesList.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminDemandesList.breadcrumb.dashboard")}</Link> },
              { title: t("adminDemandesList.breadcrumb.demandes") },
            ]}
          />
        </div>

        <Card className="mb-4">
          <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <Space wrap>
              <Input
                allowClear
                placeholder={t("adminDemandesList.filters.search")}
                style={{ width: 260 }}
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onPressEnter={fetchData}
                suffix={<SearchOutlined onClick={fetchData} style={{ color: "#aaa" }} />}
              />

              <Select
                allowClear
                placeholder={t("adminDemandesList.filters.status")}
                style={{ width: 180 }}
                value={filters.status}
                options={statusOptions}
                onChange={(v) => setFilters((f) => ({ ...f, status: v || undefined }))}
              />

              <Select
                allowClear
                showSearch
                placeholder={t("adminDemandesList.filters.targetOrg")}
                style={{ width: 280 }}
                value={filters.targetOrgId}
                options={orgOptions}
                onChange={(v) => setFilters((f) => ({ ...f, targetOrgId: v || undefined }))}
              />

              <Select
                allowClear
                showSearch
                placeholder={t("adminDemandesList.filters.assignedOrg")}
                style={{ width: 280 }}
                value={filters.assignedOrgId}
                options={orgOptions}
                onChange={(v) => setFilters((f) => ({ ...f, assignedOrgId: v || undefined }))}
              />

              <RangePicker
                allowClear
                onChange={(vals) => {
                  const from = vals?.[0] ? vals[0].startOf("day").toISOString() : undefined;
                  const to   = vals?.[1] ? vals[1].endOf("day").toISOString() : undefined;
                  setFilters((f) => ({ ...f, from, to }));
                }}
              />
            </Space>

            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>{t("adminDemandesList.actions.refresh")}</Button>
            </Space>
          </Space>
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
            showTotal: (total) => t("adminDemandesList.pagination.total", { total }),
          }}
          onChange={(pg, _f, sorter) => {
            setPagination({ ...pagination, current: pg.current, pageSize: pg.pageSize });
            if (sorter?.field) setSort({ field: sorter.field, order: sorter.order });
          }}
          scroll={{ x: 1280 }}
        />
      </div>
    </div>
  );
}
