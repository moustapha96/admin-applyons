


/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tag, Space, Avatar, Breadcrumb, Button, Input, Select, message, Modal } from "antd";
import { UserOutlined, SearchOutlined } from "@ant-design/icons";
import { PiPlusDuotone } from "react-icons/pi";
import { useAuth } from "../../../hooks/useAuth";
import userService from "@/services/userService";
import { getPermissionLabel, PERMS } from "@/auth/permissions";
import { useTranslation } from "react-i18next";

/** Liste des users LIMITÉE à l'organisation du user connecté (institut) */
export default function UserListTraducteur() {
  const { t } = useTranslation();
  const { user: me } = useAuth();
  const orgId = me?.organization?.id;
  console.log(me)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", role: null, status: null, permissions: null });
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", order: "descend" });
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        organizationId: orgId,               // <-- filtre org
        search: filters.search || undefined,
        role: filters.role || undefined,
        status: filters.status || undefined,
        sortBy: sortConfig.field,
        sortOrder: sortConfig.order === "ascend" ? "asc" : "desc",
      };
      const res = await userService.list(params);  // modèle list admin harmonisé ici
      setUsers(res.users || []);
      setPagination((p) => ({ ...p, total: res.pagination?.total || 0 }));
    } catch (e) {
      message.error(e?.message || t("traducteurUsers.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [orgId, pagination.current, pagination.pageSize, filters, sortConfig]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleTableChange = (newPagination, _, sorter) => {
    setPagination({ ...pagination, current: newPagination.current, pageSize: newPagination.pageSize });
    if (sorter && sorter.field) setSortConfig({ field: sorter.field, order: sorter.order });
  };


  const statusOptions = [
    { value: "ACTIVE", label: t("traducteurUsers.status.ACTIVE") },
    { value: "INACTIVE", label: t("traducteurUsers.status.INACTIVE") },
  ];
  const permissionsOptions = Object.entries(PERMS).map(([_, key]) => ({ value: key, label: getPermissionLabel(key, t) }));

  const columns = [
    {
      title: t("traducteurUsers.columns.fullName"),
      dataIndex: ["firstName", "lastName"],
      key: "name",
      sorter: true,
      render: (_, r) => (
        <Space>
          <Avatar size="default" icon={<UserOutlined />} src={r.avatar} />
          <Link to={`/traducteur/users/${r.id}/details`}>{(r.firstName || "") + " " + (r.lastName || "")}</Link>
        </Space>
      ),
    },
    { title: t("traducteurUsers.columns.email"), dataIndex: "email", key: "email", sorter: true },
    { title: t("traducteurUsers.columns.phone"), dataIndex: "phone", key: "phone", render: (v) => v || t("traducteurUsers.common.na") },
    {
      title: t("traducteurUsers.columns.role"),
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={
          role === "SUPERVISEUR" ? "purple" :
            role === "INSTITUT" ? "blue" :
              role === "TRADUCTEUR" ? "cyan" : "green"
        }>{role}</Tag>
      ),
    },
    {
      title: t("traducteurUsers.columns.status"),
      dataIndex: "enabled",
      key: "status",
      render: (enabled) => <Tag color={enabled ? "green" : "red"}>{enabled ? t("traducteurUsers.status.ACTIVE") : t("traducteurUsers.status.INACTIVE")}</Tag>,
    },
    {
      title: t("traducteurUsers.columns.actions"),
      key: "actions",
      render: (_, r) => (
        <Space size="middle">
          <Link to={`/traducteur/users/${r.id}/details`}>{t("traducteurUsers.actions.details")}</Link>
          <Link to={`/traducteur/users/${r.id}/edit`}>{t("traducteurUsers.actions.edit")}</Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("traducteurUsers.title")}</h5>
          <Breadcrumb 
          items={[
            { title: <Link to="/traducteur/dashboard">{t("traducteurUsers.breadcrumb.dashboard")}</Link> },
            { title: t("traducteurUsers.breadcrumb.users") }]} />
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div className="w-full md:flex-1">
              <Input.Search placeholder={t("traducteurUsers.filters.search")} allowClear enterButton={<SearchOutlined />}
                size="large" onSearch={(v) => { setFilters({ ...filters, search: v }); setPagination({ ...pagination, current: 1 }); }} />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto justify-start md:justify-end">

              <Select placeholder={t("traducteurUsers.filters.status")} allowClear className="w-full sm:w-44"
                onChange={(v) => { setFilters({ ...filters, status: v }); setPagination({ ...pagination, current: 1 }); }}
                options={statusOptions} />
              <Select placeholder={t("traducteurUsers.filters.permission")} allowClear className="w-full sm:w-56" showSearch
                onChange={(v) => { setFilters({ ...filters, permissions: v }); setPagination({ ...pagination, current: 1 }); }}
                options={permissionsOptions} />
              <Button onClick={() => { setFilters({ search: "", role: null, status: null, permissions: null }); setPagination({ ...pagination, current: 1 }); }}>
                {t("common.reset")}
              </Button>
            </div>
            <div className="w-full md:w-auto flex justify-start md:justify-end">
              <Button type="primary" onClick={() => navigate("/traducteur/users/create")} icon={<PiPlusDuotone />} className="w-full sm:w-auto">
                {t("traducteurUsers.actions.new")}
              </Button>
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination, showSizeChanger: true, pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total) => `Total ${total} ${t("traducteurUsers.breadcrumb.users").toLowerCase()}`,
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
          className="responsive-table"
        />
      </div>
    </div>
  );
}
