"use client";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Space, Breadcrumb, Button, Input, Select, message, Card, Modal, Spin } from "antd";
import { SearchOutlined, ReloadOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";

const DOC_TYPE_KEYS = ["DIPLOMA", "TRANSCRIPT", "ID_CARD", "BIRTH_CERTIFICATE", "PASSPORT", "CERTIFICATE", "LETTER", "OTHER"];

export default function AdminDemandesAuthentificationDocumentsList() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: "", type: undefined });
  const [viewingDoc, setViewingDoc] = useState(null);
  const [openingDoc, setOpeningDoc] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search || undefined,
        type: filters.type || undefined,
      };
      const res = await demandeAuthentificationService.listAllDocuments(params);
      const data = res?.documents ?? res?.data?.documents ?? [];
      const pag = res?.pagination ?? res?.data?.pagination ?? {};
      setRows(Array.isArray(data) ? data : []);
      setPagination((p) => ({ ...p, total: pag.total || 0 }));
    } catch (e) {
      message.error(e?.response?.data?.message || t("adminDemandesAuthentification.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters.search, filters.type, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openDocument = async (urlOriginal) => {
    if (!urlOriginal) return;
    setOpeningDoc(urlOriginal);
    setViewingDoc({ url: urlOriginal, blobUrl: null });
    try {
      const blob = await demandeAuthentificationService.getDocumentFileBlob(urlOriginal);
      const blobUrl = URL.createObjectURL(blob);
      setViewingDoc({ url: urlOriginal, blobUrl });
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("adminDemandesAuthentification.toasts.loadError"));
      setViewingDoc(null);
    } finally {
      setOpeningDoc(null);
    }
  };

  const closeDocumentModal = () => {
    if (viewingDoc?.blobUrl) URL.revokeObjectURL(viewingDoc.blobUrl);
    setViewingDoc(null);
  };

  const getTypeLabel = (v) => {
    if (!v) return "—";
    if (DOC_TYPE_KEYS.includes(v)) return t(`demandesAuthentification.documentTypes.${v}`);
    return v;
  };

  const formatDate = (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—");

  const columns = [
    {
      title: t("adminDemandesAuthentification.documentsList.columns.type"),
      dataIndex: "type",
      width: 140,
      render: (v) => getTypeLabel(v),
    },
    {
      title: t("adminDemandesAuthentification.documentsList.columns.mention"),
      dataIndex: "mention",
      ellipsis: true,
      render: (v) => v || "—",
    },
    {
      title: t("adminDemandesAuthentification.documentsList.columns.organization"),
      dataIndex: ["organization", "name"],
      width: 180,
      render: (v) => v || "—",
    },
    {
      title: t("adminDemandesAuthentification.documentsList.columns.demande"),
      key: "demande",
      width: 160,
      render: (_, r) => {
        const d = r.demandeAuthentification;
        if (!d) return "—";
        return (
          <Link to={`/admin/demandes-authentification/${d.id}`}>
            <FileTextOutlined className="mr-1" />
            {d.codeADN || "—"}
          </Link>
        );
      },
    },
    {
      title: t("adminDemandesAuthentification.documentsList.columns.demandeur"),
      key: "demandeur",
      width: 200,
      render: (_, r) => {
        const u = r.demandeAuthentification?.user;
        if (!u) return "—";
        const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
        return (
          <span>
            {name}
            {u.demandeurCode && (
              <span className="text-gray-500 dark:text-gray-400 ml-1 text-xs">({u.demandeurCode})</span>
            )}
          </span>
        );
      },
    },
    {
      title: t("adminDemandesAuthentification.documentsList.columns.date"),
      dataIndex: "createdAt",
      width: 140,
      render: formatDate,
    },
    {
      title: t("adminDemandesAuthentification.documentsList.columns.actions"),
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, r) => (
        <Space wrap>
          {r.urlOriginal && (
            <Button
              size="small"
              type="link"
              icon={<EyeOutlined />}
              loading={openingDoc === r.urlOriginal}
              onClick={() => openDocument(r.urlOriginal)}
            >
              {t("adminDemandesAuthentification.documentsList.actions.viewDocument")}
            </Button>
          )}
          {r.demandeAuthentification?.id && (
            <Link to={`/admin/demandes-authentification/${r.demandeAuthentification.id}`}>
              <Button size="small">{t("adminDemandesAuthentification.documentsList.actions.viewDemande")}</Button>
            </Link>
          )}
        </Space>
      ),
    },
  ];

  const typeOptions = DOC_TYPE_KEYS.map((k) => ({
    value: k,
    label: t(`demandesAuthentification.documentTypes.${k}`),
  }));

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminDemandesAuthentification.documentsList.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminDemandesAuthentification.breadcrumb.dashboard")}</Link> },
              { title: <Link to="/admin/demandes-authentification">{t("adminDemandesAuthentification.breadcrumb.list")}</Link> },
              { title: t("adminDemandesAuthentification.documentsList.breadcrumb") },
            ]}
          />
        </div>

        <Card className="mb-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("adminDemandesAuthentification.documentsList.description")}
          </p>
          <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
            <Space wrap>
              <Input
                allowClear
                placeholder={t("adminDemandesAuthentification.documentsList.filters.search")}
                style={{ width: 280 }}
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onPressEnter={fetchData}
                suffix={<SearchOutlined onClick={fetchData} style={{ color: "#aaa" }} />}
              />
              <Select
                allowClear
                placeholder={t("adminDemandesAuthentification.documentsList.filters.type")}
                style={{ width: 180 }}
                value={filters.type}
                options={typeOptions}
                onChange={(v) => setFilters((f) => ({ ...f, type: v || undefined }))}
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
          scroll={{ x: 1000 }}
          locale={{ emptyText: t("adminDemandesAuthentification.documentsList.empty") }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
            showTotal: (total) => t("adminDemandesAuthentification.documentsList.pagination", { total }),
          }}
          onChange={(pg) => setPagination((p) => ({ ...p, current: pg.current, pageSize: pg.pageSize || p.pageSize }))}
        />
      </div>

      <Modal
        title={t("adminDemandesAuthentification.documentsList.actions.viewDocument")}
        open={!!viewingDoc}
        onCancel={closeDocumentModal}
        footer={null}
        width="90%"
        style={{ top: 24 }}
        destroyOnClose
      >
        {viewingDoc?.blobUrl ? (
          <iframe
            title="PDF"
            src={viewingDoc.blobUrl}
            className="w-full border-0 rounded"
            style={{ minHeight: "70vh" }}
          />
        ) : (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        )}
      </Modal>
    </div>
  );
}
