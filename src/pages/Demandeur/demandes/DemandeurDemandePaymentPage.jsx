/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Tabs,
  Typography,
  Space,
  Button,
  Alert,
  Breadcrumb,
  Tag,
  Descriptions,
  Divider,
  Skeleton,
  message,
} from "antd";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import paymentService from "@/services/paymentService";
import demandeService from "@/services/demandeService";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

/* -------------------------------------------------------
   Helpers UI
------------------------------------------------------- */
const statusColor = (s) =>
  s === "VALIDATED" ? "green" : s === "REJECTED" ? "red" : s === "IN_PROGRESS" ? "gold" : "blue";

/* -------------------------------------------------------
   STRIPE Checkout (PaymentElement)
   - utilise client_secret retourné par /stripe/create-intent
   - confirme le paiement et appelle /stripe/confirm
------------------------------------------------------- */
function StripeCheckout({ demandeId, clientSecret, amount, currency }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const onPay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    try {
      // 1) Confirmer côté Stripe (redirections SCA si besoin)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        // Pas de return_url => on reste en SPA ; Stripe fera modal SCA au besoin
        redirect: "if_required",
      });

      if (error) {
        // Erreurs cartes, SCA cancel, etc.
        throw new Error(error.message || t("demandeurDemandePayment.messages.paymentRefused"));
      }

      // 2) Sécuriser côté serveur (mise à jour DB)
      await paymentService.confirmStripe({
        demandeId,
        paymentIntentId: paymentIntent.id,
      });

      // 3) Succès
      // (le backend met le statut paiement à PAID)
      window.location.reload();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      const msg = e?.response?.data?.message || e?.message || t("demandeurDemandePayment.messages.stripeError");
      // Petit garde-fou sur les doubles erreurs
      if (msg.toLowerCase().includes("invalid api key") || msg.toLowerCase().includes("no such payment_intent")) {
        // clés / config côté serveur
      }
      // Antd
      // eslint-disable-next-line no-undef
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!clientSecret) {
    return (
      <Alert
        type="warning"
        message={t("demandeurDemandePayment.stripe.initError")}
        showIcon
      />
    );
  }

  return (
    <Space direction="vertical" size="middle" className="w-full">
      <Alert
        type="info"
        showIcon
        message={
          <span>
            {t("demandeurDemandePayment.stripe.amountToPay")} <b>{amount} {currency}</b>
          </span>
        }
        description={t("demandeurDemandePayment.stripe.amountFixed")}
      />
      <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      <Button type="primary" onClick={onPay} loading={submitting} disabled={!stripe || !elements}>
        {t("demandeurDemandePayment.stripe.payNow")}
      </Button>
    </Space>
  );
}

/* -------------------------------------------------------
   PAYPAL Buttons
   - appelle /paypal/create-order puis /paypal/capture
------------------------------------------------------- */
function PaypalButtons({ demandeId, amount, currency }) {
  const { t } = useTranslation();
  const [sdkReady, setSdkReady] = useState(false);

  // Injecter le SDK paypal côté client
  useEffect(() => {
    const cid = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!cid) return;

    if (document.getElementById("paypal-sdk")) {
      setSdkReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "paypal-sdk";
    s.src = `https://www.paypal.com/sdk/js?client-id=${cid}&currency=${currency}`;
    s.onload = () => setSdkReady(true);
    s.onerror = () => message.error(t("demandeurDemandePayment.paypal.sdkError"));
    document.body.appendChild(s);
  }, [currency]);

  useEffect(() => {
    if (!sdkReady || !window.paypal) return;

    const containerId = "paypal-buttons-container";
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    window.paypal
      .Buttons({
        // Le backend recalcule toujours le prix depuis la quote
        createOrder: async () => {
          try {
            const { orderID } = await paymentService.createPaypalOrder({ demandeId });
            return orderID;
          } catch (e) {
            // eslint-disable-next-line no-undef
            message.error(e?.response?.data?.message || t("demandeurDemandePayment.paypal.initError"));
            throw e;
          }
        },
        onApprove: async (data) => {
          try {
            await paymentService.capturePaypalOrder({ demandeId, orderID: data.orderID });
            // eslint-disable-next-line no-undef
            message.success(t("demandeurDemandePayment.paypal.success") + " 🎉");
            window.location.reload();
          } catch (e) {
            // eslint-disable-next-line no-undef
            message.error(e?.response?.data?.message || t("demandeurDemandePayment.paypal.captureError"));
          }
        },
        onError: (err) => {
          // eslint-disable-next-line no-console
          console.error(err);
          // eslint-disable-next-line no-undef
          message.error(t("demandeurDemandePayment.paypal.error"));
        },
      })
      .render(`#${containerId}`);
  }, [sdkReady, demandeId, amount, currency]);

  return (
    <Space direction="vertical" size="middle" className="w-full">
      <Alert
        type="info"
        showIcon
        message={
          <span>
            {t("demandeurDemandePayment.paypal.amountToPay")} <b>{amount} {currency}</b>
          </span>
        }
        description={t("demandeurDemandePayment.paypal.amountFixed")}
      />
      <div id="paypal-buttons-container" />
      {!sdkReady && <Alert type="info" message={t("demandeurDemandePayment.paypal.loading")} showIcon />}
    </Space>
  );
}

