


/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tag, Space, Breadcrumb, Button, Input, Select, message } from "antd";
import { SearchOutlined, PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import demandeService from "@/services/demandeService";
import organizationService from "@/services/organizationservice";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const statusColor = (s) =>
  s === "VALIDATED" ? "green" :
  s === "REJECTED" ? "red" :
  s === "IN_PROGRESS" ? "gold" : "blue";

export default function DemandeurDemandesList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user: me } = useAuth();

  // Données & états
  const [rows, setRows] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sort, setSort] = useState({ field: "dateDemande", order: "descend" });

  // Filtres avancés
  const [filters, setFilters] = useState({
    search: "",
    status: null,
    targetOrgId: null,
    periode: null,
    year: null,
  });

  // Options i18n
  const STATUS_OPTIONS = useMemo(() => ([
    { value: "PENDING", label: t("demandeurDemandes.status.PENDING") },
    { value: "IN_PROGRESS", label: t("demandeurDemandes.status.IN_PROGRESS") },
    { value: "VALIDATED", label: t("demandeurDemandes.status.VALIDATED") },
    { value: "REJECTED", label: t("demandeurDemandes.status.REJECTED") },
  ]), [t]);

  const PERIODES = useMemo(() => ([
    { value: "FALL", label: t("demandeurDemandes.periods.FALL") },
    { value: "WINTER", label: t("demandeurDemandes.periods.WINTER") },
    { value: "SPRING", label: t("demandeurDemandes.periods.SPRING") },
    { value: "SUMMER", label: t("demandeurDemandes.periods.SUMMER") },
  ]), [t]);

  // Année courante + 10 ans
  const YEAR_OPTIONS = useMemo(() => {
    const start = dayjs().year();
    return Array.from({ length: 11 }, (_, i) => {
      const y = String(start + i);
      return { value: y, label: y };
    });
  }, []);

  // Charger les organisations (pour le filtre)
  useEffect(() => {
    (async () => {
      try {
        const res = await organizationService.list({ limit: 500 });
        const all = res?.organizations ?? res?.data?.organizations ?? [];
        setOrgs(all.filter((o) => o.type !== "TRADUCTEUR"));
      } catch (e) {
        message.error(t("demandeurDemandes.toasts.orgLoadError"));
      }
    })();
  }, [t]);

  // Charger la liste des demandes
  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      search: filters.search || undefined,
      status: filters.status || undefined,
      targetOrgId: filters.targetOrgId || undefined,
      periode: filters.periode || undefined,
      year: filters.year || undefined,
      sortBy: sort.field,
      sortOrder: sort.order === "ascend" ? "asc" : "desc",
    };

    try {
      const res = await demandeService.getDemandesDemandeurSimple(me.id, params);
      const payload = res?.data || res;
      setRows(payload.demandes || []);
      setPagination((p) => ({ ...p, total: payload.pagination?.total || 0 }));
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("demandeurDemandes.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [filters, sort, pagination.current, pagination.pageSize, me?.id, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilters({ search: "", status: null, targetOrgId: null, periode: null, year: null });
    setPagination((p) => ({ ...p, current: 1 }));
  };

  const formatDate = (v) => (v ? new Date(v).toLocaleDateString(i18n.language || "fr-FR") : t("demandeurDemandes.common.na"));

  const columns = [
    {
      title: t("demandeurDemandes.columns.code"),
      dataIndex: "code",
      sorter: true,
      render: (v, r) => (
        <Space>
          <FileTextOutlined />
          <Link to={`/demandeur/mes-demandes/${r.id}/details`}>{v || t("demandeurDemandes.common.na")}</Link>
        </Space>
      ),
      width: 160,
    },
    {
      title: t("demandeurDemandes.columns.date"),
      dataIndex: "dateDemande",
      sorter: true,
      render: (v) => formatDate(v),
      width: 130,
    },
    {
      title: t("demandeurDemandes.columns.targetOrg"),
      dataIndex: ["targetOrg", "name"],
      render: (_, r) =>
        (r.targetOrg?.id && r.targetOrg?.name) ? (
          <Tag>
            <Link to={`/demandeur/organisation/${r.targetOrg?.id}/details`}>{r.targetOrg?.name}</Link>
          </Tag>
        ) : t("demandeurDemandes.common.na"),
    },
    {
      title: t("demandeurDemandes.columns.periode"),
      dataIndex: "periode",
      width: 120,
      render: (v) => v ? t(`demandeurDemandes.periods.${v}`) : t("demandeurDemandes.common.na"),
    },
    {
      title: t("demandeurDemandes.columns.year"),
      dataIndex: "year",
      width: 100,
      render: (v) => v || t("demandeurDemandes.common.na"),
    },
    {
      title: t("demandeurDemandes.columns.docs"),
      dataIndex: "documentsCount",
      width: 90,
      render: (v) => v ?? 0,
    },
    {
      title: t("demandeurDemandes.columns.status"),
      dataIndex: "status",
      width: 130,
      render: (s) => <Tag color={statusColor(s)}>{t(`demandeurDemandes.status.${s || "PENDING"}`)}</Tag>,
    },
    {
      title: t("demandeurDemandes.columns.actions"),
      key: "actions",
      width: 260,
      render: (_, r) => (
        <Space size="small" wrap>
          <Link to={`/demandeur/mes-demandes/${r.id}/details`}>
            <Button size="small">{t("demandeurDemandes.actions.details")}</Button>
          </Link>
          <Link to={`/demandeur/mes-demandes/${r.id}/documents`}>
            <Button size="small">{t("demandeurDemandes.actions.documents")}</Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("demandeurDemandes.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandeurDemandes.breadcrumb.dashboard")}</Link> },
              { title: t("demandeurDemandes.breadcrumb.mine") },
            ]}
          />
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex gap-3 flex-col md:flex-row md:items-center">
            <Input.Search
              placeholder={t("demandeurDemandes.filters.searchPlaceholder")}
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(v) => {
                setFilters((f) => ({ ...f, search: v }));
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              className="w-full md:w-72"
            />

            <Select
              placeholder={t("demandeurDemandes.filters.orgPlaceholder")}
              allowClear
              className="w-64"
              options={orgs.map((o) => ({ value: o.id, label: `${o.name} — ${o.type}` }))}
              value={filters.targetOrgId || undefined}
              onChange={(v) => {
                setFilters((f) => ({ ...f, targetOrgId: v || null }));
                setPagination((p) => ({ ...p, current: 1 }));
              }}
            />

            <Select
              placeholder={t("demandeurDemandes.filters.periodePlaceholder")}
              allowClear
              className="w-48"
              options={PERIODES}
              value={filters.periode || undefined}
              onChange={(v) => {
                setFilters((f) => ({ ...f, periode: v || null }));
                setPagination((p) => ({ ...p, current: 1 }));
              }}
            />

            <Select
              placeholder={t("demandeurDemandes.filters.yearPlaceholder")}
              allowClear
              className="w-40"
              options={YEAR_OPTIONS}
              value={filters.year || undefined}
              onChange={(v) => {
                setFilters((f) => ({ ...f, year: v || null }));
                setPagination((p) => ({ ...p, current: 1 }));
              }}
            />

            <Select
              placeholder={t("demandeurDemandes.filters.statusPlaceholder")}
              allowClear
              className="w-48"
              options={STATUS_OPTIONS}
              value={filters.status || undefined}
              onChange={(v) => {
                setFilters((f) => ({ ...f, status: v || null }));
                setPagination((p) => ({ ...p, current: 1 }));
              }}
            />

            <Space className="ml-auto">
              <Button onClick={resetFilters}>{t("demandeurDemandes.filters.reset")}</Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/demandeur/mes-demandes/create")}
              >
                {t("demandeurDemandes.filters.new")}
              </Button>
            </Space>
          </div>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={columns}
          pagination={{ ...pagination, showSizeChanger: true, pageSizeOptions: ["5", "10", "20", "50"] }}
          onChange={(pg, _f, sorter) => {
            setPagination({ ...pagination, current: pg.current, pageSize: pg.pageSize });
            if (sorter?.field) setSort({ field: sorter.field, order: sorter.order });
          }}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
}
