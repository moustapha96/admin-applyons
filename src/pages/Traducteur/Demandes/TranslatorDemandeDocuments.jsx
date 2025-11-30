
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  message,
  Tooltip,
  Select,
  Upload,
  Typography,
  Popconfirm,
} from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import documentService from "@/services/documentService";
import demandeService from "@/services/demandeService";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "@/utils/imageUtils";

const { Dragger } = Upload;
const { Text } = Typography;

const STATUS_COLORS = {
  PENDING: "blue",
  IN_PROGRESS: "gold",
  VALIDATED: "green",
  REJECTED: "red",
};

// Utilise buildImageUrl pour construire les URLs d'images
const safeUrl = (u) => buildImageUrl(u);

export default function DemandeDocumentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { demandeId } = useParams();

  // En-tête demande
  const [demande, setDemande] = useState(null);

  // Table documents
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pag, setPag] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    demandePartageId: demandeId,
    ownerOrgId: undefined,
    estTraduit: undefined,
    from: undefined,
    to: undefined,
  });

  // Modal upload traduction
  const [openModal, setOpenModal] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [encryptionKeyTraduit, setEncryptionKeyTraduit] = useState("");

  const fetchDemande = useCallback(async () => {
    try {
      const d = await demandeService.getById(demandeId);
      setDemande(d?.demande || d?.data?.demande || null);
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDocuments.messages.loadDemandeError"));
    }
  }, [demandeId, t]);

  const fetch = useCallback(
    async (page = pag.current, pageSize = pag.pageSize, f = filters) => {
      setLoading(true);
      try {
        const { documents, pagination } = await documentService.list({
          page,
          limit: pageSize,
          search: f.search || undefined,
          demandePartageId: f.demandePartageId || undefined,
          ownerOrgId: f.ownerOrgId || undefined,
          estTraduit: typeof f.estTraduit === "boolean" ? f.estTraduit : undefined,
          from: f.from || undefined,
          to: f.to || undefined,
        });
        console.log(documents)
        setRows(documents || []);
        setPag({ current: page, pageSize, total: pagination?.total || 0 });
      } catch (e) {
        message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDocuments.messages.loadDocsError"));
      } finally {
        setLoading(false);
      }
    },
    [pag.current, pag.pageSize, filters, t]
  );

  useEffect(() => {
    fetchDemande();
    setFilters((prev) => ({ ...prev, demandePartageId: demandeId }));
    fetch(1, pag.pageSize, { ...filters, demandePartageId: demandeId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandeId]);

  // Actions Documents
  const viewDoc = (row, type = "original") => {
    const url =
      type === "traduit"
        ? safeUrl(row.urlTraduit || row.urlChiffreTraduit)
        : safeUrl(row.urlOriginal || row.urlChiffre);
    if (!url) return message.warning(t("traducteurDemandeDocuments.messages.noFileAvailable"));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const downloadDoc = (row, type = "original") => {
    const url =
      type === "traduit"
        ? safeUrl(row.urlTraduit || row.urlChiffreTraduit)
        : safeUrl(row.urlOriginal || row.urlChiffre);
    if (!url) return message.warning(t("traducteurDemandeDocuments.messages.noFileToDownload"));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const verify = async (docId) => {
    try {
      const r = await documentService.verifyIntegrity(docId);
      const ok = r?.ok ?? r?.data?.ok ?? true;
      message.success(ok ? t("traducteurDemandeDocuments.messages.verifySuccess") : t("traducteurDemandeDocuments.messages.verifyError"));
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDocuments.messages.verifyFailed"));
    }
  };

  // Traduction (upload)
  const openUploadTranslation = (doc) => {
    setCurrentDoc(doc);
    setUploadFile(null);
    setEncryptionKeyTraduit("");
    setOpenModal(true);
  };

  const onChangeUpload = ({ fileList }) => {
    setUploadFile(fileList?.[0]?.originFileObj || null);
  };

  const submitUploadTranslation = async () => {
    if (!currentDoc) return;
    if (!uploadFile) {
      message.warning(t("traducteurDemandeDocuments.messages.uploadWarning"));
      return;
    }
    try {
      const form = new FormData();
      form.append("file", uploadFile);
      if (encryptionKeyTraduit) form.append("encryptionKeyTraduit", encryptionKeyTraduit);

      await documentService.traduireUpload(currentDoc.id, form);
      message.success(t("traducteurDemandeDocuments.messages.uploadSuccess"));
      setOpenModal(false);
      fetch(pag.current, pag.pageSize, filters);
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDocuments.messages.uploadError"));
    }
  };

  // Suppression de la traduction
  const deleteTranslation = async (docId) => {
    try {
      await documentService.deleteTranslated(docId);
      message.success(t("traducteurDemandeDocuments.messages.deleteSuccess"));
      fetch(pag.current, pag.pageSize, filters);
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandeDocuments.messages.deleteError"));
    }
  };

  const TagBool = ({ truthy, labelTrue, labelFalse }) => (
    <Tag color={truthy ? "geekblue" : "default"}>{truthy ? labelTrue : labelFalse}</Tag>
  );

  const short = (s) => (s ? String(s).slice(0, 8) + "…" : "—");
  const formatDT = (v) => (v ? new Date(v).toLocaleString() : "—");

  const columns = [
    {
      title: t("traducteurDemandeDocuments.columns.ownerOrg"),
      key: "ownerOrg",
      render: (_, r) =>
        r.ownerOrg ? (
          <Space direction="vertical" size={0}>
            <span className="font-medium">{r.ownerOrg.name}</span>
            <Tag>{r.ownerOrg.slug}</Tag>
          </Space>
        ) : (
          <Tag>—</Tag>
        ),
      width: 220,
    },
    {
      title: t("traducteurDemandeDocuments.columns.demande"),
      key: "demandePartage",
      render: (_, r) =>
        r.demandePartage ? (
          <Space direction="vertical" size={0}>
            <span>{r.demandePartage.code}</span>
            <Tag>{r.demandePartage.status || "—"}</Tag>
          </Space>
        ) : (
          "—"
        ),
      width: 180,
    },
    {
      title: t("traducteurDemandeDocuments.columns.type"),
      dataIndex: "type",
      key: "type",
      width: 160,
      render: (v, r) => v || (r.estTraduit ? "TRADUCTION" : "ORIGINAL"),
    },
    {
      title: t("traducteurDemandeDocuments.columns.original"),
      key: "original",
      render: (_, r) => (
        <Space direction="vertical">
          <Space>
            <Button size="small" icon={<EyeOutlined />} onClick={() => viewDoc(r, "original")}>
              {t("traducteurDemandeDocuments.actions.view")}
            </Button>  
          </Space>
         
        </Space>
      ),
      width: 360,
    },
    {
      title: t("traducteurDemandeDocuments.columns.translated"),
      key: "traduit",
      render: (_, r) =>
        r.urlTraduit ? (
          <Space direction="vertical">
            <Space>
              <Tag color="green">{t("traducteurDemandeDocuments.actions.available")}</Tag>
              <Button size="small" icon={<EyeOutlined />} onClick={() => viewDoc(r, "traduit")}>
                {t("traducteurDemandeDocuments.actions.view")}
              </Button>
             
              <Tooltip title={t("traducteurDemandeDocuments.tooltips.deleteTranslation")}>
                <Popconfirm
                  title={t("traducteurDemandeDocuments.modals.deleteTitle")}
                  description={t("traducteurDemandeDocuments.modals.deleteDescription")}
                  okText={t("traducteurDemandeDocuments.modals.deleteButton")}
                  okButtonProps={{ danger: true }}
                  cancelText={t("traducteurDemandeDocuments.modals.cancel")}
                  onConfirm={() => deleteTranslation(r.id)}
                >
                  <Button size="small" danger>
                    {t("traducteurDemandeDocuments.actions.delete")}
                  </Button>
                </Popconfirm>
              </Tooltip>
            </Space>
           
          </Space>
        ) : (
          <Space direction="vertical">
            <Tag>N/A</Tag>
            <Tooltip title={t("traducteurDemandeDocuments.tooltips.uploadTranslation")}>
              <Button type="primary" icon={<CloudUploadOutlined />} onClick={() => openUploadTranslation(r)}>
                {t("traducteurDemandeDocuments.actions.translate")}
              </Button>
            </Tooltip>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("traducteurDemandeDocuments.messages.translatedNote")}
            </Text>
          </Space>
        ),
      width: 420,
    },
  ];

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("traducteurDemandeDocuments.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/">{t("traducteurDemandeDocuments.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/traducteur/demandes">{t("traducteurDemandeDocuments.breadcrumbs.demandes")}</Link> },
              { title: t("traducteurDemandeDocuments.breadcrumbs.documents") },
            ]}
          />
        </div>

        <Space className="mb-4" wrap>
          <Button onClick={() => navigate(-1)}>{t("traducteurDemandeDocuments.buttons.back")}</Button>
          <Button icon={<ReloadOutlined />} onClick={() => fetch(pag.current, pag.pageSize, filters)}>
            {t("traducteurDemandeDocuments.buttons.refresh")}
          </Button>
        </Space>

        {demande && (
          <Card className="mb-4" title={t("traducteurDemandeDocuments.sections.demandeInfo")}>
            <Descriptions bordered column={3}>
              <Descriptions.Item label={t("traducteurDemandeDocuments.fields.code")}>{demande.code || "—"}</Descriptions.Item>
              <Descriptions.Item label={t("traducteurDemandeDocuments.fields.status")}>
                <Tag color={STATUS_COLORS[demande.status || "PENDING"] || "blue"}>
                  {demande.status || "PENDING"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t("traducteurDemandeDocuments.fields.demandeur")}>
                {demande.user?.id ? (
                  <Link to={`/traducteur/demandeur/${demande.user.id}/details`}>
                    {demande.user?.email || demande.user?.username || "—"}
                  </Link>
                ) : (
                  demande.user?.email || demande.user?.username || "—"
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t("traducteurDemandeDocuments.fields.targetOrg")} span={3}>
                {demande.targetOrg?.name || "—"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Card
          title={t("traducteurDemandeDocuments.sections.documents")}
          extra={
            <Space wrap>
              <Input.Search
                allowClear
                placeholder={t("traducteurDemandeDocuments.filters.searchPlaceholder")}
                onSearch={(v) => {
                  const next = { ...filters, search: v };
                  setFilters(next);
                  fetch(1, pag.pageSize, next);
                }}
                style={{ width: 260 }}
              />
              <Select
                allowClear
                placeholder={t("traducteurDemandeDocuments.filters.translatedPlaceholder")}
                style={{ width: 160 }}
                value={filters.estTraduit}
                onChange={(v) => {
                  const next = { ...filters, estTraduit: v };
                  setFilters(next);
                  fetch(1, pag.pageSize, next);
                }}
                options={[
                  { value: true, label: t("traducteurDemandeDocuments.filters.yes") },
                  { value: false, label: t("traducteurDemandeDocuments.filters.no") },
                ]}
              />
            </Space>
          }
        >
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={{
              current: pag.current,
              pageSize: pag.pageSize,
              total: pag.total,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50", "100"],
              onChange: (p, ps) => fetch(p, ps, filters),
              showTotal: (total) => t("traducteurDemandeDocuments.pagination.showTotal", { total }),
            }}
            scroll={{ x: true }}
          />
        </Card>
      </div>

      {/* Modal Upload Traduction */}
      <Modal
        open={openModal}
        title={currentDoc ? t("traducteurDemandeDocuments.modals.uploadTitle", { id: currentDoc.id }) : t("traducteurDemandeDocuments.modals.uploadTitleGeneric")}
        onCancel={() => setOpenModal(false)}
        onOk={submitUploadTranslation}
        okText={t("traducteurDemandeDocuments.modals.save")}
        destroyOnHidden
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Dragger
            multiple={false}
            accept=".pdf"
            beforeUpload={() => false}
            onChange={onChangeUpload}
            fileList={uploadFile ? [{ uid: "1", name: uploadFile.name }] : []}
          >
            <p className="ant-upload-drag-icon">
              <CloudUploadOutlined />
            </p>
            <p className="ant-upload-text">{t("traducteurDemandeDocuments.modals.uploadText")}</p>
            <p className="ant-upload-hint">{t("traducteurDemandeDocuments.modals.uploadHint")}</p>
          </Dragger>

        </Space>
      </Modal>
    </div>
  );
}
