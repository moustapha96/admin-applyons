

/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Input,
  message,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Collapse,
  Statistic,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined,
  CopyOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTranslation } from "react-i18next";
import paymentService from "@/services/paymentService"; // => list({page,limit,...}), getById(id)
import { useNavigate } from "react-router-dom";

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const STATUS_COLORS = {
  SUCCEEDED: "green",
  CAPTURED: "purple",
  AUTHORIZED: "blue",
  REQUIRES_ACTION: "gold",
  INITIATED: "default",
  FAILED: "red",
  CANCELED: "orange",
};

// PAYMENT_TYPE_LABELS sera défini dans le composant avec useTranslation

const fmtMoney = (amt, cur) => {
  const n = Number(amt);
  if (!Number.isFinite(n)) return `${amt ?? ""} ${String(cur || "").toUpperCase()}`.trim();
  return `${n.toFixed(2)} ${String(cur || "").toUpperCase()}`.trim();
};

const mask = (s, unmask = 6) => {
  const str = String(s || "");
  if (str.length <= unmask) return str;
  return `${"*".repeat(Math.max(0, str.length - unmask))}${str.slice(-unmask)}`;
};

const sumByCurrency = (rows = []) => {
  return rows.reduce((acc, r) => {
    const cur = String(r.currency || "").toUpperCase() || "—";
    const n = Number(r.amount);
    if (!Number.isFinite(n)) return acc;
    acc[cur] = (acc[cur] || 0) + n;
    return acc;
  }, {});
};

