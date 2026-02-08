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
    Grid,
    Input,
    List,
    Modal,
    Progress,
    Row,
    Col,
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
    ExclamationCircleOutlined,
    DeleteOutlined,
    FileTextOutlined,
    LockOutlined,
    TranslationOutlined,
    InfoCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import documentService from "@/services/documentService";
import organizationService from "@/services/organizationService";
import { hasTranslation, hasOriginal, normalizeDocument } from "@/utils/documentUtils";
import { DATE_FORMAT } from "@/utils/dateFormat";

const { RangePicker } = DatePicker;
const { confirm } = Modal;

export default function DocumentsList() {
    const { t } = useTranslation();
    const breakpoint = Grid.useBreakpoint();
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
                const data = res?.data ?? res;
                setOrgs(data?.organizations ?? []);
            } catch {
                // silencieux
            }
        })();
    }, []);

    const fetch = useCallback(async (page = pag.current, pageSize = pag.pageSize, f = filters) => {
        setLoading(true);
        try {
            const res = await documentService.list({
                page,
                limit: pageSize,
                search: f.search || undefined,
                demandePartageId: f.demandePartageId || undefined,
                ownerOrgId: f.ownerOrgId || undefined,
                translated: typeof f.translated === "boolean" ? f.translated : undefined,
                from: f.from || undefined,
                to: f.to || undefined,
            });
            const data = res?.data ?? res;
            const documents = data?.documents ?? data?.data ?? [];
            const pagination = data?.pagination ?? {};
            const normalizedDocs = (Array.isArray(documents) ? documents : []).map((doc) => normalizeDocument(doc));
            setRows(normalizedDocs);
            setPag({ current: page, pageSize, total: pagination?.total ?? normalizedDocs.length });
        } catch (e) {
            message.error(e?.response?.data?.message || t("adminDocuments.messages.loadError"));
        } finally {
            setLoading(false);
        }
    }, [pag.current, pag.pageSize, filters, t]);

    useEffect(() => {
        fetch(1, pag.pageSize, filters);
    }, [filters.search, filters.demandePartageId, filters.ownerOrgId, filters.translated, filters.from, filters.to]);


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

    const getTypeLabel = (type) => t(`adminDocuments.types.${type || "OTHER"}`);

    const columns = [
        {
            title: t("adminDocuments.columns.demande"),
            key: "demande",
            width: 140,
            render: (_, r) => {
                const id = r.demandePartageId;
                const code = r.demandePartage?.code;
                if (!id) return "—";
                return (
                    <Link to={`/admin/demandes/${id}/details`} className="break-all">
                        {code || id}
                    </Link>
                );
            },
        },
        {
            title: t("adminDocuments.columns.type"),
            dataIndex: "type",
            key: "type",
            width: 120,
            render: (v) => (v ? <Tag color="blue">{getTypeLabel(v)}</Tag> : "—"),
        },
        {
            title: t("adminDocuments.columns.mention"),
            dataIndex: "mention",
            key: "mention",
            width: 120,
            render: (v) => <span className="break-words">{v || "—"}</span>,
        },
        {
            title: t("adminDocuments.columns.dateObtention"),
            dataIndex: "dateObtention",
            key: "dateObtention",
            width: 120,
            render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
        },
        {
            title: t("adminDocuments.columns.translated"),
            key: "estTraduit",
            width: 100,
            render: (_, r) =>
                hasTranslation(r) ? (
                    <Tag color="green">{t("adminDocuments.translation.translated")}</Tag>
                ) : (
                    <Tag>{t("adminDocuments.translation.notTranslated")}</Tag>
                ),
        },
        {
            title: t("adminDocuments.columns.ownerOrg"),
            key: "ownerOrg",
            width: 180,
            render: (_, r) => (
                <span className="break-words">{r.ownerOrg?.name ?? r.ownerOrgId ?? "—"}</span>
            ),
        },
        {
            title: t("adminDocuments.columns.createdAt"),
            dataIndex: "createdAt",
            key: "createdAt",
            width: 140,
            render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
        },
        {
            title: t("adminDocuments.columns.actions"),
            key: "actions",
            fixed: "right",
            width: 200,
            render: (_, r) => (
                <Space size="small" wrap>
                    <Tooltip title={t("adminDocuments.actions.viewOriginal")}>
                        <Button size="small" icon={<EyeOutlined />} disabled={!hasOriginal(r)} onClick={() => openUrl(r, "original")} />
                    </Tooltip>
                    <Tooltip title={t("adminDocuments.actions.viewTranslated")} placement="top" disabled={!hasTranslation(r)}>
                        <Button size="small" icon={<TranslationOutlined />} disabled={!hasTranslation(r)} onClick={() => openUrl(r, "traduit")} />
                    </Tooltip>
                    <Tooltip title={t("adminDocuments.actions.details")}>
                        <Button size="small" icon={<InfoCircleOutlined />} onClick={() => { setDrawerDoc(r); setDrawerOpen(true); }} />
                    </Tooltip>
                    <Tooltip title={t("adminDocuments.actions.delete")}>
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeDoc(r)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="container-fluid relative px-2 sm:px-3 overflow-x-hidden max-w-full">
            <div className="layout-specing py-4 sm:py-6">
                <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                    <h5 className="text-base sm:text-lg font-semibold order-2 sm:order-1 break-words">
                        {t("adminDocuments.title")}
                    </h5>
                    <Breadcrumb
                        className="order-1 sm:order-2"
                        items={[
                            { title: <Link to="/admin/dashboard">{t("adminDocuments.breadcrumb.dashboard")}</Link> },
                            { title: t("adminDocuments.breadcrumb.documents") },
                        ]}
                    />
                </div>

                <Card className="mb-4 sm:mb-6 overflow-hidden">
                    <Row gutter={[16, 16]} align="middle">
                        <Col xs={24} sm={24} md={8} lg={6}>
                            <Input
                                allowClear
                                placeholder={t("adminDocuments.filters.searchPlaceholder")}
                                value={filters.search}
                                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                                onPressEnter={() => fetch()}
                                suffix={<SearchOutlined onClick={() => fetch()} style={{ color: "#aaa", cursor: "pointer" }} />}
                                className="w-full"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Input
                                allowClear
                                placeholder={t("adminDocuments.filters.demandePlaceholder")}
                                value={filters.demandePartageId}
                                onChange={(e) => setFilters((f) => ({ ...f, demandePartageId: e.target.value || undefined }))}
                                className="w-full"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <Select
                                allowClear
                                placeholder={t("adminDocuments.filters.orgPlaceholder")}
                                value={filters.ownerOrgId}
                                onChange={(v) => setFilters((f) => ({ ...f, ownerOrgId: v }))}
                                className="w-full"
                                showSearch
                                optionFilterProp="label"
                                options={(orgs || []).map((o) => ({ value: o.id, label: o.name || o.slug || o.id }))}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={4}>
                            <Select
                                allowClear
                                placeholder={t("adminDocuments.filters.translatedPlaceholder")}
                                value={filters.translated}
                                onChange={(v) => setFilters((f) => ({ ...f, translated: v }))}
                                className="w-full"
                                options={[
                                    { value: true, label: t("adminDocuments.filters.translatedYes") },
                                    { value: false, label: t("adminDocuments.filters.translatedNo") },
                                ]}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Space wrap size="small">
                                <RangePicker
                                    allowClear
                                    format={DATE_FORMAT}
                                    className="w-full sm:w-auto"
                                    onChange={(vals) => {
                                        const from = vals?.[0] ? vals[0].startOf("day").toISOString() : undefined;
                                        const to = vals?.[1] ? vals[1].endOf("day").toISOString() : undefined;
                                        setFilters((f) => ({ ...f, from, to }));
                                    }}
                                />
                                <Button icon={<ReloadOutlined />} onClick={() => fetch()} className="w-full sm:w-auto">
                                    {t("adminDocuments.actions.refresh")}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Card className="overflow-hidden">
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
                            showTotal: (total) => `${total}`,
                        }}
                        scroll={{ x: "max-content" }}
                    />
                </Card>

                {/* Drawer détail document — responsive */}
                <Drawer
                    title={t("adminDocuments.drawer.title")}
                    width={breakpoint.xs && !breakpoint.sm ? "100%" : breakpoint.sm && !breakpoint.md ? 400 : 560}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    destroyOnHidden
                    styles={{
                        body: { padding: "16px 12px 24px", overflowX: "hidden" },
                        header: { padding: "12px 16px" },
                    }}
                    classNames={{ content: "!max-w-[100vw]" }}
                >
                    {drawerDoc ? (
                        <div className="min-w-0 overflow-hidden">
                            <Descriptions
                                bordered
                                column={1}
                                size="small"
                                className="break-words [&_.ant-descriptions-item-label]:min-w-[120px] [&_.ant-descriptions-item-content]:break-words"
                            >
                                <Descriptions.Item label={t("adminDocuments.drawer.demande")}>
                                    {drawerDoc.demandePartageId ? (
                                        <Link to={`/admin/demandes/${drawerDoc.demandePartageId}/details`} className="break-all">
                                            {drawerDoc.demandePartage?.code || drawerDoc.demandePartageId}
                                        </Link>
                                    ) : (
                                        "—"
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminDocuments.drawer.type")}>
                                    {drawerDoc.type ? getTypeLabel(drawerDoc.type) : "—"}
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminDocuments.drawer.mention")}>
                                    {drawerDoc.mention || "—"}
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminDocuments.drawer.dateObtention")}>
                                    {drawerDoc.dateObtention ? dayjs(drawerDoc.dateObtention).format("DD/MM/YYYY") : "—"}
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminDocuments.drawer.owner")}>
                                    <span className="break-words">{drawerDoc.ownerOrg?.name ?? drawerDoc.ownerOrgId ?? "—"}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminDocuments.drawer.translationStatus")}>
                                    {hasTranslation(drawerDoc) ? (
                                        <Tag color="green">{t("adminDocuments.translation.translated")}</Tag>
                                    ) : (
                                        <Tag>{t("adminDocuments.translation.notTranslated")}</Tag>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label={t("adminDocuments.drawer.encrypted")}>
                                    {drawerDoc.encryptedAt || drawerDoc.urlChiffre || drawerDoc.original?.isEncrypted ? (
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
                                    <Space wrap size="small" className="w-full">
                                        <Button size="small" icon={<EyeOutlined />} disabled={!hasOriginal(drawerDoc)} onClick={() => openUrl(drawerDoc, "original")} className="w-full sm:w-auto min-w-0">
                                            {t("adminDocuments.actions.viewOriginal")}
                                        </Button>
                                        <Button size="small" icon={<TranslationOutlined />} disabled={!hasTranslation(drawerDoc)} onClick={() => openUrl(drawerDoc, "traduit")} className="w-full sm:w-auto min-w-0">
                                            {t("adminDocuments.actions.viewTranslated")}
                                        </Button>
                                    </Space>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
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
                    style={{ top: 20, paddingBottom: 0, maxWidth: 1200 }}
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
