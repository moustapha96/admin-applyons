/* eslint-disable no-unused-vars */
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  DatePicker,
  Select,
  Typography,
  message,
  Breadcrumb,
  Modal,
  Spin,
  Upload,
  Tooltip,
  Descriptions,
  Collapse,
  Result,
} from "antd";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService";
import { useAuth } from "@/hooks/useAuth";
import {
  FileAddOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "@/utils/imageUtils";
import { DATE_FORMAT } from "@/utils/dateFormat";
import { hasTranslation, normalizeDocument } from "@/utils/documentUtils";
import { PDF_ACCEPT, validatePdfFile } from "@/utils/uploadValidation";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_COLORS = {
  PENDING: "blue",
  IN_PROGRESS: "gold",
  VALIDATED: "green",
  REJECTED: "red",
};

const safeUrl = (u) => buildImageUrl(u);
const fmtDate = (d, f = "DD/MM/YYYY") => (d ? (dayjs(d).isValid() ? dayjs(d).format(f) : "—") : "—");
const statusColor = (status) => ({ VALIDATED: "green", REJECTED: "red", IN_PROGRESS: "gold", PENDING: "blue" }[status || "PENDING"] || "blue");

/** Page Dossiers à traiter – réservée au rôle TRADUCTEUR (demandes où l'org connectée est le traducteur assigné). */
export default function DossierATraiterTraducteur() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgId = user?.organization?.id;
  const basePath = "/traducteur/demandes";

  const SORT_FIELDS_TRADUCTEUR = useMemo(
    () => [
      { label: t("traducteurDemandesList.sortFields.updatedAt"), value: "updatedAt" },
      { label: t("traducteurDemandesList.sortFields.createdAt"), value: "createdAt" },
      { label: t("traducteurDemandesList.sortFields.code"), value: "code" },
      { label: t("traducteurDemandesList.sortFields.dateDemande"), value: "dateDemande" },
    ],
    [t]
  );

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    from: undefined,
    to: undefined,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const [docsOpen, setDocsOpen] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [currentDemande, setCurrentDemande] = useState(null);
  const [preview, setPreview] = useState({ open: false, url: "", title: "" });
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [uploadResult, setUploadResult] = useState({ visible: false, success: false, message: "" });

  const fetchData = useCallback(
    async (page = pagination.page, limit = pagination.limit, override = {}) => {
      if (!orgId) return;
      setLoading(true);
      try {
        const f = { ...filters, ...override };
        const params = {
          page,
          limit,
          sortBy: f.sortBy,
          sortOrder: f.sortOrder,
          search: f.search || undefined,
          status: f.status || undefined,
          from: f.from || undefined,
          to: f.to || undefined,
        };
        const res = await demandeService.listATraiter(orgId, params);
        setRows(res?.demandes || []);
        setPagination({
          page: res?.pagination?.page ?? page,
          limit: res?.pagination?.limit ?? limit,
          total: res?.pagination?.total ?? 0,
        });
        if (Object.keys(override).length) setFilters(f);
      } catch (e) {
        message.error(e?.message || t("institutDossier.messages.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [orgId, filters, pagination.page, pagination.limit, t]
  );

  useEffect(() => {
    fetchData(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const mapSorterToBackend = (sorter) => {
    const f = sorter?.field;
    const order = sorter?.order;
    const allowed = new Set(["updatedAt", "createdAt", "code", "dateDemande"]);
    const sortBy = allowed.has(f) ? f : filters.sortBy || "updatedAt";
    const sortOrder = order === "ascend" ? "asc" : "desc";
    return { sortBy, sortOrder };
  };

  const openDocs = async (demande) => {
    setCurrentDemande(demande);
    setDocsOpen(true);
    setDocsLoading(true);
    try {
      const resp = await documentService.listByDemande(demande.id);
      const list = resp?.documents ?? resp?.data?.documents ?? (Array.isArray(resp) ? resp : []);
      const normalized = (Array.isArray(list) ? list : []).map((d) => normalizeDocument(d));
      setDocs(normalized);
    } catch (e) {
      message.error(t("traducteurDemandesList.messages.documentsError"));
    } finally {
      setDocsLoading(false);
    }
  };

  const closeDocs = () => {
    setDocsOpen(false);
    setCurrentDemande(null);
    setDocs([]);
  };

  // Prévisualisation des fichiers dans l'application (miroir de la page Détails)
  useEffect(() => {
    return () => {
      if (preview.url && preview.url.startsWith("blob:")) URL.revokeObjectURL(preview.url);
    };
  }, [preview.url]);

  const openPreview = async (doc, kind = "original") => {
    try {
      if (kind === "traduit") {
        const info = await documentService.getInfo(doc.id).catch(() => ({}));
        const docInfo = info?.document || info;
        if (!(docInfo?.traduit?.hasFile || docInfo?.estTraduit)) {
          message.warning(t("traducteurDemandesList.messages.translationNotReady") || t("traducteurDemandeDetails.messages.translationNotReady"));
          return;
        }
      }
      const blob = await documentService.getContent(doc.id, { type: kind, display: true });
      const url = URL.createObjectURL(blob);
      setPreview({
        open: true,
        url,
        title: kind === "traduit" ? t("traducteurDemandesList.documents.translated") : t("traducteurDemandesList.documents.original"),
      });
    } catch (e) {
      if (e?.response?.status === 404 && kind === "traduit") {
        message.error(t("traducteurDemandeDetails.messages.translationNotFound"));
      } else {
        message.error(e?.response?.data?.message || e?.message || t("traducteurDemandesList.messages.documentsError"));
      }
    }
  };

  const closePreview = () => {
    if (preview.url && preview.url.startsWith("blob:")) URL.revokeObjectURL(preview.url);
    setPreview({ open: false, url: "", title: "" });
  };

  const downloadDoc = async (doc, kind = "original") => {
    try {
      await documentService.downloadDocument(doc.id, kind, `document_${doc.id}_${kind}.pdf`);
      message.success(t("traducteurDemandesList.messages.downloadSuccess") || "Téléchargement réussi");
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandesList.messages.uploadError"));
    }
  };

  const handleUploadTranslated = async (doc, file, extra = {}) => {
    setUploadingDocId(doc.id);
    try {
      await documentService.uploadTranslated(doc.id, file, extra);
      setUploadResult({
        visible: true,
        success: true,
        message: String(t("traducteurDemandesList.messages.translationAdded") || "Fichier traduit envoyé avec succès."),
      });
      if (currentDemande) await openDocs(currentDemande);
      fetchData(pagination.page, pagination.limit);
    } catch (e) {
      const errMsg =
        e?.response?.data?.message ||
        (typeof e?.message === "string" ? e.message : null) ||
        t("traducteurDemandesList.messages.uploadError") ||
        "Erreur lors de l'envoi du fichier.";
      setUploadResult({
        visible: true,
        success: false,
        message: String(errMsg),
      });
    } finally {
      setUploadingDocId(null);
    }
  };

  const closeUploadResultModal = () => {
    setUploadResult({ visible: false, success: false, message: "" });
  };

  const DocsRow = ({ d }) => {
    const isUploading = uploadingDocId === d.id;
    return (
      <div className="flex items-start justify-between gap-3 p-2 rounded border" style={{ borderColor: "#f0f0f0" }} key={d.id}>
        <div className="min-w-0">
          <Space direction="vertical" size={2}>
            <Space wrap size="small">
              <Tag>{d.ownerOrg?.name || "—"}</Tag>
              {hasTranslation(d) ? <Tag color="green">{t("traducteurDemandesList.documents.translated")}</Tag> : <Tag>{t("traducteurDemandesList.documents.notTranslated")}</Tag>}
              {(d.urlChiffre || d.original?.isEncrypted) ? <Tag color="geekblue">{t("traducteurDemandesList.documents.encrypted")}</Tag> : <Tag>{t("traducteurDemandesList.documents.notEncrypted")}</Tag>}
              {(d.blockchainHash || d.original?.blockchainHash) && <Tag color="purple">{t("traducteurDemandesList.documents.blockchain")}</Tag>}
            </Space>
            <Space wrap size="small">
              <Button size="small" icon={<EyeOutlined />} onClick={() => openPreview(d, "original")}>
                {t("traducteurDemandesList.documents.original")}
              </Button>
              <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadDoc(d, "original")}>
                {t("traducteurDemandesList.documents.download") || "Télécharger"}
              </Button>
              {hasTranslation(d) && (
                <>
                  <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => openPreview(d, "traduit")}>
                    {t("traducteurDemandesList.documents.translated")}
                  </Button>
                  <Button size="small" icon={<DownloadOutlined />} onClick={() => downloadDoc(d, "traduit")}>
                    {t("traducteurDemandesList.documents.download") || "Télécharger"} {t("traducteurDemandesList.documents.translated")}
                  </Button>
                </>
              )}
            </Space>
          </Space>
        </div>
        {!hasTranslation(d) && (
          <Upload
            accept={PDF_ACCEPT}
            maxCount={1}
            showUploadList={false}
            disabled={isUploading}
            beforeUpload={(file) => {
              const { valid, errorKey } = validatePdfFile(file);
              if (!valid) {
                message.error(t(`common.upload.${errorKey}`));
                return Upload.LIST_IGNORE;
              }
              return true;
            }}
            customRequest={async ({ file, onSuccess, onError }) => {
              try {
                await handleUploadTranslated(d, file, {});
                onSuccess?.("ok");
              } catch (err) {
                onError?.(err);
              }
            }}
          >
            <Button type="primary" icon={<UploadOutlined />} loading={isUploading}>
              {isUploading ? (t("traducteurDemandesList.actions.uploading") || "Envoi en cours…") : t("traducteurDemandesList.actions.addTranslation")}
            </Button>
          </Upload>
        )}
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        title: t("traducteurDemandesList.columns.code"),
        dataIndex: "code",
        key: "code",
        sorter: true,
        render: (v, r) => <Link to={`${basePath}/${r.id}`}>{v || "—"}</Link>,
        width: 160,
      },
      {
        title: t("traducteurDemandesList.columns.date"),
        dataIndex: "dateDemande",
        key: "dateDemande",
        sorter: true,
        width: 140,
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : t("common.na")),
      },
      {
        title: t("traducteurDemandesList.columns.client"),
        key: "user",
        render: (_, r) => r.user?.email || r.user?.username || t("common.na"),
      },
      {
        title: t("traducteurDemandesList.columns.targetOrg"),
        key: "target",
        render: (_, r) => r.targetOrg?.name || t("common.na"),
        responsive: ["md"],
      },
      {
        title: t("traducteurDemandesList.columns.docs"),
        dataIndex: "_count",
        key: "documentsCount",
        width: 90,
        align: "center",
        render: (c, r) => (typeof c?.documents === "number" ? c.documents : (r.documentsCount ?? r.documents?.length ?? 0)),
      },
      {
        title: t("traducteurDemandesList.columns.status"),
        dataIndex: "status",
        key: "status",
        sorter: true,
        width: 140,
        render: (s) => <Tag color={STATUS_COLORS[s || "PENDING"] || "default"}>{s || "PENDING"}</Tag>,
      },
      {
        title: t("traducteurDemandesList.columns.actions"),
        key: "actions",
        fixed: "right",
        width: 320,
        render: (_, r) => (
          <Space wrap>
            <Tooltip title={t("traducteurDemandesList.actions.detail")}>
              <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`${basePath}/${r.id}`)}>
                {t("traducteurDemandesList.actions.detail")}
              </Button>
            </Tooltip>
            <Tooltip title={t("traducteurDemandesList.actions.viewDocuments")}>
              <Button size="small" icon={<FileAddOutlined />} onClick={() => navigate(`${basePath}/${r.id}/documents`)}>
                {t("traducteurDemandesList.actions.documents")}
              </Button>
            </Tooltip>
            <Tooltip title={t("traducteurDemandesList.actions.translate")}>
              <Button size="small" onClick={() => openDocs(r)}>{t("traducteurDemandesList.actions.translate")}</Button>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [navigate, t, basePath]
  );

  const onChangeTable = (pag, _filters, sorter) => {
    if (sorter?.field != null || sorter?.order) {
      const { sortBy, sortOrder } = mapSorterToBackend(sorter);
      fetchData(pag.current, pag.pageSize, { sortBy, sortOrder });
    } else {
      fetchData(pag.current, pag.pageSize);
    }
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("traducteurDemandesList.filters.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/traducteur/dashboard">{t("traducteurDemandesList.breadcrumb.dashboard")}</Link> },
              { title: t("traducteurDemandesList.breadcrumb.demandes") },
            ]}
          />
        </div>

        <div className="p-2 md:p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Title level={3} className="!mb-0">
              {t("traducteurDemandesList.table.title")}
            </Title>
          </div>

          <Card className="mt-3" title={t("traducteurDemandesList.filters.title")}>
            <Space wrap>
              <Input.Search
                placeholder={t("traducteurDemandesList.filters.search")}
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
                defaultValue={filters.search}
                style={{ minWidth: 260 }}
              />
              <Select
                allowClear
                placeholder={t("traducteurDemandesList.filters.status")}
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                style={{ width: 200 }}
                options={["PENDING", "IN_PROGRESS", "VALIDATED", "REJECTED"].map((s) => ({
                  label: t(`traducteurDemandesList.status.${s}`),
                  value: s,
                }))}
              />
              <RangePicker
                format={DATE_FORMAT}
                placeholder={[t("traducteurDemandesList.filters.dateRange"), t("traducteurDemandesList.filters.dateRange")]}
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
                style={{ width: 180 }}
                options={SORT_FIELDS_TRADUCTEUR}
              />
              <Select
                value={filters.sortOrder}
                onChange={(v) => setFilters((f) => ({ ...f, sortOrder: v }))}
                style={{ width: 140 }}
                options={[
                  { label: t("traducteurDemandesList.sortOrder.desc"), value: "desc" },
                  { label: t("traducteurDemandesList.sortOrder.asc"), value: "asc" },
                ]}
              />
              <Button type="primary" onClick={() => fetchData(1, pagination.limit)}>
                {t("traducteurDemandesList.actions.apply")}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  const reset = {
                    search: "",
                    status: undefined,
                    from: undefined,
                    to: undefined,
                    sortBy: "updatedAt",
                    sortOrder: "desc",
                  };
                  setFilters(reset);
                  fetchData(1, pagination.limit, reset);
                }}
              >
                {t("common.reset")}
              </Button>
            </Space>
          </Card>

          <Card className="mt-3" title={t("traducteurDemandesList.table.title")}>
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
                pageSizeOptions: ["5", "10", "20", "50", "100"],
                showTotal: (total) => `${total} demande(s)`,
              }}
              onChange={onChangeTable}
              scroll={{ x: true }}
            />
          </Card>
        </div>
      </div>

      <Modal
        open={docsOpen}
        onCancel={closeDocs}
        footer={null}
        width={920}
        title={
          <Space wrap>
            <Text strong>{t("traducteurDemandesList.modal.documentsTitle")}</Text>
            {currentDemande?.code && <Tag color="blue">{currentDemande.code}</Tag>}
            {currentDemande?.targetOrg?.name && <Tag>{currentDemande.targetOrg.name}</Tag>}
          </Space>
        }
      >
        {docsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spin />
          </div>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {/* Miroir des infos de la demande (comme sur la page Détails) */}
            {currentDemande && (
              <Collapse
                defaultActiveKey={["infos"]}
                items={[
                  {
                    key: "infos",
                    label: t("traducteurDemandeDetails.sections.generalInfo") || "Informations de la demande",
                    children: (
                      <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                        <Descriptions.Item label={t("traducteurDemandeDetails.fields.code")}>{currentDemande.code || "—"}</Descriptions.Item>
                        <Descriptions.Item label={t("traducteurDemandeDetails.fields.dateDemande")}>{fmtDate(currentDemande.dateDemande)}</Descriptions.Item>
                        <Descriptions.Item label={t("traducteurDemandeDetails.fields.status")}>
                          <Tag color={statusColor(currentDemande.status)}>{currentDemande.status || "PENDING"}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={t("traducteurDemandeDetails.fields.demandeur")}>
                          {currentDemande.user?.firstName || currentDemande.user?.lastName
                            ? `${currentDemande.user?.firstName || ""} ${currentDemande.user?.lastName || ""}`.trim()
                            : currentDemande.user?.email || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("traducteurDemandeDetails.fields.targetOrg")}>
                          {currentDemande.targetOrg?.name || "—"}
                          {currentDemande.targetOrg?.type && <Tag style={{ marginLeft: 8 }}>{currentDemande.targetOrg.type}</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("traducteurDemandeDetails.fields.assignedOrg")}>
                          {currentDemande.assignedOrg?.name || "—"}
                          {currentDemande.assignedOrg?.type && <Tag style={{ marginLeft: 8 }}>{currentDemande.assignedOrg.type}</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label={t("traducteurDemandeDetails.fields.documents")}>
                          <Tag>{currentDemande._count?.documents ?? docs.length}</Tag>
                        </Descriptions.Item>
                      </Descriptions>
                    ),
                  },
                ]}
              />
            )}
            {docs.length === 0 ? (
              <Text type="secondary">{t("traducteurDemandesList.modal.noDocuments")}</Text>
            ) : (
              docs.map((d) => <DocsRow key={d.id} d={d} />)
            )}
          </Space>
        )}
      </Modal>

      {/* Popup résultat envoi fichier traduit */}
      <Modal
        open={uploadResult.visible}
        onCancel={closeUploadResultModal}
        footer={
          <Button type="primary" onClick={closeUploadResultModal}>
            {t("common.ok") || "OK"}
          </Button>
        }
        closable
        width={440}
      >
        <Result
          status={uploadResult.success ? "success" : "error"}
          title={uploadResult.success ? (t("traducteurDemandesList.uploadResult.successTitle") || "Envoi réussi") : (t("traducteurDemandesList.uploadResult.errorTitle") || "Échec de l'envoi")}
          subTitle={uploadResult.message}
        />
      </Modal>

      {/* Prévisualisation des fichiers dans l'application */}
      <Modal
        open={preview.open}
        title={preview.title}
        onCancel={closePreview}
        footer={
          <Space>
            {preview.url && (
              <a href={preview.url} target="_blank" rel="noreferrer">
                <Button>{t("traducteurDemandeDetails.modals.openInNewTab") || "Ouvrir dans un nouvel onglet"}</Button>
              </a>
            )}
            <Button type="primary" onClick={closePreview}>
              {t("traducteurDemandeDetails.modals.close") || "Fermer"}
            </Button>
          </Space>
        }
        width="95vw"
        style={{ top: 20, paddingBottom: 0 }}
        styles={{ body: { height: "calc(95vh - 110px)", padding: 0 } }}
        destroyOnHidden
      >
        {preview.url ? (
          <iframe src={preview.url} title="aperçu-document" style={{ width: "100%", height: "100%", border: "none" }} />
        ) : (
          <div style={{ padding: 16 }}><Text type="secondary">{t("traducteurDemandeDetails.modals.noContent")}</Text></div>
        )}
      </Modal>
    </div>
  );
}
