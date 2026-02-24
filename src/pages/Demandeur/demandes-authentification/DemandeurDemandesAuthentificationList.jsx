"use client";
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tag, Space, Breadcrumb, Button, message } from "antd";
import { PlusOutlined, FileTextOutlined, CopyOutlined, MailOutlined } from "@ant-design/icons";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const statusColors = { EN_ATTENTE: "blue", DOCUMENTS_RECUS: "gold", TRAITEE: "green", ANNULEE: "red" };

export default function DemandeurDemandesAuthentificationList() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await demandeAuthentificationService.list({
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

  const copyCode = (codeADN) => {
    if (!codeADN) return;
    navigator.clipboard?.writeText(codeADN).then(() => message.success(t("demandesAuthentification.copied")));
  };

  const formatDate = (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—");

  const columns = [
    {
      title: t("demandesAuthentification.columns.codeADN"),
      dataIndex: "codeADN",
      width: 180,
      render: (v, r) => (
        <Space>
          <FileTextOutlined />
          <Link to={`/demandeur/demandes-authentification/${r.id}`}>{v || "—"}</Link>
          <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyCode(v)} />
        </Space>
      ),
    },
    {
      title: t("demandesAuthentification.columns.objet"),
      dataIndex: "objet",
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: t("demandesAuthentification.columns.attributedOrg"),
      dataIndex: ["attributedOrganization", "name"],
      render: (v) => v || "—",
    },
    {
      title: t("demandesAuthentification.columns.date"),
      dataIndex: "createdAt",
      width: 120,
      render: (v) => formatDate(v),
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
        <Link to={`/demandeur/demandes-authentification/${r.id}`}>
          <Button size="small">{t("demandesAuthentification.actions.detail")}</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("demandesAuthentification.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandesAuthentification.breadcrumb.dashboard")}</Link> },
              { title: t("demandesAuthentification.breadcrumb.list") },
            ]}
          />
        </div>
        <div className="mb-4 flex justify-end">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/demandeur/demandes-authentification/create")}>
            {t("demandesAuthentification.createBtn")}
          </Button>
        </div>
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
