/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Table, Tag, Space, Button, Input, DatePicker, Select, Typography, message, Breadcrumb } from "antd";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import { useAuth } from "../../../hooks/useAuth";
import { PlusOutlined, FileAddOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function DossierATraiterTraducteur() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth(); // doit exposer organization.id
  const orgId = user?.organization?.id;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    from: undefined,
    to: undefined,
    sortBy: "dateDemande",
    sortOrder: "desc",
  });

  const fetchData = async (page = pagination.page, limit = pagination.limit) => {
    if (!orgId) return;
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        search: filters.search || undefined,
        status: filters.status || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
        targetOrgId: orgId,
      };
      const res = await demandeService.listATraiter(orgId, params);
      console.log(res);
      setRows(res?.demandes || []);
      setPagination({
        page: res?.pagination?.page ?? page,
        limit: res?.pagination?.limit ?? limit,
        total: res?.pagination?.total ?? 0,
      });
    } catch (e) {
      message.error(e?.message || t("institutDossier.messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const columns = useMemo(
    () => [
      {
        title: t("institutDossier.columns.code"),
        dataIndex: "code",
        render: (v, r) => <Link to={`/organisations/demandes/${r.id}`}>{v || "—"}</Link>,
        width: 160,
      },
      { title: t("institutDossier.columns.date"), dataIndex: "dateDemande", render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"), width: 140 },
      { title: t("institutDossier.columns.demandeur"), key: "user", render: (_, r) => r.user?.email || r.user?.username || "—" },
      { title: t("institutDossier.columns.assigned"), key: "assigned", render: (_, r) => r.assignedOrg?.name || "—" },
      { title: t("institutDossier.columns.docs"), dataIndex: "documentsCount", width: 90 },
      {
        title: t("institutDossier.columns.status"),
        dataIndex: "status",
        render: (s) => <Tag color={s === "VALIDATED" ? "green" : s === "REJECTED" ? "red" : s === "IN_PROGRESS" ? "blue" : "default"}>{s || "PENDING"}</Tag>,
        width: 140,
      },
      {
        title: t("institutDossier.columns.actions"),
        key: "actions",
        fixed: "right",
        width: 220,
        render: (_, r) => (
          <Space>
            <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/organisations/demandes/${r.id}/details`)}>
              {t("institutDossier.buttons.details")}
            </Button>
            <Button
              size="small"
              type="primary"
              icon={<FileAddOutlined />}
              onClick={() => navigate(`/organisations/demandes/${r.id}/documents/add`)}
            >
              {t("institutDossier.buttons.addDocument")}
            </Button>
          </Space>
        ),
      },
    ],
    [navigate, t]
  );

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("institutDossier.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutDossier.breadcrumbs.dashboard")}</Link> },
              { title: t("institutDossier.breadcrumbs.demandes") },
            ]}
          />
        </div>

        <div className="p-2 md:p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Title level={3} className="!mb-0">
              {t("institutDossier.title")}
            </Title>
          </div>

          <Card className="mt-3" title={t("institutDossier.filters.title")}>
            <Space wrap>
              <Input
                placeholder={t("institutDossier.filters.searchPlaceholder")}
                value={filters.search}
                allowClear
                prefix={<SearchOutlined />}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                style={{ minWidth: 280 }}
              />
              <Select
                allowClear
                placeholder={t("institutDossier.filters.statusPlaceholder")}
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                style={{ width: 200 }}
                options={["PENDING", "VALIDATED", "REJECTED", "IN_PROGRESS"].map((s) => ({ label: s, value: s }))}
              />
              <RangePicker
                placeholder={["Date début", "Date fin"]}
                onChange={(v) =>
                  setFilters((f) => ({
                    ...f,
                    from: v?.[0]?.startOf("day")?.toISOString(),
                    to: v?.[1]?.endOf("day")?.toISOString(),
                  }))
                }
              />
              <Select
                value={filters.sortBy}
                onChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))}
                style={{ width: 200 }}
                options={[
                  { value: "dateDemande", label: t("institutDossier.filters.sortBy.dateDemande") },
                  { value: "createdAt", label: t("institutDossier.filters.sortBy.createdAt") },
                  { value: "updatedAt", label: t("institutDossier.filters.sortBy.updatedAt") },
                  { value: "code", label: t("institutDossier.filters.sortBy.code") },
                ]}
              />
              <Select
                value={filters.sortOrder}
                onChange={(v) => setFilters((f) => ({ ...f, sortOrder: v }))}
                style={{ width: 140 }}
                options={[
                  { value: "asc", label: t("institutDossier.filters.sortOrder.asc") },
                  { value: "desc", label: t("institutDossier.filters.sortOrder.desc") },
                ]}
              />
              <Button type="primary" onClick={() => fetchData(1, pagination.limit)}>
                {t("institutDossier.filters.buttons.apply")}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setFilters({ search: "", status: undefined, from: undefined, to: undefined, sortBy: "dateDemande", sortOrder: "desc" });
                  fetchData(1, pagination.limit);
                }}
              >
                {t("institutDossier.filters.buttons.reset")}
              </Button>
            </Space>
          </Card>

          <Card className="mt-3" title={t("institutDossier.list.title")}>
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
                showSizeChanger: true,
              }}
              scroll={{ x: true }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
