"use client";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Space, Breadcrumb, Button, Input, Select, message, Card } from "antd";
import { SearchOutlined, ReloadOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

export default function AdminDemandesAuthentificationList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: undefined });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
      };
      const res = await demandeAuthentificationService.listAll(params);
      const data = res?.demandes ?? res?.data?.demandes ?? [];
      const pag = res?.pagination ?? res?.data?.pagination ?? {};
      setRows(Array.isArray(data) ? data : []);
      setPagination((p) => ({ ...p, total: pag.total || 0 }));
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminDemandesAuthentification.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters.search, filters.status, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—");

  const columns = [
    {
      title: t("adminDemandesAuthentification.columns.codeADN"),
      dataIndex: "codeADN",
      width: 180,
      render: (v, r) => (
        <Space>
          <FileTextOutlined />
          <Link to={`/admin/demandes-authentification/${r.id}`}>{v || "—"}</Link>
        </Space>
      ),
    },
    {
      title: t("adminDemandesAuthentification.columns.objet"),
      dataIndex: "objet",
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: t("adminDemandesAuthentification.columns.demandeur"),
      key: "demandeur",
      render: (_, r) => {
        const u = r.user;
        const name = u ? [u.firstName, u.lastName].filter(Boolean).join(" ") : null;
        return name || u?.email || "—";
      },
    },
    {
      title: t("adminDemandesAuthentification.columns.attributedOrg"),
      dataIndex: ["attributedOrganization", "name"],
      render: (v) => v || "—",
    },
    {
      title: t("adminDemandesAuthentification.columns.date"),
      dataIndex: "createdAt",
      width: 120,
      render: formatDate,
    },
    {
      title: t("adminDemandesAuthentification.columns.status"),
      dataIndex: "status",
      width: 140,
      render: (s) => (
        <Tag color={statusColors[s] || "default"}>{t(`demandesAuthentification.status.${s}`)}</Tag>
      ),
    },
    {
      title: t("adminDemandesAuthentification.columns.documents"),
      key: "documents",
      width: 100,
      render: (_, r) => r._count?.documents ?? r.documents?.length ?? 0,
    },
    {
      title: t("adminDemandesAuthentification.columns.actions"),
      key: "actions",
      width: 120,
      render: (_, r) => (
        <Link to={`/admin/demandes-authentification/${r.id}`}>
          <Button size="small">{t("adminDemandesAuthentification.actions.detail")}</Button>
        </Link>
      ),
    },
  ];

  const statusOptions = [
    { value: "EN_ATTENTE", label: t("demandesAuthentification.status.EN_ATTENTE") },
    { value: "DOCUMENTS_RECUS", label: t("demandesAuthentification.status.DOCUMENTS_RECUS") },
    { value: "TRAITEE", label: t("demandesAuthentification.status.TRAITEE") },
    { value: "ANNULEE", label: t("demandesAuthentification.status.ANNULEE") },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminDemandesAuthentification.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminDemandesAuthentification.breadcrumb.dashboard")}</Link> },
              { title: t("adminDemandesAuthentification.breadcrumb.list") },
            ]}
          />
        </div>

        <Card className="mb-4">
          <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <Space wrap>
              <Input
                allowClear
                placeholder={t("adminDemandesAuthentification.filters.search")}
                style={{ width: 260 }}
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onPressEnter={fetchData}
                suffix={<SearchOutlined onClick={fetchData} style={{ color: "#aaa" }} />}
              />
              <Select
                allowClear
                placeholder={t("adminDemandesAuthentification.filters.status")}
                style={{ width: 180 }}
                value={filters.status}
                options={statusOptions}
                onChange={(v) => setFilters((f) => ({ ...f, status: v || undefined }))}
              />
            </Space>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              {t("adminDemandesAuthentification.actions.refresh")}
            </Button>
          </Space>
        </Card>

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
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => t("adminDemandesAuthentification.pagination.total", { total }),
          }}
          onChange={(pg) => setPagination((p) => ({ ...p, current: pg.current, pageSize: pg.pageSize || p.pageSize }))}
        />
      </div>
    </div>
  );
}
