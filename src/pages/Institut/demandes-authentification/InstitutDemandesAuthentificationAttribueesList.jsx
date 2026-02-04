"use client";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Button, message } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

export default function InstitutDemandesAuthentificationAttribueesList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await demandeAuthentificationService.listAttributed({
        page: pagination.current,
        limit: pagination.pageSize,
      });
      const data = res?.demandes ?? res?.data?.demandes ?? [];
      const pag = res?.pagination ?? res?.data?.pagination ?? {};
      setRows(Array.isArray(data) ? data : []);
      setPagination((p) => ({ ...p, total: pag.total || 0 }));
    } catch (e) {
      message.error(e?.message || t("demandesAuthentification.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    {
      title: t("demandesAuthentification.columns.codeADN"),
      dataIndex: "codeADN",
      width: 180,
      render: (v, r) => (
        <Link to={`/organisations/demandes-authentification/${r.id}`}>
          <FileTextOutlined className="mr-1" />
          {v || "—"}
        </Link>
      ),
    },
    {
      title: t("demandesAuthentification.columns.objet"),
      dataIndex: "objet",
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: t("demandesAuthentification.columns.demandeur"),
      render: (_, r) => {
        const u = r.user;
        if (!u) return "—";
        return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "—";
      },
    },
    {
      title: t("demandesAuthentification.columns.date"),
      dataIndex: "createdAt",
      width: 120,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
    },
    {
      title: t("demandesAuthentification.columns.status"),
      dataIndex: "status",
      width: 130,
      render: (s) => (
        <Tag color={statusColors[s] || "default"}>{t(`demandesAuthentification.status.${s || "EN_ATTENTE"}`)}</Tag>
      ),
    },
    {
      title: t("demandesAuthentification.columns.documents"),
      dataIndex: ["_count", "documents"],
      width: 90,
      render: (v) => v ?? 0,
    },
    {
      title: t("demandesAuthentification.columns.actions"),
      key: "actions",
      width: 120,
      render: (_, r) => (
        <Link to={`/organisations/demandes-authentification/${r.id}`}>
          <Button size="small">{t("demandesAuthentification.actions.detail")}</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <h5 className="text-lg font-semibold mb-4">{t("demandesAuthentification.attributedTitle")}</h5>
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
            pageSizeOptions: ["5", "10", "20"],
            onChange: (page, pageSize) => setPagination((p) => ({ ...p, current: page, pageSize: pageSize || p.pageSize })),
          }}
          scroll={{ x: true }}
        />
      </div>
    </div>
  );
}
