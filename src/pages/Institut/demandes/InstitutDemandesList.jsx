
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card, Table, Tag, Space, Button, Input, DatePicker, Select, Typography,
  message, Breadcrumb, Result, Spin, Modal, Radio
} from "antd";
import dayjs from "dayjs";
import demandeService from "@/services/demandeService";
import abonnementService from "@/services/abonnement.service";
import api from "@/services/api";
import { useAuth } from "../../../hooks/useAuth";
import {
  PlusOutlined, FileAddOutlined, EyeOutlined, ReloadOutlined, SearchOutlined, CreditCardOutlined
} from "@ant-design/icons";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../../../components/payment/CheckoutForm";
import paymentService from "../../../services/paymentService";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusColor = (s) =>
  s === "VALIDATED" ? "green" : s === "REJECTED" ? "red" : s === "IN_PROGRESS" ? "blue" : "default";

export default function InstitutDemandesList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const orgId = user?.organization?.id;

  // ---- Abonnement actif ----
  const [checkingAbo, setCheckingAbo] = useState(true);
  const [activeAbo, setActiveAbo] = useState(null);

  // ---- Table demandes ----
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [filters, setFilters] = useState({
    search: "",
    status: undefined,
    from: undefined,
    to: undefined,
    sortBy: "dateDemande",
    sortOrder: "desc"
  });

  // ---- Paiement (Stripe / PayPal) ----
  const [payOpen, setPayOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("stripe"); // 'stripe' | 'paypal'

  // Stripe
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [price, setPrice] = useState({ amount: null, currency: "USD" });
  const [initializingPay, setInitializingPay] = useState(false);

  // PayPal
  const [paypalOptions, setPaypalOptions] = useState(null);
  const [paypalReady, setPaypalReady] = useState(false);

  /** Charge l’abonnement actif de l’org (paywall) */
  const loadActiveAbo = useCallback(async () => {
    if (!orgId) return;
    setCheckingAbo(true);
    try {
      const res = await abonnementService.getActiveForOrg(orgId);
      setActiveAbo(res?.abonnement || null);
    } catch (e) {
      message.error(e.message);
      setActiveAbo(null);
    } finally {
      setCheckingAbo(false);
    }
  }, [orgId]);

  /** Liste des demandes (seulement si abo actif) */
  const fetchData = useCallback(
    async (page = pagination.page, limit = pagination.limit) => {
      if (!orgId || !activeAbo) return;
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
          search: filters.search || undefined,
          status: filters.status || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          targetOrgId: orgId
        };
        const res = await demandeService.list(params);
        setRows(res?.demandes || []);
        setPagination({
          page: res?.pagination?.page ?? page,
          limit: res?.pagination?.limit ?? limit,
          total: res?.pagination?.total ?? 0
        });
      } catch (e) {
        message.error(e?.message || t("institutDemandesList.toasts.loadError"));
      } finally {
        setLoading(false);
      }
    },
    [orgId, filters, activeAbo, pagination.page, pagination.limit, t]
  );

  useEffect(() => {
    if (!orgId) return;
    loadActiveAbo();
  }, [orgId, loadActiveAbo]);

  useEffect(() => {
    if (activeAbo) fetchData(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAbo]);

  /** Colonnes */
  const columns = useMemo(
    () => [
      {
        title: t("institutDemandesList.columns.code"),
        dataIndex: "code",
        render: (v, r) => (
          <Typography.Text copyable={{ text: r?.code }}>
            <Tag>
              <Link to={`/organisations/demandes/${r.id}/details`}>{v || "—"}</Link>
            </Tag>
          </Typography.Text>
        )
      },
      {
        title: t("institutDemandesList.columns.date"),
        dataIndex: "dateDemande",
        render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "—"),
        width: 140
      },
      {
        title: t("institutDemandesList.columns.demandeur"),
        key: "user",
        render: (_, r) => (
          <Tag>
            <Link to={`/organisations/demandeur/${r.user?.id}/details`}>{r.user?.email || ""}</Link>
          </Tag>
        )
      },
      { title: t("institutDemandesList.columns.assigned"), key: "assigned", render: (_, r) => r.assignedOrg?.name || "—" },
      { title: t("institutDemandesList.columns.docs"), dataIndex: "documentsCount", width: 90 },
      {
        title: t("institutDemandesList.columns.status"),
        dataIndex: "status",
        render: (s) => <Tag color={statusColor(s)}>{t(`institutDemandesList.statuses.${s || "PENDING"}`)}</Tag>,
        width: 140
      },
      {
        title: t("institutDemandesList.columns.actions"),
        key: "actions",
        fixed: "right",
        width: 220,
        render: (_, r) => (
          <Space>
            <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/organisations/demandes/${r.id}/details`)}>
              {t("institutDemandesList.buttons.details")}
            </Button>
          </Space>
        )
      }
    ],
    [navigate, t]
  );

  /** Filtres */
  const applyFilters = () => fetchData(1, pagination.limit);
  const resetFilters = () => {
    setFilters({
      search: "",
      status: undefined,
      from: undefined,
      to: undefined,
      sortBy: "dateDemande",
      sortOrder: "desc"
    });
    fetchData(1, pagination.limit);
  };

  /** ----- Paiement ----- */
  const openInlinePayment = async () => {
    navigate(`/organisations/${orgId}/abonnement`);
    // (tu gardes la modale Stripe/PayPal prête si tu veux repasser inline)
  };

  const initStripe = async () => {
    setInitializingPay(true);
    try {
      const data = await paymentService.createPaymentIntentInstitut({ institutId: orgId });
      const clientSecretNext = data?.clientSecret || data?.publishableKey;
      const pk = data?.publishableKey;
      if (!clientSecretNext) throw new Error(t("institutDemandesList.toasts.stripeSecretMissing"));
      setStripePromise(loadStripe(pk));
      setClientSecret(clientSecretNext);
      setPrice({
        amount: data?.price?.amount ?? null,
        currency: (data?.price?.currency || "USD").toUpperCase()
      });
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("institutDemandesList.toasts.stripeInitError"));
    } finally {
      setInitializingPay(false);
    }
  };

  const initPayPal = async () => {
    try {
      const cfg = await paymentService.getPayPalConfig();
      setPaypalOptions({
        clientId: cfg?.clientId || cfg?.client_id || "",
        currency: (cfg?.currency || "USD").toUpperCase(),
        intent: cfg?.intent || "capture"
      });
      setPaypalReady(true);
    } catch (e) {
      setPaypalOptions(null);
      setPaypalReady(false);
      message.error(e?.message || t("institutDemandesList.toasts.paypalCfgError"));
    }
  };

  const onChangePayMethod = async (e) => {
    const m = e.target.value;
    setPayMethod(m);
    if (m === "stripe" && !clientSecret) await initStripe();
    else if (m === "paypal" && !paypalOptions) await initPayPal();
  };

  const handlePaid = async ({ provider, payload }) => {
    try {
      const now = new Date();
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);

      const { data: aboRes } = await api.post(`/api/abonnements`, {
        organizationId: orgId,
        dateDebut: now.toISOString(),
        dateExpiration: nextYear.toISOString(),
        montant: typeof price.amount === "number" ? price.amount / 100 : undefined,
        currency: price.currency || "USD"
      });
      const abo = aboRes?.abonnement || aboRes;

      await api.post(`/api/payments`, {
        abonnementId: abo?.id,
        provider: provider === "stripe" ? "STRIPE" : "PAYPAL",
        providerRef: provider === "stripe" ? payload?.id : payload?.id,
        status:
          provider === "stripe"
            ? (payload?.status?.toUpperCase() === "SUCCEEDED" ? "PAID" : "PENDING")
            : (payload?.status?.toUpperCase?.() || "COMPLETED"),
        amount:
          provider === "stripe"
            ? (typeof payload?.amount_received === "number" ? payload.amount_received / 100 : undefined)
            : (Number(payload?.purchase_units?.[0]?.amount?.value) || undefined),
        currency:
          provider === "stripe"
            ? (payload?.currency || price.currency || "USD").toUpperCase()
            : (payload?.purchase_units?.[0]?.amount?.currency_code || price.currency || "USD"),
        paymentType: "SUBSCRIPTION",
        paymentInfo: payload
      });

      message.success(t("institutDemandesList.toasts.aboActivated", { provider }));
      setPayOpen(false);
      await loadActiveAbo();
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("institutDemandesList.toasts.postPayError"));
    }
  };

  /** --------- RENDER --------- */
  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("institutDemandesList.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/organisations/dashboard">{t("institutDemandesList.breadcrumbs.dashboard")}</Link> },
              { title: t("institutDemandesList.breadcrumbs.demandes") }
            ]}
          />
        </div>

        {checkingAbo ? (
          <Card>
            <Space align="center">
              <Spin />
              <Text>{t("institutDemandesList.paywall.checking")}</Text>
            </Space>
          </Card>
        ) : !activeAbo ? (
          <Card>
            <Result
              status="403"
              title={t("institutDemandesList.paywall.requiredTitle")}
              subTitle={
                <>
                  {t("institutDemandesList.paywall.requiredSub1")}
                  <br />
                  <Text type="secondary">{t("institutDemandesList.paywall.hint")}</Text>
                </>
              }
              extra={
                <Space wrap>
                  <Button type="primary" icon={<CreditCardOutlined />} onClick={openInlinePayment} loading={initializingPay}>
                    {t("institutDemandesList.buttons.subscribeNow")}
                  </Button>
                  <Button onClick={loadActiveAbo}>{t("institutDemandesList.buttons.recheck")}</Button>
                </Space>
              }
            />
          </Card>
        ) : (
          <>
            <div className="p-2 md:p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Title level={3} className="!mb-0">{t("institutDemandesList.section.titleMyInstitute")}</Title>
              </div>

              <Card className="mt-3" title={t("institutDemandesList.section.filters")}>
                <Space wrap>
                  <Input
                    placeholder={t("institutDemandesList.filters.searchPlaceholder")}
                    value={filters.search}
                    allowClear
                    prefix={<SearchOutlined />}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    style={{ minWidth: 280 }}
                  />
                  <Select
                    allowClear
                    placeholder={t("institutDemandesList.filters.statusPlaceholder")}
                    value={filters.status}
                    onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
                    style={{ width: 200 }}
                    options={["PENDING", "VALIDATED", "REJECTED", "IN_PROGRESS"].map((s) => ({
                      label: t(`institutDemandesList.statuses.${s}`),
                      value: s
                    }))}
                  />
                  <RangePicker
                    onChange={(v) =>
                      setFilters((f) => ({
                        ...f,
                        from: v?.[0]?.startOf("day")?.toISOString(),
                        to: v?.[1]?.endOf("day")?.toISOString()
                      }))
                    }
                  />
                  <Select
                    value={filters.sortBy}
                    onChange={(v) => setFilters((f) => ({ ...f, sortBy: v }))}
                    style={{ width: 200 }}
                    options={[
                      { value: "dateDemande", label: t("institutDemandesList.sortByOptions.dateDemande") },
                      { value: "createdAt", label: t("institutDemandesList.sortByOptions.createdAt") },
                      { value: "updatedAt", label: t("institutDemandesList.sortByOptions.updatedAt") },
                      { value: "code", label: t("institutDemandesList.sortByOptions.code") }
                    ]}
                  />
                  <Select
                    value={filters.sortOrder}
                    onChange={(v) => setFilters((f) => ({ ...f, sortOrder: v }))}
                    style={{ width: 140 }}
                    options={[
                      { value: "asc", label: t("institutDemandesList.sortOrderOptions.asc") },
                      { value: "desc", label: t("institutDemandesList.sortOrderOptions.desc") }
                    ]}
                  />
                  <Button type="primary" onClick={() => fetchData(1, pagination.limit)}>
                    {t("institutDemandesList.filters.apply")}
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                    {t("institutDemandesList.filters.reset")}
                  </Button>
                </Space>
              </Card>

              <Card className="mt-3" title={t("institutDemandesList.section.list")}>
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
                    showSizeChanger: true
                  }}
                  scroll={{ x: true }}
                />
              </Card>
            </div>
          </>
        )}
      </div>

      {/* ===== Modal Paiement (Stripe | PayPal) ===== */}
      <Modal open={payOpen} onCancel={() => setPayOpen(false)} footer={null} title={t("institutDemandesList.paymentModal.title")} destroyOnHidden>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Radio.Group value={payMethod} onChange={onChangePayMethod}>
            <Radio.Button value="stripe">{t("institutDemandesList.paymentModal.methodStripe")}</Radio.Button>
            <Radio.Button value="paypal">{t("institutDemandesList.paymentModal.methodPaypal")}</Radio.Button>
          </Radio.Group>

          {price?.amount != null && (
            <Tag style={{ alignSelf: "flex-start" }}>
              {(price.amount / 100).toFixed(2)} {String(price.currency || "USD").toUpperCase()}
            </Tag>
          )}

          {payMethod === "stripe" && (
            <>
              {initializingPay ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Spin /> <span>{t("institutDemandesList.paymentModal.stripeInit")}</span>
                </div>
              ) : stripePromise && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    amount={price?.amount ? price.amount / 100 : undefined}
                    currency={price?.currency || "USD"}
                    onPaymentSuccess={(paymentIntent) => handlePaid({ provider: "stripe", payload: paymentIntent })}
                  />
                </Elements>
              ) : (
                <Button onClick={initStripe}>{t("institutDemandesList.paymentModal.stripeRetry")}</Button>
              )}
            </>
          )}

          {payMethod === "paypal" && (
            <>
              {!paypalOptions ? (
                <Button onClick={initPayPal}>{t("institutDemandesList.paymentModal.paypalLoad")}</Button>
              ) : (
                <PayPalScriptProvider options={paypalOptions}>
                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    createOrder={(data, actions) => {
                      const val = (price?.amount ? price.amount / 100 : 0) || 0;
                      return actions.order.create({
                        purchase_units: [{ amount: { value: Number(val).toFixed(2), currency_code: paypalOptions.currency } }]
                      });
                    }}
                    onApprove={(data, actions) =>
                      actions.order.capture().then((order) => handlePaid({ provider: "paypal", payload: order }))
                    }
                    onError={(err) => {
                      console.error("PayPal Error", err);
                      message.error(t("institutDemandesList.paymentModal.paypalError"));
                    }}
                  />
                </PayPalScriptProvider>
              )}
            </>
          )}
        </Space>
      </Modal>
    </div>
  );
}
