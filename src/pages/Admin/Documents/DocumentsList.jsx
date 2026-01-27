/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Documents/DocumentsList.jsx
/* eslint-disable react/jsx-key */
"use client";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    Breadcrumb,
    Button,
    Card,
    DatePicker,
    Descriptions,
    Drawer,
    Input,
    List,
    Modal,
    Progress,
    Space,
    Table,
    Tag,
    Tooltip,
    message,
    Select,
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    DeleteOutlined,
    FileTextOutlined,
    FilePdfOutlined,
    LockOutlined,
    TranslationOutlined,
    InfoCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import documentService from "@/services/documentService";
import organizationService from "@/services/organizationService";
import { hasTranslation, normalizeDocument } from "@/utils/documentUtils";

const { RangePicker } = DatePicker;
const { confirm } = Modal;

function payColor(b) { return b ? "purple" : undefined; }

export default function DocumentsList() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    // Optionnel: pré-filtrer par demande si on arrive depuis “Détail demande”
    const demandeFromUrl = searchParams.get("demandeId") || undefined;

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [orgs, setOrgs] = useState([]);

    const [pag, setPag] = useState({ current: 1, pageSize: 10, total: 0 });
    const [filters, setFilters] = useState({
        search: "",
        demandePartageId: demandeFromUrl,
        ownerOrgId: undefined,
        translated: undefined,  // true / false
        from: undefined,
        to: undefined,
    });

    // Preview modal
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewTitle, setPreviewTitle] = useState("");

    // Drawer détail
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerDoc, setDrawerDoc] = useState(null);

    // Chargement des organisations (pour filtre Owner)
    useEffect(() => {
        (async () => {
            try {
                const res = await organizationService.list({ page: 1, limit: 500 });
                console.log(res);
                setOrgs(res?.organizations || []);
            } catch {
                // silencieux
            }
        })();
    }, []);

    const fetch = useCallback(async (page = pag.current, pageSize = pag.pageSize, f = filters) => {
        setLoading(true);
        try {
            const { documents, pagination } = await documentService.list({
                page,
                limit: pageSize,
                search: f.search || undefined,
                demandePartageId: f.demandePartageId || undefined,
                ownerOrgId: f.ownerOrgId || undefined,
                translated: typeof f.translated === "boolean" ? f.translated : undefined,
                from: f.from || undefined,
                to: f.to || undefined,
            });
            console.log(documents);
            // Normaliser les documents pour utiliser la nouvelle structure
            const normalizedDocs = (documents || []).map(doc => normalizeDocument(doc));
            setRows(normalizedDocs);
            setPag({ current: page, pageSize, total: pagination?.total || 0 });
            } catch (e) {
            message.error(e?.response?.data?.message || t("adminDocuments.messages.loadError"));
        } finally {
            setLoading(false);
        }
    }, [pag.current, pag.pageSize, filters]);

    useEffect(() => { fetch(1, pag.pageSize, filters); /* eslint-disable-next-line */ }, [
        filters.search, filters.demandePartageId, filters.ownerOrgId, filters.translated, filters.from, filters.to,
    ]);


    function normalizeUrl(u) {
        return u;
    }


    const openUrl = async (doc, type = "original") => {
        try {
            if (!doc?.id) {
                message.warning(t("adminDocuments.messages.urlUnavailable"));
                return;
            }
            // Utiliser getContent pour obtenir le blob avec authentification
            const blob = await documentService.getContent(doc.id, { type, display: true });
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank", "noopener,noreferrer");
            // Nettoyer l'URL après un délai
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (error) {
            if (error.response?.status === 401) {
                message.error(t("adminDocuments.messages.sessionExpired") || "Session expirée. Veuillez vous reconnecter.");
            } else if (error.response?.status === 403) {
                message.error(t("adminDocuments.messages.accessDenied") || "Vous n'avez pas accès à ce document.");
            } else {
                message.error(error?.response?.data?.message || error?.message || t("adminDocuments.messages.openError"));
            }
        }
    };





    const removeDoc = (doc) => {
        confirm({
            title: t("adminDocuments.modals.delete.title"),
            icon: <ExclamationCircleOutlined />,
            content: t("adminDocuments.modals.delete.content"),
            okText: t("adminDocuments.modals.delete.okText"),
            okType: "danger",
            cancelText: t("adminDocuments.modals.delete.cancelText"),
            onOk: async () => {
                try {
                    await documentService.remove(doc.id);
                    message.success(t("adminDocuments.messages.deleted"));
                    fetch();
                } catch (e) {
                    message.error(e?.response?.data?.message || t("adminDocuments.messages.deleteError"));
                }
            },
        });
    };

    const columns = [
        {
            title: t("adminDocuments.columns.demande"),
            dataIndex: "demandePartageId",
            width: 140,
            render: (v) =>
                v ? (
                    <Button type="link" size="small" onClick={() => navigate(`/admin/demandes/${v}`)}>
                        {v}
                    </Button>
                ) : (
                    "—"
                ),
        },
        {
            title: t("adminDocuments.columns.ownerOrg"),
            dataIndex: ["ownerOrg", "name"],
            width: 280,
            render: (_, r) =>
                r.ownerOrg ? (
                    <Space direction="vertical" size={0}>
                        <div>{r.ownerOrg.name}</div>
                        {/* <div style={{ fontSize: 12, color: "#666" }}>
                            {r.ownerOrg.type} {r.ownerOrg.slug ? `• ${r.ownerOrg.slug}` : ""}
                        </div> */}
                    </Space>
                ) : (
                    <Tag>{r.ownerOrgId || "—"}</Tag>
                ),
        },
        {
            title: t("adminDocuments.columns.createdAt"),
            dataIndex: "createdAt",
            width: 160,
            render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
        },

        {
            title: t("adminDocuments.columns.actions"),
            key: "actions",
            fixed: "right",
            width: 320,
            render: (_, r) => (
                <Space wrap>
                    <Tooltip title={t("adminDocuments.actions.viewOriginal")}>
                        <Button icon={<EyeOutlined />} onClick={() => openUrl(r, "original")} />
                    </Tooltip>

                    <Tooltip title={t("adminDocuments.actions.viewTranslated")} placement="top" disabled={!hasTranslation(r)}>
                        <Button icon={<TranslationOutlined />} disabled={!hasTranslation(r)} onClick={() => openUrl(r, "traduit")} />
                    </Tooltip>
                    <Tooltip title={t("adminDocuments.actions.details")}>
                        <Button icon={<InfoCircleOutlined />} onClick={() => { setDrawerDoc(r); setDrawerOpen(true); }} />
                    </Tooltip>
                    <Tooltip title={t("adminDocuments.actions.delete")}>
                        <Button danger icon={<DeleteOutlined />} onClick={() => removeDoc(r)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="container-fluid relative px-3">
            <div className="layout-specing">
                <div className="md:flex justify-between items-center mb-6">
                    <h5 className="text-lg font-semibold">{t("adminDocuments.title")}</h5>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/admin/dashboard">{t("adminDocuments.breadcrumb.dashboard")}</Link> },
                            { title: t("adminDocuments.breadcrumb.documents") },
                        ]}
                    />
                </div>

                <Card className="mb-4">
                    <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
                        <Space wrap>
                            <Input
                                allowClear
                                placeholder={t("adminDocuments.filters.searchPlaceholder")}
                                style={{ width: 260 }}
                                value={filters.search}
                                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                                onPressEnter={() => fetch()}
                                suffix={<SearchOutlined onClick={() => fetch()} style={{ color: "#aaa" }} />}
                            />
                            <Input
                                allowClear
                                placeholder={t("adminDocuments.filters.demandePlaceholder")}
                                style={{ width: 240 }}
                                value={filters.demandePartageId}
                                onChange={(e) => setFilters((f) => ({ ...f, demandePartageId: e.target.value || undefined }))}
                            />
                            <Input
                                allowClear
                                placeholder={t("adminDocuments.filters.orgPlaceholder")}
                                style={{ width: 200 }}
                                value={filters.ownerOrgId}
                                onChange={(e) => setFilters((f) => ({ ...f, ownerOrgId: e.target.value || undefined }))}
                            />
                            <Select
                                allowClear
                                placeholder={t("adminDocuments.filters.translatedPlaceholder")}
                                style={{ width: 140 }}
                                value={filters.translated}
                                onChange={(v) => setFilters((f) => ({ ...f, translated: v }))}
                                options={[
                                    { value: true, label: t("adminDocuments.filters.translatedYes") },
                                    { value: false, label: t("adminDocuments.filters.translatedNo") },
                                ]}
                            />
                            <RangePicker
                                allowClear
                                onChange={(vals) => {
                                    const from = vals?.[0] ? vals[0].startOf("day").toISOString() : undefined;
                                    const to = vals?.[1] ? vals[1].endOf("day").toISOString() : undefined;
                                    setFilters((f) => ({ ...f, from, to }));
                                }}
                            />
                        </Space>

                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={() => fetch()}>
                                {t("adminDocuments.actions.refresh")}
                            </Button>
                        </Space>
                    </Space>
                </Card>

                <Table
                    rowKey="id"
                    dataSource={rows}
                    loading={loading}
                    columns={columns}
                    pagination={{
                        current: pag.current,
                        pageSize: pag.pageSize,
                        total: pag.total,
                        onChange: (p, ps) => fetch(p, ps, filters),
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "10", "20", "50"],
                    }}
                    scroll={{ x: 1200 }}
                />

                {/* Drawer détail document */}
                <Drawer
                    title={t("adminDocuments.drawer.title")}
                    width={560}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    destroyOnHidden
                >
                    {drawerDoc ? (
                        <Descriptions bordered column={1} size="small">
                            <Descriptions.Item label={t("adminDocuments.drawer.demande")}>
                                {drawerDoc.demandePartageId ? (
                                    <Button type="link" onClick={() => navigate(`/admin/demandes/${drawerDoc.demandePartageId}`)}>
                                        {drawerDoc.demandePartageId}
                                    </Button>
                                ) : (
                                    "—"
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("adminDocuments.drawer.owner")}>
                                {drawerDoc.ownerOrg ? (
                                    <Space direction="vertical" size={0}>
                                        <span>{drawerDoc.ownerOrg.name}</span>
                                        {/* <span style={{ fontSize: 12, color: "#666" }}>
                                            {drawerDoc.ownerOrg.type} {drawerDoc.ownerOrg.slug ? `• ${drawerDoc.ownerOrg.slug}` : ""}
                                        </span> */}
                                    </Space>
                                ) : (
                                    drawerDoc.ownerOrgId || "—"
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("adminDocuments.drawer.translationStatus")}>
                                {hasTranslation(drawerDoc) ? (
                                    <Tag color="green">{t("adminDocuments.translation.translated")}</Tag>
                                ) : (
                                    <Tag>{t("adminDocuments.translation.notTranslated")}</Tag>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("adminDocuments.drawer.encrypted")}>
                                {drawerDoc.encryptedAt || drawerDoc.urlChiffre ? (
                                    <Tag color="purple" icon={<LockOutlined />}>{t("adminDocuments.encryption.yes")}</Tag>
                                ) : (
                                    <Tag>{t("adminDocuments.encryption.no")}</Tag>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("adminDocuments.drawer.createdAt")}>
                                {drawerDoc.createdAt ? dayjs(drawerDoc.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("adminDocuments.drawer.encryptedAt")}>
                                {drawerDoc.encryptedAt ? dayjs(drawerDoc.encryptedAt).format("DD/MM/YYYY HH:mm") : "—"}
                            </Descriptions.Item>
                            <Descriptions.Item label={t("adminDocuments.drawer.quickActions")}>
                                <Space wrap>
                                    <Button icon={<EyeOutlined />} onClick={() => openUrl(drawerDoc, "original")}>
                                        {t("adminDocuments.actions.viewOriginal")}
                                    </Button>
                                    <Button icon={<TranslationOutlined />} disabled={!hasTranslation(drawerDoc)}
                                        onClick={() => openUrl(drawerDoc, "traduit")}
                                    >
                                        {t("adminDocuments.actions.viewTranslated")}
                                    </Button>
                                   </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    ) : null}
                </Drawer>

                {/* Modal preview */}
                <Modal
                    title={previewTitle || t("adminDocuments.preview.title")}
                    open={previewOpen}
                    onCancel={() => {
                        setPreviewOpen(false);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                    }}
                    footer={null}
                    width="95vw"
                    style={{ top: 20, paddingBottom: 0 }}
                    styles={{ body: { height: "calc(95vh - 110px)", padding: 0, overflow: "hidden" } }}
                    destroyOnHidden
                >
                    {previewUrl ? (
                        <iframe src={previewUrl} style={{ width: "100%", height: "100%", border: "none" }} title="preview" />
                    ) : (
                        <List
                            dataSource={[1]}
                            renderItem={() => (
                                <List.Item>
                                    <Space>
                                        <FileTextOutlined />
                                        {t("adminDocuments.preview.loading")}
                                    </Space>
                                    <Progress percent={60} status="active" />
                                </List.Item>
                            )}
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
}
