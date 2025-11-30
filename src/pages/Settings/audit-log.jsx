
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  Table,
  Spin,
  Tag,
  Breadcrumb,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
} from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import settingsService from "../../services/settingsService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const actionColor = (a) => {
  const map = {
    LOGIN: "green",
    LOGOUT: "default",
    DOCUMENT_ENCRYPTED: "purple",
    DOCUMENT_DECRYPTED: "magenta",
    DOCUMENT_TRANSLATION_ENCRYPTED: "geekblue",
    CREATE: "blue",
    UPDATE: "gold",
    DELETE: "red",
  };
  return map[a] || "default";
};

const AuditLogManagement = () => {
  const { t } = useTranslation();
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ---- Filtres
  const [filters, setFilters] = useState({
    search: "",
    actions: [],       // multi
    resources: [],     // multi
    userId: undefined, // select
    ip: "",
    dateRange: null,   // [dayjs, dayjs]
  });

  // Facettes (optionnel) – si tu as des endpoints, on les remplit, sinon on déduira depuis les data
  const [facetLoading, setFacetLoading] = useState(false);
  const [facetActions, setFacetActions] = useState([]);
  const [facetResources, setFacetResources] = useState([]);
  const [facetUsers, setFacetUsers] = useState([]);

  // Debounce pour search et IP
  const searchTimer = useRef(null);
  const ipTimer = useRef(null);
  const DEBOUNCE_MS = 400;

  const buildParams = useMemo(() => {
    const p = {
      page: pagination.current,
      limit: pagination.pageSize,
    };

    if (filters.search?.trim()) p.search = filters.search.trim();
    if (filters.ip?.trim()) p.ip = filters.ip.trim();
    if (filters.userId) p.userId = filters.userId;

    if (filters.actions?.length) p.actions = filters.actions.join(",");
    if (filters.resources?.length) p.resources = filters.resources.join(",");

    if (filters.dateRange && filters.dateRange.length === 2) {
      p.dateFrom = dayjs(filters.dateRange[0]).startOf("day").toISOString();
      p.dateTo = dayjs(filters.dateRange[1]).endOf("day").toISOString();
    }

    return p;
  }, [filters, pagination.current, pagination.pageSize]);

  const loadAuditLogs = async () => {
    try {
      setAuditLogsLoading(true);
      const response = await settingsService.getAudits(buildParams);

      // Supporte 2 formats : { data, pagination } ou { items, pagination }
      const rows = response?.data || response?.items || [];
      setAuditLogs(rows);

      // Pagination serveur
      if (response?.pagination) {
        setPagination((prev) => ({
          ...prev,
          current: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
        }));
      } else {
        // fallback client
        setPagination((prev) => ({ ...prev, total: rows.length || 0 }));
      }

      // Remplir facettes si vides (fallback à partir des données)
      if (!facetActions.length || !facetResources.length) {
        const acts = Array.from(new Set(rows.map((r) => r.action).filter(Boolean)));
        const ress = Array.from(new Set(rows.map((r) => r.resource).filter(Boolean)));
        if (!facetActions.length) setFacetActions(acts);
        if (!facetResources.length) setFacetResources(ress);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des logs d'audit:", error);
      toast.error(t("adminAuditLogs.messages.loadError"));
    } finally {
      setAuditLogsLoading(false);
    }
  };

  // (Optionnel) charger facettes depuis l’API si tu as un endpoint dédié
  const loadFacets = async () => {
    try {
      setFacetLoading(true);
      if (settingsService.getAuditFacets) {
        const fac = await settingsService.getAuditFacets();
        if (fac?.actions) setFacetActions(fac.actions);
        if (fac?.resources) setFacetResources(fac.resources);
        if (fac?.users) setFacetUsers(fac.users); // [{id, name/email}]
      }
    } catch (e) {
      // silencieux : on a déjà un fallback
    } finally {
      setFacetLoading(false);
    }
  };

  // Charge au montage + quand buildParams change
  useEffect(() => {
    loadAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildParams]);

  useEffect(() => {
    loadFacets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDetailsModal = (log) => {
    setSelectedLog(log);
    setIsDetailsModalVisible(true);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      actions: [],
      resources: [],
      userId: undefined,
      ip: "",
      dateRange: null,
    });
    setPagination((p) => ({ ...p, current: 1 }));
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("adminAuditLogs.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/admin/dashboard">{t("adminAuditLogs.breadcrumbs.dashboard")}</Link> },
              { title: t("adminAuditLogs.breadcrumbs.auditLogs") },
            ]}
          />
        </div>

        <div style={{ padding: 24, maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          {/* Filtres */}
          <Card title={t("adminAuditLogs.filters.title")} style={{ marginBottom: 16 }} loading={facetLoading}>
            <Form layout="vertical">
              <Space wrap size="middle" align="end">
                <Form.Item label={t("adminAuditLogs.filters.search.label")} style={{ minWidth: 280 }}>
                  <Input
                    allowClear
                    placeholder={t("adminAuditLogs.filters.search.placeholder")}
                    value={filters.search}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFilters((f) => ({ ...f, search: v }));
                      if (searchTimer.current) clearTimeout(searchTimer.current);
                      searchTimer.current = setTimeout(() => {
                        setPagination((p) => ({ ...p, current: 1 }));
                      }, DEBOUNCE_MS);
                    }}
                  />
                </Form.Item>

                <Form.Item label={t("adminAuditLogs.filters.action.label")} style={{ minWidth: 220 }}>
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder={t("adminAuditLogs.filters.action.placeholder")}
                    value={filters.actions}
                    onChange={(vals) => {
                      setFilters((f) => ({ ...f, actions: vals }));
                      setPagination((p) => ({ ...p, current: 1 }));
                    }}
                    maxTagCount="responsive"
                  >
                    {facetActions.map((a) => (
                      <Option key={a} value={a}>
                        <Tag color={actionColor(a)} style={{ marginRight: 8 }}>{a}</Tag>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={t("adminAuditLogs.filters.resource.label")} style={{ minWidth: 220 }}>
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder={t("adminAuditLogs.filters.resource.placeholder")}
                    value={filters.resources}
                    onChange={(vals) => {
                      setFilters((f) => ({ ...f, resources: vals }));
                      setPagination((p) => ({ ...p, current: 1 }));
                    }}
                    maxTagCount="responsive"
                  >
                    {facetResources.map((r) => (
                      <Option key={r} value={r}>{r}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={t("adminAuditLogs.filters.user.label")} style={{ minWidth: 240 }}>
                  <Select
                    showSearch
                    allowClear
                    placeholder={t("adminAuditLogs.filters.user.placeholder")}
                    optionFilterProp="label"
                    value={filters.userId}
                    onChange={(val) => {
                      setFilters((f) => ({ ...f, userId: val }));
                      setPagination((p) => ({ ...p, current: 1 }));
                    }}
                    options={
                      facetUsers.length
                        ? facetUsers.map((u) => ({
                            value: u.id,
                            label: u.name || `${u.firstName || ""} ${u.lastName || ""} (${u.email})`,
                          }))
                        : // fallback: déduire de la page courante
                          Array.from(
                            new Map(
                              auditLogs
                                .filter((l) => l.user)
                                .map((l) => [
                                  l.user.id,
                                  {
                                    value: l.user.id,
                                    label:
                                      `${l.user.firstName || ""} ${l.user.lastName || ""}`.trim() +
                                      (l.user.email ? ` (${l.user.email})` : ""),
                                  },
                                ])
                            ).values()
                          )
                    }
                  />
                </Form.Item>

                <Form.Item label={t("adminAuditLogs.filters.ip.label")} style={{ minWidth: 200 }}>
                  <Input
                    allowClear
                    placeholder={t("adminAuditLogs.filters.ip.placeholder")}
                    value={filters.ip}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFilters((f) => ({ ...f, ip: v }));
                      if (ipTimer.current) clearTimeout(ipTimer.current);
                      ipTimer.current = setTimeout(() => {
                        setPagination((p) => ({ ...p, current: 1 }));
                      }, DEBOUNCE_MS);
                    }}
                  />
                </Form.Item>

                <Form.Item label={t("adminAuditLogs.filters.dateRange.label")} style={{ minWidth: 300 }}>
                  <RangePicker
                    allowEmpty={[true, true]}
                    value={filters.dateRange}
                    onChange={(range) => {
                      setFilters((f) => ({ ...f, dateRange: range }));
                      setPagination((p) => ({ ...p, current: 1 }));
                    }}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button onClick={resetFilters}>{t("adminAuditLogs.filters.buttons.reset")}</Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        // force refresh avec les filtres courants
                        setPagination((p) => ({ ...p, current: 1 }));
                      }}
                    >
                      {t("adminAuditLogs.filters.buttons.apply")}
                    </Button>
                  </Space>
                </Form.Item>
              </Space>
            </Form>
          </Card>

          <Card title={t("adminAuditLogs.table.title")}>
            {auditLogsLoading ? (
              <div style={{ textAlign: "center", padding: 48 }}>
                <Spin size="large" />
              </div>
            ) : (
              <Table
                dataSource={auditLogs}
                rowKey="id"
                columns={[
                  {
                    title: t("adminAuditLogs.table.columns.user"),
                    key: "user",
                    render: (_, record) => (
                      <div>
                        {record.user ? (
                          <>
                            <div>
                              {record.user.firstName} {record.user.lastName}
                            </div>
                            <div style={{ fontSize: 12, color: "#999" }}>
                              {record.user.email}
                            </div>
                          </>
                        ) : (
                          <Tag>{t("adminAuditLogs.table.deletedUser")}</Tag>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: t("adminAuditLogs.table.columns.action"),
                    dataIndex: "action",
                    key: "action",
                    render: (a) => <Tag color={actionColor(a)}>{a}</Tag>,
                  },
                  {
                    title: t("adminAuditLogs.table.columns.resource"),
                    dataIndex: "resource",
                    key: "resource",
                    render: (r) => r || <Tag>{t("adminAuditLogs.table.na")}</Tag>,
                  },
                  {
                    title: t("adminAuditLogs.table.columns.resourceId"),
                    dataIndex: "resourceId",
                    key: "resourceId",
                    render: (resourceId) => resourceId || <Tag>{t("adminAuditLogs.table.na")}</Tag>,
                  },
                  {
                    title: t("adminAuditLogs.table.columns.date"),
                    dataIndex: "createdAt",
                    key: "createdAt",
                    render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm:ss"),
                  },
                  {
                    title: t("adminAuditLogs.table.columns.ip"),
                    dataIndex: "ipAddress",
                    key: "ipAddress",
                    render: (ipAddress) => ipAddress || <Tag>{t("adminAuditLogs.table.na")}</Tag>,
                  },
                  {
                    title: t("adminAuditLogs.table.columns.actions"),
                    key: "actions",
                    render: (_, record) => (
                      <Button type="link" size="small" onClick={() => showDetailsModal(record)}>
                        {t("adminAuditLogs.table.buttons.details")}
                      </Button>
                    ),
                  },
                ]}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  onChange: (page, pageSize) => {
                    setPagination({ ...pagination, current: page, pageSize });
                  },
                  showSizeChanger: true,
                  onShowSizeChange: (_current, size) => {
                    setPagination({ current: 1, pageSize: size, total: pagination.total });
                  },
                  pageSizeOptions: ["5", "10", "20", "50", "100"],
                }}
                scroll={{ x: true }}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Modal détails */}
      <Modal
        title={t("adminAuditLogs.modals.details.title")}
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={[<Button key="close" onClick={() => setIsDetailsModalVisible(false)}>{t("adminAuditLogs.modals.details.close")}</Button>]}
        width={800}
      >
        {selectedLog && (
          <div>
            <Card title={t("adminAuditLogs.modals.details.generalInfo")} style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "8px 16px" }}>
                <div><strong>{t("adminAuditLogs.modals.details.fields.id")}:</strong></div>
                <div>{selectedLog.id}</div>
                <div><strong>{t("adminAuditLogs.modals.details.fields.user")}:</strong></div>
                <div>
                  {selectedLog.user
                    ? `${selectedLog.user.firstName || ""} ${selectedLog.user.lastName || ""} (${selectedLog.user.email})`
                    : t("adminAuditLogs.table.deletedUser")}
                </div>
                <div><strong>{t("adminAuditLogs.modals.details.fields.action")}:</strong></div>
                <div>{selectedLog.action}</div>
                <div><strong>{t("adminAuditLogs.modals.details.fields.resource")}:</strong></div>
                <div>{selectedLog.resource}</div>
                <div><strong>{t("adminAuditLogs.modals.details.fields.resourceId")}:</strong></div>
                <div>{selectedLog.resourceId || t("adminAuditLogs.table.na")}</div>
                <div><strong>{t("adminAuditLogs.modals.details.fields.date")}:</strong></div>
                <div>{dayjs(selectedLog.createdAt).format("DD/MM/YYYY HH:mm:ss")}</div>
                <div><strong>{t("adminAuditLogs.modals.details.fields.ip")}:</strong></div>
                <div>{selectedLog.ipAddress || t("adminAuditLogs.table.na")}</div>
                <div><strong>{t("adminAuditLogs.modals.details.fields.userAgent")}:</strong></div>
                <div>{selectedLog.userAgent || t("adminAuditLogs.table.na")}</div>
              </div>
            </Card>
            {selectedLog.details && (
              <Card title={t("adminAuditLogs.modals.details.additionalDetails")}>
                <pre style={{ whiteSpace: "pre-wrap", fontSize: 14 }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogManagement;
