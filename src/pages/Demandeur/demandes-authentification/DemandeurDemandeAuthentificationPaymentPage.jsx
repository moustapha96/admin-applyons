/* eslint-disable react/prop-types */
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
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import paymentService from "@/services/paymentService";
import demandeAuthentificationService from "@/services/demandeAuthentification.service";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

function StripeCheckoutDemandeAuth({ demandeAuthentificationId, clientSecret, amount, currency }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const onPay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) throw new Error(error.message || t("demandeurDemandePayment.messages.paymentRefused"));
      await paymentService.confirmStripeDemandeAuth({
        demandeAuthentificationId,
        paymentIntentId: paymentIntent.id,
      });
      window.location.reload();
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("demandeurDemandePayment.messages.stripeError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!clientSecret) {
    return <Alert type="warning" message={t("demandeurDemandePayment.stripe.initError")} showIcon />;
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

function PaypalButtonsDemandeAuth({ demandeAuthentificationId, amount, currency }) {
  const { t } = useTranslation();
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const cid = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!cid) return;
    if (document.getElementById("paypal-sdk-demande-auth")) {
      setSdkReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "paypal-sdk-demande-auth";
    s.src = `https://www.paypal.com/sdk/js?client-id=${cid}&currency=${currency}`;
    s.onload = () => setSdkReady(true);
    s.onerror = () => message.error(t("demandeurDemandePayment.paypal.sdkError"));
    document.body.appendChild(s);
  }, [currency, t]);

  useEffect(() => {
    if (!sdkReady || !window.paypal) return;
    const containerId = "paypal-buttons-demande-auth";
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    window.paypal
      .Buttons({
        createOrder: async () => {
          try {
            const { data } = await paymentService.createPaypalOrderDemandeAuth({
              demandeAuthentificationId,
              amount,
              currency,
            });
            return data?.orderID;
          } catch (e) {
            message.error(e?.response?.data?.message || t("demandeurDemandePayment.paypal.initError"));
            throw e;
          }
        },
        onApprove: async (data) => {
          try {
            await paymentService.capturePaypalOrderDemandeAuth({
              demandeAuthentificationId,
              orderID: data.orderID,
            });
            message.success(t("demandeurDemandePayment.paypal.success"));
            window.location.reload();
          } catch (e) {
            message.error(e?.response?.data?.message || t("demandeurDemandePayment.paypal.captureError"));
          }
        },
        onError: () => message.error(t("demandeurDemandePayment.paypal.error")),
      })
      .render(`#${containerId}`);
  }, [sdkReady, demandeAuthentificationId, amount, currency, t]);

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
      <div id="paypal-buttons-demande-auth" />
      {!sdkReady && <Alert type="info" message={t("demandeurDemandePayment.paypal.loading")} showIcon />}
    </Space>
  );
}

