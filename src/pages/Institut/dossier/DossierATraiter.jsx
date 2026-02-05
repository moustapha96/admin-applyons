/* eslint-disable no-unused-vars */
"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
} from "antd";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import documentService from "@/services/documentService";
import { useAuth } from "../../../hooks/useAuth";
import {
  FileAddOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { buildImageUrl } from "@/utils/imageUtils";
import { DATE_FORMAT } from "@/utils/dateFormat";
import { PDF_ACCEPT, createPdfBeforeUpload } from "@/utils/uploadValidation";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const STATUS_COLORS = {
  PENDING: "blue",
  IN_PROGRESS: "gold",
  VALIDATED: "green",
  REJECTED: "red",
};

const safeUrl = (u) => buildImageUrl(u);

export default function DossierATraiterTraducteur() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // doit exposer organization.id
  const orgId = user?.organization?.id;
  // Sur la page traducteur : afficher les demandes où l'institut connecté est le traducteur (assignedOrgId). Pas de filtre targetOrgId.
  const isTraducteurContext = location.pathname.startsWith("/traducteur");
  const basePath = isTraducteurContext ? "/traducteur/demandes" : "/organisations/demandes";

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
    sortBy: isTraducteurContext ? "updatedAt" : "dateDemande",
    sortOrder: "desc",
  });

  const [docsOpen, setDocsOpen] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [currentDemande, setCurrentDemande] = useState(null);

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
    if (!isTraducteurContext) return;
    setCurrentDemande(demande);
    setDocsOpen(true);
    setDocsLoading(true);
    try {
      const resp = await documentService.listByDemande(demande.id);
      const list = resp?.documents ?? resp?.data?.documents ?? (Array.isArray(resp) ? resp : []);
      setDocs(Array.isArray(list) ? list : []);
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

  const handleUploadTranslated = async (doc, file, extra = {}) => {
    try {
      await documentService.uploadTranslated(doc.id, file, extra);
      message.success(t("traducteurDemandesList.messages.translationAdded"));
      if (currentDemande) await openDocs(currentDemande);
      fetchData(pagination.page, pagination.limit);
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("traducteurDemandesList.messages.uploadError"));
    }
  };

  const DocsRow = ({ d }) => (
    <div className="flex items-start justify-between gap-3 p-2 rounded border" style={{ borderColor: "#f0f0f0" }} key={d.id}>
      <div className="min-w-0">
        <Space direction="vertical" size={2}>
          <Space wrap size="small">
            <Tag>{d.ownerOrg?.name || "—"}</Tag>
            {d.estTraduit ? <Tag color="green">{t("traducteurDemandesList.documents.translated")}</Tag> : <Tag>{t("traducteurDemandesList.documents.notTranslated")}</Tag>}
            {d.urlChiffre ? <Tag color="geekblue">{t("traducteurDemandesList.documents.encrypted")}</Tag> : <Tag>{t("traducteurDemandesList.documents.notEncrypted")}</Tag>}
            {d.blockchainHash && <Tag color="purple">{t("traducteurDemandesList.documents.blockchain")}</Tag>}
          </Space>
          <Space wrap size="small">
            {safeUrl(d.urlOriginal) && (
              <a href={safeUrl(d.urlOriginal)} target="_blank" rel="noreferrer">
                <Button size="small" icon={<EyeOutlined />}>{t("traducteurDemandesList.documents.original")}</Button>
              </a>
            )}
            {safeUrl(d.urlChiffre) && (
              <a href={safeUrl(d.urlChiffre)} target="_blank" rel="noreferrer">
                <Button size="small" icon={<FileTextOutlined />}>{t("traducteurDemandesList.documents.encrypted")}</Button>
              </a>
            )}
            {safeUrl(d.urlTraduit) && (
              <a href={safeUrl(d.urlTraduit)} target="_blank" rel="noreferrer">
                <Button size="small" type="primary" icon={<EyeOutlined />}>{t("traducteurDemandesList.documents.translated")}</Button>
              </a>
            )}
          </Space>
        </Space>
      </div>
      {!d.estTraduit && (
        <Upload
          accept={PDF_ACCEPT}
          maxCount={1}
          showUploadList={false}
          beforeUpload={createPdfBeforeUpload(message.error, t, Upload.LIST_IGNORE)}
          customRequest={async ({ file, onSuccess, onError }) => {
            try {
              await handleUploadTranslated(d, file, {});
              onSuccess?.("ok");
            } catch (err) {
              onError?.(err);
            }
          }}
        >
          <Button type="primary" icon={<UploadOutlined />}>{t("traducteurDemandesList.actions.addTranslation")}</Button>
        </Upload>
      )}
    </div>
  );

  const columns = useMemo(
    () => {
      const baseCols = [
        {
          title: isTraducteurContext ? t("traducteurDemandesList.columns.code") : t("institutDossier.columns.code"),
          dataIndex: "code",
          key: "code",
          sorter: isTraducteurContext,
          render: (v, r) => <Link to={`${basePath}/${r.id}`}>{v || "—"}</Link>,
          width: 160,
        },
        {
          title: isTraducteurContext ? t("traducteurDemandesList.columns.date") : t("institutDossier.columns.date"),
          dataIndex: "dateDemande",
          key: "dateDemande",
          sorter: isTraducteurContext,
          width: 140,
          render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : (isTraducteurContext ? t("common.na") : "—")),
        },
        {
          title: isTraducteurContext ? t("traducteurDemandesList.columns.client") : t("institutDossier.columns.demandeur"),
          key: "user",
          render: (_, r) => r.user?.email || r.user?.username || (isTraducteurContext ? t("common.na") : "—"),
        },
      ];
      if (isTraducteurContext) {
        baseCols.push({
          title: t("traducteurDemandesList.columns.targetOrg"),
          key: "target",
          render: (_, r) => r.targetOrg?.name || t("common.na"),
          responsive: ["md"],
        });
      } else {
        baseCols.push({ title: t("institutDossier.columns.assigned"), key: "assigned", render: (_, r) => r.assignedOrg?.name || "—" });
      }
      baseCols.push(
        {
          title: isTraducteurContext ? t("traducteurDemandesList.columns.docs") : t("institutDossier.columns.docs"),
          dataIndex: isTraducteurContext ? "_count" : "documentsCount",
          key: "documentsCount",
          width: 90,
          align: isTraducteurContext ? "center" : undefined,
          render: isTraducteurContext
            ? (c, r) => (typeof c?.documents === "number" ? c.documents : (r.documentsCount ?? r.documents?.length ?? 0))
            : (v) => v ?? "—",
        },
        {
          title: isTraducteurContext ? t("traducteurDemandesList.columns.status") : t("institutDossier.columns.status"),
          dataIndex: "status",
          key: "status",
          sorter: isTraducteurContext,
          width: 140,
          render: (s) => <Tag color={STATUS_COLORS[s || "PENDING"] || "default"}>{s || "PENDING"}</Tag>,
        },
        {
          title: isTraducteurContext ? t("traducteurDemandesList.columns.actions") : t("institutDossier.columns.actions"),
          key: "actions",
          fixed: "right",
          width: isTraducteurContext ? 320 : 220,
          render: (_, r) => (
            <Space wrap>
              <Tooltip title={isTraducteurContext ? t("traducteurDemandesList.actions.detail") : null}>
                <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`${basePath}/${r.id}`)}>
                  {isTraducteurContext ? t("traducteurDemandesList.actions.detail") : t("institutDossier.buttons.details")}
                </Button>
              </Tooltip>
              <Tooltip title={isTraducteurContext ? t("traducteurDemandesList.actions.viewDocuments") : null}>
                <Button size="small" icon={<FileAddOutlined />} onClick={() => navigate(`${basePath}/${r.id}/documents`)}>
                  {isTraducteurContext ? t("traducteurDemandesList.actions.documents") : t("institutDossier.buttons.addDocument")}
                </Button>
              </Tooltip>
              {isTraducteurContext && (
                <Tooltip title={t("traducteurDemandesList.actions.translate")}>
                  <Button size="small" onClick={() => openDocs(r)}>{t("traducteurDemandesList.actions.translate")}</Button>
                </Tooltip>
              )}
            </Space>
          ),
        }
      );
      return baseCols;
    },
    [navigate, t, basePath, isTraducteurContext]
  );

  const onChangeTable = (pag, _filters, sorter) => {
    if (isTraducteurContext && (sorter?.field != null || sorter?.order)) {
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
          <h5 className="text-lg font-semibold">{t("institutDossier.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to={isTraducteurContext ? "/traducteur/dashboard" : "/organisations/dashboard"}>{t("institutDossier.breadcrumbs.dashboard")}</Link> },
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

          <Card className="mt-3" title={isTraducteurContext ? t("traducteurDemandesList.filters.title") : t("institutDossier.filters.title")}>
            <Space wrap>
              {isTraducteurContext ? (
                <Input.Search
                  placeholder={t("traducteurDemandesList.filters.search")}
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={(v) => setFilters((f) => ({ ...f, search: v }))}
                  defaultValue={filters.search}
                  style={{ minWidth: 260 }}
                />
              ) : (
                <Input
                  placeholder={t("institutDossier.filters.searchPlaceholder")}
                  value={filters.search}
                  allowClear
                  prefix={<SearchOutlined />}
                  onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                  style={{ minWidth: 280 }}
                />
              )}
              <Select
                allowClear
                placeholder={isTraducteurContext ? t("traducteurDemandesList.filters.status") : t("institutDossier.filters.statusPlaceholder")}
                value={filters.status}
                onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                style={{ width: 200 }}
                options={
                  isTraducteurContext
                    ? ["PENDING", "IN_PROGRESS", "VALIDATED", "REJECTED"].map((s) => ({
                        label: t(`traducteurDemandesList.status.${s}`),
                        value: s,
                      }))
                    : ["PENDING", "VALIDATED", "REJECTED", "IN_PROGRESS"].map((s) => ({ label: s, value: s }))
                }
              />
              <RangePicker
                format={DATE_FORMAT}
                placeholder={[isTraducteurContext ? t("traducteurDemandesList.filters.dateRange") : "Date début", isTraducteurContext ? t("traducteurDemandesList.filters.dateRange") : "Date fin"]}
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
                style={{ width: isTraducteurContext ? 180 : 200 }}
                options={isTraducteurContext ? SORT_FIELDS_TRADUCTEUR : [
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
                options={
                  isTraducteurContext
                    ? [
                        { label: t("traducteurDemandesList.sortOrder.desc"), value: "desc" },
                        { label: t("traducteurDemandesList.sortOrder.asc"), value: "asc" },
                      ]
                    : [
                        { value: "asc", label: t("institutDossier.filters.sortOrder.asc") },
                        { value: "desc", label: t("institutDossier.filters.sortOrder.desc") },
                      ]
                }
              />
              <Button type="primary" onClick={() => fetchData(1, pagination.limit)}>
                {isTraducteurContext ? t("traducteurDemandesList.actions.apply") : t("institutDossier.filters.buttons.apply")}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  const reset = {
                    search: "",
                    status: undefined,
                    from: undefined,
                    to: undefined,
                    sortBy: isTraducteurContext ? "updatedAt" : "dateDemande",
                    sortOrder: "desc",
                  };
                  setFilters(reset);
                  fetchData(1, pagination.limit, reset);
                }}
              >
                {isTraducteurContext ? t("common.reset") : t("institutDossier.filters.buttons.reset")}
              </Button>
            </Space>
          </Card>

          <Card className="mt-3" title={isTraducteurContext ? t("traducteurDemandesList.table.title") : t("institutDossier.list.title")}>
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
                ...(isTraducteurContext ? { pageSizeOptions: ["5", "10", "20", "50", "100"], showTotal: (total) => `${total} demande(s)` } : {}),
              }}
              onChange={isTraducteurContext ? onChangeTable : undefined}
              scroll={{ x: true }}
            />
          </Card>
        </div>
      </div>

      {isTraducteurContext && (
        <Modal
          open={docsOpen}
          onCancel={closeDocs}
          footer={null}
          width={860}
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
          ) : docs.length === 0 ? (
            <Text type="secondary">{t("traducteurDemandesList.modal.noDocuments")}</Text>
          ) : (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {docs.map((d) => (
                <DocsRow key={d.id} d={d} />
              ))}
            </Space>
          )}
        </Modal>
      )}
    </div>
  );
}
