"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Breadcrumb, Button, Card, Input, Select, Space, Table, Tag, Typography, message } from "antd";
import { PlusOutlined, ReloadOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import departmentService from "@/services/departmentService";
import organizationService from "@/services/organizationService";
import { useOrgScope } from "@/hooks/useOrgScope";

const { Title } = Typography;

// Ajuste ici si tes routes ne sont pas sous /admin
const BASE_PATH = "/admin/departments";

export default function DepartmentList() {
  const { t } = useTranslation();
  const { isAdmin, organizationId: scopedOrgId } = useOrgScope?.() ?? { isAdmin: true, organizationId: undefined };

  const [rows, setRows] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pag, setPag] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sorter, setSorter] = useState({ sortBy: "name", sortOrder: "asc" });
  const [filters, setFilters] = useState({
    search: "",
    organizationId: isAdmin ? undefined : scopedOrgId,
    withOrg: "true", // le back accepte la string "true" | "false"
  });

  const fetchOrgs = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await organizationService.list({ limit: 500, sortBy: "name", sortOrder: "asc" });
      setOrgs(res?.organizations ?? []);
    } catch (e) {
      message.error(e?.response?.data?.message || "Erreur chargement organisations");
    }
  }, [isAdmin]);

  const fetch = useCallback(
    async (page = pag.current, pageSize = pag.pageSize, sort = sorter, f = filters) => {
      setLoading(true);
      try {
        const res = await departmentService.list({
          page,
          limit: pageSize,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
          withOrg: f.withOrg, // "true" pour inclure organization
          search: f.search || undefined,
          organizationId: f.organizationId || undefined,
        });
        setRows(res?.departments ?? []);
        setPag({ current: page, pageSize, total: res?.pagination?.total ?? 0 });
      } catch (e) {
        message.error(e?.response?.data?.message || t("adminDepartmentList.messages.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [pag.current, pag.pageSize, sorter, filters, t]
  );

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  useEffect(() => {
    fetch(1, pag.pageSize, sorter, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.organizationId, filters.search, sorter.sortBy, sorter.sortOrder]);

  const columns = useMemo(
    () => [
      {
        title: t("adminDepartmentList.columns.name"),
        dataIndex: "name",
        sorter: true,
        render: (v, r) => r?.id ? <Link to={`${BASE_PATH}/${r.id}`}>{v}</Link> : v,
      },
      { title: t("adminDepartmentList.columns.code"), dataIndex: "code", sorter: true, width: 140, render: (v) => v || t("adminDepartmentList.dash") },
      {
        title: t("adminDepartmentList.columns.organization"),
        dataIndex: ["organization", "name"],
        render: (_, r) => r?.organization?.name || t("adminDepartmentList.dash"),
      },
      {
        title: t("adminDepartmentList.columns.filieres"),
        dataIndex: "filiereCount",
        width: 120,
        render: (v) => <Tag color="blue">{v ?? 0}</Tag>,
      },
      {
        title: t("adminDepartmentList.columns.actions"),
        key: "actions",
        width: 280,
        render: (_, r) => {
          if (!r?.id) return t("adminDepartmentList.dash");
          return (
            <Space wrap>
              <Link to={`${BASE_PATH}/${r.id}`}>
                <Button size="small">{t("adminDepartmentList.actions.details")}</Button>
              </Link>
              <Link to={`${BASE_PATH}/${r.id}/edit`}>
                <Button size="small">{t("adminDepartmentList.actions.edit")}</Button>
              </Link>
              <Link to={`${BASE_PATH}/${r.id}/filieres`}>
                <Button size="small">{t("adminDepartmentList.actions.filieres")}</Button>
              </Link>
            </Space>
          );
        },
      },
    ],
    [t]
  );

  const onTableChange = (pagination, _filters, sort) => {
    const order = sort.order === "ascend" ? "asc" : "desc";
    const allowed = ["name", "code", "createdAt", "updatedAt"];
    const by = sort.field && allowed.includes(sort.field) ? sort.field : "name";
    const next = { sortBy: by, sortOrder: order };
    setSorter(next);
    fetch(pagination.current, pagination.pageSize, next, filters);
  };


  return (

     <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminDepartmentList.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminDepartmentList.breadcrumb.dashboard")}</Link> },
              { title: t("adminDepartmentList.breadcrumb.departments") },
            ]}
          />
        </div>


    <Card>
      <Space className="mb-4" style={{ width: "100%", justifyContent: "space-between" }}>
        <Title level={4} style={{ margin: 0 }}>
          {t("adminDepartmentList.pageTitle")}
        </Title>
        <Space wrap>
          <Input.Search
            placeholder={t("adminDepartmentList.filters.searchPlaceholder")}
            allowClear
            onSearch={(v) => setFilters((s) => ({ ...s, search: v }))}
            onChange={(e) => setFilters((s) => ({ ...s, search: e.target.value }))}
            style={{ width: 260 }}
          />
          {isAdmin && (
            <Select
              allowClear
              placeholder={t("adminDepartmentList.filters.organizationPlaceholder")}
              style={{ width: 280 }}
              value={filters.organizationId}
              onChange={(v) => setFilters((s) => ({ ...s, organizationId: v || undefined }))}
              options={orgs.filter(o => o?.id).map((o) => ({ value: o.id, label: `${o.name} — ${o.type}` }))}
            />
          )}
          <Button icon={<ReloadOutlined />} onClick={() => fetch()} />
         
        </Space>
      </Space>

      <Table
        rowKey={(record) => record?.id || Math.random()}
        dataSource={rows.filter(r => r != null)}
        loading={loading}
        columns={columns}
        pagination={{ current: pag.current, pageSize: pag.pageSize, total: pag.total, showSizeChanger: true }}
        onChange={onTableChange}
      />
    </Card>

    </div>
    </div>
  );
}