export default function DemandeurDemandeAuthentificationPaymentPage() {
  const { t } = useTranslation();
  const { id: demandeAuthentificationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [demande, setDemande] = useState(null);
  const [payInfo, setPayInfo] = useState(null);
  const [quote, setQuote] = useState(null);
  const [stripeClientSecret, setStripeClientSecret] = useState("");

  const stripePromise = useMemo(() => {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    return key ? loadStripe(key) : null;
  }, []);

  const bootstrap = useCallback(async () => {
    if (!demandeAuthentificationId) return;
    setLoading(true);
    try {
      const [dRes, pRes, qRes] = await Promise.all([
        demandeAuthentificationService.getById(demandeAuthentificationId),
        paymentService.getForDemandeAuthentification(demandeAuthentificationId),
        paymentService.getQuoteDemandeAuthentification(demandeAuthentificationId),
      ]);
      const d = dRes?.data ?? dRes;
      const p = pRes?.data ?? pRes;
      const q = qRes?.data ?? qRes;
      setDemande(d?.id ? d : null);
      setPayInfo(p);
      setQuote(q);
      const isPaid = (p?.statusPayment || "")?.toUpperCase?.() === "PAID";
      if (!isPaid && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        const res = await paymentService.createStripeIntentDemandeAuth({
          demandeAuthentificationId,
          currency: (q?.currency || "USD").toUpperCase(),
        });
        setStripeClientSecret(res?.data?.clientSecret || "");
      }
    } catch (e) {
      message.error(e?.response?.data?.message || t("demandesAuthentification.toasts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [demandeAuthentificationId, t]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const alreadyPaid = (payInfo?.statusPayment || "")?.toUpperCase?.() === "PAID";
  const amount = quote?.amount ?? 0;
  const currency = (quote?.currency || "USD").toUpperCase();

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="md:flex justify-between items-center mb-6">
          <h5 className="text-lg font-semibold">{t("demandesAuthentification.paymentPage.title")}</h5>
          <Breadcrumb
            items={[
              { title: <Link to="/demandeur/dashboard">{t("demandeurDemandePayment.breadcrumbs.dashboard")}</Link> },
              { title: <Link to="/demandeur/demandes-authentification">{t("demandesAuthentification.paymentPage.breadcrumbList")}</Link> },
              { title: <Link to={`/demandeur/demandes-authentification/${demandeAuthentificationId}`}>{t("demandesAuthentification.paymentPage.breadcrumbDetail")}</Link> },
              { title: t("demandesAuthentification.paymentPage.breadcrumbPayment") },
            ]}
          />
        </div>

        <Card>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <>
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
                  description={t("demandeurDemandePayment.alerts.amountFixed")}
                />
              )}

              <Descriptions
                title={t("demandesAuthentification.paymentPage.summaryTitle")}
                bordered
                size="small"
                column={{ xs: 1, sm: 2 }}
              >
                <Descriptions.Item label={t("demandesAuthentification.fields.codeADN")}>
                  <Text code>{demande?.codeADN || demandeAuthentificationId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.fields.status")}>
                  <Tag color="blue">{demande?.status || "—"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t("demandesAuthentification.payment.status")}>
                  <Tag color={alreadyPaid ? "green" : "volcano"}>
                    {alreadyPaid ? t("demandesAuthentification.payment.paid") : t("demandesAuthentification.payment.unpaid")}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {alreadyPaid ? (
                <Alert
                  type="success"
                  showIcon
                  message={t("demandesAuthentification.payment.alreadyPaid")}
                  description={
                    <Button onClick={() => navigate(`/demandeur/demandes-authentification/${demandeAuthentificationId}`)}>
                      {t("demandesAuthentification.paymentPage.backToDetail")}
                    </Button>
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
                          children: stripePromise && stripeClientSecret ? (
                            <Elements
                              stripe={stripePromise}
                              options={{ clientSecret: stripeClientSecret, appearance: { theme: "stripe" } }}
                            >
                              <StripeCheckoutDemandeAuth
                                demandeAuthentificationId={demandeAuthentificationId}
                                clientSecret={stripeClientSecret}
                                amount={amount}
                                currency={currency}
                              />
                            </Elements>
                          ) : (
                            <Alert type="warning" message={t("demandeurDemandePayment.stripe.secretMissing")} />
                          ),
                        },
                        {
                          key: "paypal",
                          label: t("demandeurDemandePayment.tabs.paypal"),
                          children: import.meta.env.VITE_PAYPAL_CLIENT_ID ? (
                            <PaypalButtonsDemandeAuth
                              demandeAuthentificationId={demandeAuthentificationId}
                              amount={amount}
                              currency={currency}
                            />
                          ) : (
                            <Alert type="warning" message={t("demandeurDemandePayment.paypal.notConfigured")} />
                          ),
                        },
                      ]}
                    />
                    <Button onClick={() => navigate(`/demandeur/demandes-authentification/${demandeAuthentificationId}`)}>
                      {t("demandesAuthentification.paymentPage.backToDetail")}
                    </Button>
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