const countBy = (rows, getter) =>
  rows.reduce((acc, r) => {
    const k = getter(r) ?? "UNKNOWN";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

/* =========================
   Page liste + statistiques
   ========================= */
export default function PaymentsList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const PAYMENT_TYPE_LABELS = {
    CARD: t("adminPayments.paymentTypes.CARD"),
    STRIPE: t("adminPayments.paymentTypes.STRIPE"),
    PAYPAL: t("adminPayments.paymentTypes.PAYPAL"),
    BANK_TRANSFER: t("adminPayments.paymentTypes.BANK_TRANSFER"),
    MOBILE_MONEY: t("adminPayments.paymentTypes.MOBILE_MONEY"),
  };

  // table state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // filters
  const [qProvider, setQProvider] = useState(); // string contains
  const [qStatus, setQStatus] = useState();
  const [qAbonnementId, setQAbonnementId] = useState();
  const [qDemandePartageId, setQDemandePartageId] = useState();
  const [qTransactionId, setQTransactionId] = useState();
  const [dateRange, setDateRange] = useState(null); // placeholder pour extension future

  // Drawer
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch
  const fetchData = useCallback(
    async (_page = page, _limit = limit) => {
      try {
        setLoading(true);
        const params = { page: _page, limit: _limit };
        if (qProvider) params.provider = qProvider;
        if (qStatus) params.status = qStatus;
        if (qAbonnementId) params.abonnementId = qAbonnementId;
        if (qDemandePartageId) params.demandePartageId = qDemandePartageId;
        if (qTransactionId) params.transactionId = qTransactionId;

        const res = await paymentService.list(params);
        const payments = res?.payments ?? res?.data?.payments ?? [];
        const pagination =
          res?.pagination ?? res?.data?.pagination ?? { page: _page, limit: _limit, total: payments.length, pages: 1 };

        setRows(payments);
        setPage(Number(pagination.page || _page));
        setLimit(Number(pagination.limit || _limit));
        setTotal(Number(pagination.total || payments.length));
      } catch (e) {
        console.error(e);
        message.error(t("adminPayments.messages.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [page, limit, qProvider, qStatus, qAbonnementId, qDemandePartageId, qTransactionId]
  );

  useEffect(() => {
    fetchData(1, limit);
  }, [qProvider, qStatus, qAbonnementId, qDemandePartageId, qTransactionId]); // relancer à chaque filtre

  const handleRefresh = () => fetchData(page, limit);

  // Détails
  const openDetails = async (id) => {
    try {
      setOpen(true);
      setLoadingDetails(true);
      const res = await paymentService.getById(id);
      const data = res?.payment ?? res?.data?.payment ?? null;
      setSelected(data);
    } catch (e) {
      console.error(e);
      message.error(t("adminPayments.messages.detailsError"));
    } finally {
      setLoadingDetails(false);
    }
  };

  /* ====== KPIs & Stats (agrégations basées sur les données) ====== */
  const providerOptions = useMemo(() => {
    const uniq = Array.from(new Set(rows.map((r) => (r.provider || "").toLowerCase()).filter(Boolean)));
    return uniq.map((p) => ({ value: p, label: p.toUpperCase() }));
  }, [rows]);

  const metrics = useMemo(() => {
    const byStatus = countBy(rows, (r) => r.status);
    const byProvider = countBy(rows, (r) => (r.provider || "").toUpperCase());
    const linkType = countBy(rows, (r) => (r.abonnement ? "ABONNEMENT" : r.demandePartage ? "DEMANDE" : "SANS LIEN"));
    const totalsByCurrency = sumByCurrency(rows);

    // petit formatage pour l'affichage “montant total”
    const currencyKeys = Object.keys(totalsByCurrency);
    let totalAmountLabel = "0";
    if (currencyKeys.length === 1) {
      const cur = currencyKeys[0];
      totalAmountLabel = fmtMoney(totalsByCurrency[cur], cur);
    } else if (currencyKeys.length > 1) {
      const first = currencyKeys[0];
      totalAmountLabel = `${fmtMoney(totalsByCurrency[first], first)} (+${currencyKeys.length - 1} devises)`;
    }

    // dernier paiement
    const last = [...rows].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())[0];

    return {
      count: rows.length,
      lastDate: last?.createdAt ? `${dayjs(last.createdAt).format("YYYY-MM-DD HH:mm")} (${dayjs(last.createdAt).fromNow()})` : "—",
      totalsByCurrency,
      totalAmountLabel,
      byStatus,
      byProvider,
      linkType,
    };
  }, [rows]);

  /* ====== Colonnes ====== */
  const columns = [
    {
      title: t("adminPayments.columns.date"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (v) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(v).format("YYYY-MM-DD HH:mm")}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(v).fromNow()}
          </Text>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      defaultSortOrder: "descend",
    },
    {
      title: t("adminPayments.columns.provider"),
      dataIndex: "provider",
      key: "provider",
      width: 120,
      render: (v) => <Tag>{String(v || "").toUpperCase()}</Tag>,
      filteredValue: qProvider ? [qProvider] : null,
      onFilter: (val, rec) => String(rec.provider || "").toLowerCase().includes(String(val || "").toLowerCase()),
    },
    {
      title: t("adminPayments.columns.type"),
      dataIndex: "paymentType",
      key: "paymentType",
      width: 140,
      render: (v) => <Tag color="processing">{PAYMENT_TYPE_LABELS[v] || String(v || "").toUpperCase()}</Tag>,
    },
    {
      title: t("adminPayments.columns.amount"),
      key: "amount",
      width: 160,
      render: (_, r) => <Text strong>{fmtMoney(r.amount, r.currency)}</Text>,
      align: "right",
    },
    {
      title: t("adminPayments.columns.status"),
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (s) => <Tag color={STATUS_COLORS[s] || "default"}>{s}</Tag>,
      filters: Object.keys(STATUS_COLORS).map((s) => ({ text: s, value: s })),
      onFilter: (val, rec) => rec.status === val,
      filteredValue: qStatus ? [qStatus] : null,
    },
    {
      title: t("adminPayments.columns.link"),
      key: "link",
      width: 260,
      render: (_, r) => {
        const d = r.demandePartage;
        const a = r.abonnement;
        if (a) {
          return (
            <Space direction="vertical" size={0}>
              <Space size={6}>
                <Tag color="geekblue">{t("adminPayments.linkTypes.ABONNEMENT")}</Tag>
                {/* <Text type="secondary">{a.id}</Text> */}
              </Space>
              <Text type="secondary">
                {a.dateDebut ? dayjs(a.dateDebut).format("YYYY-MM-DD") : "—"} →{" "}
                {a.dateExpiration ? dayjs(a.dateExpiration).format("YYYY-MM-DD") : "—"}
              </Text>
              <Text type="secondary">Montant abo: {fmtMoney(a.montant, r.currency)}</Text>
            </Space>
          );
        }
        if (d) {
          return (
            <Space direction="vertical" size={0}>
              <Space size={6}>
                <Tag color="blue">{t("adminPayments.linkTypes.DEMANDE")}</Tag>
                <Text strong>{d.code || d.id}</Text>
              </Space>
            </Space>
          );
        }
        return <Text type="secondary">—</Text>;
      },
    },
    {
      title: "",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, r) => (
        <Space>
          <Tooltip title={t("adminPayments.actions.details")}>
            <Button icon={<EyeOutlined />} onClick={() => openDetails(r.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid px-3" style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div className="layout-specing" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Title level={3} style={{ marginBottom: 16 }}>
          {t("adminPayments.title")}
        </Title>

        {/* ====== KPIs ====== */}
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} md={6}>
            <Card className="rounded-2xl">
              <Statistic title={t("adminPayments.stats.totalPayments")} value={metrics.count} />
              <div className="text-xs text-slate-500 mt-1">{t("adminPayments.stats.last")}: {metrics.lastDate}</div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="rounded-2xl">
              <Statistic title={t("adminPayments.stats.totalAmount")} value={metrics.totalAmountLabel} />
              <div className="text-xs text-slate-500 mt-1">
                {Object.entries(metrics.totalsByCurrency).map(([k, v]) => (
                  <Tag key={k} style={{ marginTop: 6 }}>
                    {fmtMoney(v, k)}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="rounded-2xl">
              <div className="text-sm text-slate-600 mb-2">{t("adminPayments.stats.byStatus")}</div>
              <Space wrap>
                {Object.entries(metrics.byStatus).map(([k, v]) => (
                  <Tag key={k} color={STATUS_COLORS[k] || "default"}>
                    <Space size={4}>
                      <span>{k}</span>
                      <span className="rounded bg-white/50 px-1.5 text-[10px]">{v}</span>
                    </Space>
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card className="rounded-2xl">
              <div className="text-sm text-slate-600 mb-2">{t("adminPayments.stats.linkTypes")}</div>
              <Space wrap>
                {Object.entries(metrics.linkType).map(([k, v]) => (
                  <Tag key={k}>
                    <Space size={4}>
                      <span>{k}</span>
                      <span className="rounded bg-white/50 px-1.5 text-[10px]">{v}</span>
                    </Space>
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* ====== Filtres ====== */}
        <Card style={{ marginBottom: 12 }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} md={6}>
              <Select
                allowClear
                showSearch
                placeholder={t("adminPayments.filters.provider")}
                style={{ width: "100%" }}
                value={qProvider}
                onChange={setQProvider}
                options={providerOptions}
                optionFilterProp="label"
                suffixIcon={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                allowClear
                placeholder={t("adminPayments.filters.status")}
                style={{ width: "100%" }}
                value={qStatus}
                onChange={setQStatus}
                options={Object.keys(STATUS_COLORS).map((s) => ({ value: s, label: s }))}
              />
            </Col>
            <Col xs={24} md={6}>
              <Input
                allowClear
                placeholder={t("adminPayments.filters.demandePartageId")}
                value={qDemandePartageId}
                onChange={(e) => setQDemandePartageId(e.target.value || undefined)}
              />
            </Col>
            <Col xs={24} md={6}>
              <Input
                allowClear
                placeholder={t("adminPayments.filters.transactionId")}
                value={qTransactionId}
                onChange={(e) => setQTransactionId(e.target.value || undefined)}
              />
            </Col>

            <Col xs={24} md={6}>
              <Input
                allowClear
                placeholder={t("adminPayments.filters.abonnementId")}
                value={qAbonnementId}
                onChange={(e) => setQAbonnementId(e.target.value || undefined)}
              />
            </Col>

            <Col xs={24} md={10}>
              <RangePicker style={{ width: "100%" }} value={dateRange} onChange={setDateRange} disabled />
            </Col>
            <Col xs={24} md={8} style={{ textAlign: "right" }}>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={() => fetchData(1, limit)}>
                  {t("adminPayments.actions.refresh")}
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* ====== Table ====== */}
        <Card>
          <Table
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={rows}
            scroll={{ x: 1000 }}
            pagination={{
              current: page,
              pageSize: limit,
              total,
              showSizeChanger: true,
              onChange: (p, l) => {
                setPage(p);
                setLimit(l);
                fetchData(p, l);
              },
            }}
          />
        </Card>

        <PaymentDrawer open={open} loading={loadingDetails} onClose={() => setOpen(false)} data={selected} />
      </div>
    </div>
  );
}

/* ===== Drawer de détails ===== */
function PaymentDrawer({ open, onClose, data, loading }) {
  const { t } = useTranslation();

  const PAYMENT_TYPE_LABELS = {
    CARD: t("adminPayments.paymentTypes.CARD"),
    STRIPE: t("adminPayments.paymentTypes.STRIPE"),
    PAYPAL: t("adminPayments.paymentTypes.PAYPAL"),
    BANK_TRANSFER: t("adminPayments.paymentTypes.BANK_TRANSFER"),
    MOBILE_MONEY: t("adminPayments.paymentTypes.MOBILE_MONEY"),
  };
  
  const copy = (txt) => {
    try {
      navigator.clipboard.writeText(String(txt ?? ""));
      message.success("Copié !");
    } catch {
      message.error("Impossible de copier");
    }
  };

  const jsonPretty = useMemo(() => {
    try {
      return JSON.stringify(data?.paymentInfo ?? {}, null, 2);
    } catch {
      return "{}";
    }
  }, [data]);

  return (
    <Drawer open={open} onClose={onClose} width={680} title={t("adminPayments.drawer.title")} destroyOnClose>
      <Card loading={loading} bordered={false} style={{ background: "transparent" }}>
        {data ? (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="ID">{data.id}</Descriptions.Item>
              <Descriptions.Item label="Créé le">
                {dayjs(data.createdAt).format("YYYY-MM-DD HH:mm")} ({dayjs(data.createdAt).fromNow()})
              </Descriptions.Item>
              <Descriptions.Item label="Provider">
                <Space>
                  <Tag>{String(data.provider || "").toUpperCase()}</Tag>
                  {data.providerRef ? (
                    <>
                      <Text type="secondary">{mask(data.providerRef, 8)}</Text>
                      <Tooltip title="Copier l'identifiant provider">
                        <Button size="small" icon={<CopyOutlined />} onClick={() => copy(data.providerRef)} />
                      </Tooltip>
                    </>
                  ) : null}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="processing">{PAYMENT_TYPE_LABELS[data.paymentType] || data.paymentType}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Montant">
                <Text strong>{fmtMoney(data.amount, data.currency)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag color={STATUS_COLORS[data.status] || "default"}>{data.status}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Rattachement">
                {data.abonnement ? (
                  <Space direction="vertical" size={0}>
                    <Space size={6}>
                      <Tag color="geekblue">ABONNEMENT</Tag>
                      <Text type="secondary">{data.abonnement.id}</Text>
                    </Space>
                    <Text type="secondary">
                      {data.abonnement.dateDebut ? dayjs(data.abonnement.dateDebut).format("YYYY-MM-DD") : "—"} →{" "}
                      {data.abonnement.dateExpiration ? dayjs(data.abonnement.dateExpiration).format("YYYY-MM-DD") : "—"}
                    </Text>
                    <Text type="secondary">Montant abo: {fmtMoney(data.abonnement.montant, data.currency)}</Text>
                  </Space>
                ) : data.demandePartage ? (
                  <Space wrap>
                    <Tag color="blue">DEMANDE</Tag>
                    <Text strong>{data.demandePartage.code || data.demandePartage.id}</Text>
                    <Tag>{data.demandePartage.status}</Tag>
                    <Button
                      size="small"
                      type="link"
                      icon={<LinkOutlined />}
                      onClick={() =>
                        window.open(`/demandeur/mes-demandes/${data.demandePartage.id}/details`, "_blank")
                      }
                    >
                      Ouvrir
                    </Button>
                  </Space>
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Mis à jour le">
                {dayjs(data.updatedAt).format("YYYY-MM-DD HH:mm")}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Collapse ghost>
              <Collapse.Panel header="paymentInfo (JSON brut)" key="json">
                {/* Petites infos utiles en en-tête si présentes */}
                {Array.isArray(data?.paymentInfo?.payment_method_types) && data.paymentInfo.payment_method_types.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs text-slate-500">Méthodes prises en charge :</div>
                    <Space wrap style={{ marginTop: 6 }}>
                      {data.paymentInfo.payment_method_types.map((m) => (
                        <Tag key={m}>{m}</Tag>
                      ))}
                    </Space>
                  </div>
                )}

                <Space style={{ marginBottom: 8 }}>
                  <Tooltip title="Copier JSON">
                    <Button icon={<CopyOutlined />} onClick={() => copy(jsonPretty)} />
                  </Tooltip>
                </Space>
                <pre
                  style={{
                    background: "#0d1117",
                    color: "#c9d1d9",
                    padding: 12,
                    borderRadius: 8,
                    maxHeight: 340,
                    overflow: "auto",
                    fontSize: 12,
                  }}
                >
                  {jsonPretty}
                </pre>
              </Collapse.Panel>
            </Collapse>
          </>
        ) : (
          <Text type="secondary">Sélectionnez un paiement…</Text>
        )}
      </Card>
    </Drawer>
  );
}
