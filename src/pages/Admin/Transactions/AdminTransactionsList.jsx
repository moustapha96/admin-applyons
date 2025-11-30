/* eslint-disable react/no-unescaped-entities */
"use client";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb, Button, Card, DatePicker, Input, Select, Space, Table, Tag, message, Popconfirm
} from "antd";
import { SearchOutlined, ReloadOutlined, PlusOutlined, StopOutlined, RollbackOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import transactionService from "../../../services/transactionService";
import { useTranslation } from "react-i18next";

const { RangePicker } = DatePicker;

export default function AdminTransactionsList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    statut: undefined,
    from: null,
    to: null,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await transactionService.list({
        page: pagination.current,
        limit: pagination.pageSize,
        statut: filters.statut || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      });
      setRows(res?.transactions || []);
      setPagination((p) => ({ ...p, total: res?.pagination?.total || 0 }));
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminTransactions.messages.loadError"));
    } finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, filters, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const archive = async (id) => {
    try { await transactionService.archive(id); message.success(t("adminTransactions.messages.archiveSuccess")); fetchData(); }
    catch (e) { message.error(e?.response?.data?.message || t("adminTransactions.messages.archiveError")); }
  };

  const restore = async (id) => {
    try { await transactionService.restore(id); message.success(t("adminTransactions.messages.restoreSuccess")); fetchData(); }
    catch (e) { message.error(e?.response?.data?.message || t("adminTransactions.messages.restoreError")); }
  };

  const columns = [
    {
      title: t("adminTransactions.columns.date"), dataIndex: "dateTransaction", sorter: false, width: 170,
      render: (v) => v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—",
    },
    {
      title: t("adminTransactions.columns.demande"), dataIndex: ["demandePartage","code"], width: 150,
      render: (_, r) => r.demandePartage
        ? <Link to={`/admin/demandes/${r.demandePartage.id}/details`}>{r.demandePartage.code}</Link>
        : "—",
    },
    {
      title: t("adminTransactions.columns.amount"), dataIndex: "montant", width: 140,
      render: (v) => `${Number(v || 0).toLocaleString()} USD`,
    },
    { title: t("adminTransactions.columns.paymentType"), dataIndex: "typePaiement", width: 160 },
    { title: t("adminTransactions.columns.transactionType"), dataIndex: "typeTransaction", width: 160, render: (v)=> v || "—" },
    {
      title: t("adminTransactions.columns.status"), dataIndex: "statut", width: 140,
      render: (s) => {
        const color = s === "COMPLETED" ? "green" : s === "FAILED" ? "red" : "gold";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: t("adminTransactions.columns.actions"), fixed: "right", width: 220,
      render: (_, r) => (
        <Space>
          <Link to={`/admin/transactions/${r.id}/details`}>{t("adminTransactions.actions.details")}</Link>
          {!r.isDeleted ? (
            <Popconfirm title={t("adminTransactions.confirmArchive")} onConfirm={() => archive(r.id)}>
              <Button size="small" icon={<StopOutlined />} danger>{t("adminTransactions.actions.archive")}</Button>
            </Popconfirm>
          ) : (
            <Button size="small" icon={<RollbackOutlined />} onClick={() => restore(r.id)}>{t("adminTransactions.actions.restore")}</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminTransactions.title")}</h5>
          <Breadcrumb items={[{ title: <Link to="/admin/dashboard">{t("adminTransactions.breadcrumb.dashboard")}</Link> }, { title: t("adminTransactions.breadcrumb.transactions") }]} />
        </div>

        <Card className="mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <Input
              allowClear
              placeholder={t("adminTransactions.filters.search")}
              prefix={<SearchOutlined />}
              className="md:w-72"
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              disabled
            />
            <Select
              allowClear placeholder={t("adminTransactions.filters.status")}
              className="md:w-56"
              options={[
                { value: "PENDING", label: t("adminTransactions.status.PENDING") },
                { value: "COMPLETED", label: t("adminTransactions.status.COMPLETED") },
                { value: "FAILED", label: t("adminTransactions.status.FAILED") },
              ]}
              onChange={(v) => setFilters((f) => ({ ...f, statut: v || undefined }))}
            />
            <RangePicker
              onChange={(vals) => {
                setFilters((f) => ({
                  ...f,
                  from: vals?.[0]?.startOf("day").toISOString() || null,
                  to: vals?.[1]?.endOf("day").toISOString() || null,
                }));
              }}
            />
            <Space className="ml-auto">
              <Button icon={<ReloadOutlined />} onClick={fetchData}>{t("adminTransactions.actions.refresh")}</Button>
              <Link to="/admin/transactions/create"><Button type="primary" icon={<PlusOutlined />}>{t("adminTransactions.actions.new")}</Button></Link>
            </Space>
          </div>
        </Card>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: 1000 }}
          pagination={{ ...pagination, showSizeChanger: true }}
          onChange={(pg)=> setPagination((p)=> ({ ...p, current: pg.current, pageSize: pg.pageSize }))}
        />
      </div>
    </div>
  );
}
