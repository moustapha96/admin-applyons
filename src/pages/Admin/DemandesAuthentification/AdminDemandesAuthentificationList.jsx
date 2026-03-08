"use client";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Table, Tag, Space, Breadcrumb, Button, Input, Select, message, Card } from "antd";
import { SearchOutlined, ReloadOutlined, FileTextOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

function buildCsvLine(arr) {
  return arr.map((v) => (v == null ? "" : String(v).replace(/"/g, '""'))).map((v) => `"${v}"`).join(",");
}

export default function AdminDemandesAuthentificationList() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const urlStatus = searchParams.get("status") || undefined;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: urlStatus });

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

  useEffect(() => {
    if (urlStatus !== undefined && urlStatus !== filters.status) {
      setFilters((f) => ({ ...f, status: urlStatus }));
    }
  }, [urlStatus]);

  const exportCsv = () => {
    const headers = [
      t("adminDemandesAuthentification.columns.codeADN"),
      t("adminDemandesAuthentification.columns.objet"),
      t("adminDemandesAuthentification.columns.demandeur"),
      t("adminDemandesAuthentification.columns.attributedOrg"),
      t("adminDemandesAuthentification.columns.date"),
      t("adminDemandesAuthentification.columns.status"),
      t("adminDemandesAuthentification.columns.documents"),
    ];
    const lines = [
      "\uFEFF" + buildCsvLine(headers),
      ...rows.map((r) => {
        const name = r.user ? [r.user.firstName, r.user.lastName].filter(Boolean).join(" ") || r.user?.email : "";
        const statusLabel = t(`demandesAuthentification.status.${r.status}`);
        return buildCsvLine([
          r.codeADN,
          r.objet || "",
          name,
          r.attributedOrganization?.name || "",
          r.createdAt ? dayjs(r.createdAt).format("DD/MM/YYYY") : "",
          statusLabel,
          r._count?.documents ?? r.documents?.length ?? 0,
        ]);
      }),
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `demandes-authentification-${dayjs().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    message.success(t("adminDemandesAuthentification.export.success"));
  };

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
            <Space>
              <Button icon={<DownloadOutlined />} onClick={exportCsv} disabled={rows.length === 0}>
                {t("adminDemandesAuthentification.actions.exportCsv")}
              </Button>
              <Link to="/admin/demandes-authentification/stats">
                <Button>{t("adminDemandesAuthentification.actions.stats")}</Button>
              </Link>
              <Button icon={<ReloadOutlined />} onClick={fetchData}>
                {t("adminDemandesAuthentification.actions.refresh")}
              </Button>
            </Space>
          </Space>
        </Card>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={columns}
          locale={{ emptyText: t("adminDemandesAuthentification.empty") }}
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