/* -------------------------------------------------------
   PAGE Paiement Demandeur
------------------------------------------------------- */
export default function DemandeurDemandePaymentPage() {
  const { t } = useTranslation();
  const { demandeId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [demande, setDemande] = useState(null);
  const [payInfo, setPayInfo] = useState(null);
  const [quote, setQuote] = useState(null);

  // Stripe publishable key (front)
  const stripePromise = useMemo(() => {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return key ? loadStripe(key) : null;
  }, []);

  // client_secret pour PaymentElement
  const [stripeClientSecret, setStripeClientSecret] = useState("");

  // Prépare tous les éléments de la page (demande + quote + état de paiement + intent Stripe)
  const bootstrap = useCallback(async () => {
    setLoading(true);
    try {
      const [d, p, q] = await Promise.all([
        demandeService.getById(demandeId),
        paymentService.getForDemande(demandeId), // {statusPayment, payment}
        paymentService.getQuote(demandeId),      // {demandeId, amount, currency, reason, pricingSource}
      ]);
      const demandeData = d?.demande || d;
      setDemande(demandeData);
      setPayInfo(p);
      setQuote(q);

      const isPaid =
        (p?.statusPayment || demandeData?.statusPayment)?.toUpperCase?.() === "PAID";
        if (!isPaid && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        const { clientSecret } = await paymentService.createStripeIntent({
          demandeId,
        });
        console.log("clientSecret", clientSecret);
        setStripeClientSecret(clientSecret);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // eslint-disable-next-line no-undef
      message.error(e?.response?.data?.message || t("demandeurDemandePayment.messages.loadError"));
    } finally {
      setLoading(false);
    }
  }, [demandeId]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const alreadyPaid =
    (payInfo?.statusPayment || demande?.statusPayment)?.toUpperCase?.() === "PAID";

  const amount = quote?.amount ?? 0;
  const currency = (quote?.currency || "USD").toUpperCase();

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("demandeurDemandePayment.pageTitle")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandeurDemandePayment.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/demandeur/mes-demandes">{t("demandeurDemandePayment.breadcrumbs.demandes")}</Link> },
              { title: <Link to={`/demandeur/mes-demandes/${demandeId}/details`}>{t("demandeurDemandePayment.breadcrumbs.detail")}</Link> },
              { title: t("demandeurDemandePayment.breadcrumbs.payment") },
            ]}
          />
        </div>

        <Card>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <>
              {/* Bandeau montant */}
              {quote && (
                <Alert
                  className="mb-4"
                  type="info"
                  showIcon
                  message={
                    <span>
                      {t("demandeurDemandePayment.alerts.totalAmount")} <b>{amount} {currency}</b>
                    </span>
                  }
                  description={
                    <>
                      {t("demandeurDemandePayment.alerts.pricingApplied")} <b>{quote?.reason}</b>{" "}
                      ({t("demandeurDemandePayment.alerts.source")} <code>{quote?.pricingSource}</code>).
                      <br />
                      {t("demandeurDemandePayment.alerts.amountFixed")}
                    </>
                  }
                />
              )}

              {/* Infos Demande */}
              <Descriptions
                title={t("demandeurDemandePayment.summary.title")}
                bordered
                size="small"
                column={{ xs: 1, sm: 1, md: 2, lg: 3 }}
              >
                <Descriptions.Item label={t("demandeurDemandePayment.summary.code")}>
                  <Text code>{demande?.code || demandeId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeurDemandePayment.summary.date")}>
                  {demande?.dateDemande
                    ? new Date(demande.dateDemande).toLocaleString()
                    : t("demandeurDemandePayment.common.na")}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeurDemandePayment.summary.status")}>
                  <Tag color={statusColor(demande?.status)}>
                    {t(`demandeurDemandes.status.${demande?.status || "PENDING"}`)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeurDemandePayment.summary.targetOrg")}>
                  {demande?.targetOrg?.name || t("demandeurDemandePayment.common.na")}{" "}
                  {demande?.targetOrg?.type ? (
                    <Tag className="ml-1">{demande.targetOrg.type}</Tag>
                  ) : null}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeurDemandePayment.summary.assignedOrg")}>
                  {demande?.assignedOrg?.name || t("demandeurDemandePayment.common.na")}{" "}
                  {demande?.assignedOrg?.type ? (
                    <Tag className="ml-1">{demande.assignedOrg.type}</Tag>
                  ) : null}
                </Descriptions.Item>
                <Descriptions.Item label={t("demandeurDemandePayment.summary.paymentStatus")}>
                  <Tag color={alreadyPaid ? "green" : "volcano"}>
                    {alreadyPaid 
                      ? t("demandeurDemandePayment.paymentStatus.PAID")
                      : t(`demandeurDemandePayment.paymentStatus.${demande?.statusPayment || "UNPAID"}`)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* Si déjà payé, on bloque tout */}
              {alreadyPaid ? (
                <Alert
                  type="success"
                  showIcon
                  message={t("demandeurDemandePayment.alerts.alreadyPaid")}
                  description={
                    <Space direction="vertical">
                      <div>
                        <Text strong>{t("demandeurDemandePayment.summary.title")} :</Text> <Text code>{demande?.code}</Text>
                      </div>
                      <Button onClick={() => navigate(`/demandeur/mes-demandes/${demandeId}/details`)}>
                        {t("demandeurDemandePayment.alerts.backToDetail")}
                      </Button>
                    </Space>
                  }
                />
              ) : (
                <>
                  <Space direction="vertical" size="large" className="w-full">
                    <Tabs
                      items={[
                        {
                          key: "stripe",
                          label: t("demandeurDemandePayment.tabs.stripe"),
                          children: stripePromise ? (
                            stripeClientSecret ? (
                              <Elements
                                stripe={stripePromise}
                                options={{
                                  clientSecret: stripeClientSecret,
                                  appearance: { theme: "stripe" },
                                }}
                              >
                                <StripeCheckout
                                  demandeId={demandeId}
                                  clientSecret={stripeClientSecret}
                                  amount={amount}
                                  currency={currency}
                                />
                              </Elements>
                            ) : (
                              <Alert
                                type="warning"
                                message={t("demandeurDemandePayment.stripe.secretMissing")}
                              />
                            )
                          ) : (
                            <Alert
                              type="warning"
                              message={t("demandeurDemandePayment.stripe.notConfigured")}
                            />
                          ),
                        },
                        {
                          key: "paypal",
                          label: t("demandeurDemandePayment.tabs.paypal"),
                          children: import.meta.env.VITE_PAYPAL_CLIENT_ID ? (
                            <PaypalButtons
                              demandeId={demandeId}
                              amount={amount}
                              currency={currency}
                            />
                          ) : (
                            <Alert
                              type="warning"
                              message={t("demandeurDemandePayment.paypal.notConfigured")}
                            />
                          ),
                        },
                      ]}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => navigate(`/demandeur/mes-demandes/${demandeId}/details`)}>
                        {t("demandeurDemandePayment.alerts.backToDetail")}
                      </Button>
                    </div>
                  </Space>
                </>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
