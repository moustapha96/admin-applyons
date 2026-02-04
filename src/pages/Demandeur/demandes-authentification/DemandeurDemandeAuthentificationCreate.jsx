"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Select, Button, Card, message, Space, Alert, Tabs, Divider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import organizationService from "@/services/organizationService";
import paymentService from "@/services/paymentService";
import { useTranslation } from "react-i18next";

const STRIPE_PUBLISHABLE = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = STRIPE_PUBLISHABLE ? loadStripe(STRIPE_PUBLISHABLE) : null;

function StripeCheckoutCreate({ payload, quote, onSuccess }) {
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
      const res = await paymentService.confirmStripeDemandeAuth({ paymentIntentId: paymentIntent.id });
      const data = res?.data ?? res;
      const demande = data?.demande;
      if (demande?.id) {
        message.success(t("demandesAuthentification.createSuccess"));
        onSuccess(demande);
      } else {
        message.success(t("demandeurDemandePayment.messages.paymentSuccess"));
      }
    } catch (e) {
      message.error(e?.response?.data?.message || e?.message || t("demandeurDemandePayment.messages.stripeError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!quote) return null;
  const amount = quote.amount ?? 0;
  const currency = (quote.currency || "USD").toUpperCase();

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

function PaypalButtonsCreate({ payload, quote, onSuccess }) {
  const { t } = useTranslation();
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const cid = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!cid || !quote) return;
    if (document.getElementById("paypal-sdk-create-demande-auth")) {
      setSdkReady(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "paypal-sdk-create-demande-auth";
    s.src = `https://www.paypal.com/sdk/js?client-id=${cid}&currency=${quote.currency || "USD"}`;
    s.onload = () => setSdkReady(true);
    s.onerror = () => message.error(t("demandeurDemandePayment.paypal.sdkError"));
    document.body.appendChild(s);
  }, [quote?.currency, t]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !payload?.attributedOrganizationId) return;
    const containerId = "paypal-buttons-create-demande-auth";
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    window.paypal
      .Buttons({
        createOrder: async () => {
          try {
            const { data } = await paymentService.createPaypalOrderDemandeAuth({
              attributedOrganizationId: payload.attributedOrganizationId,
              objet: payload.objet,
              observation: payload.observation,
              amount: quote?.amount,
              currency: quote?.currency || "USD",
            });
            return data?.orderID;
          } catch (e) {
            message.error(e?.response?.data?.message || t("demandeurDemandePayment.paypal.initError"));
            throw e;
          }
        },
        onApprove: async (data) => {
          try {
            const res = await paymentService.capturePaypalOrderDemandeAuth({ orderID: data.orderID });
            const resp = res?.data ?? res;
            const demande = resp?.demande;
            if (demande?.id) {
              message.success(t("demandesAuthentification.createSuccess"));
              onSuccess(demande);
            } else {
              message.success(t("demandeurDemandePayment.paypal.success"));
            }
          } catch (e) {
            message.error(e?.response?.data?.message || t("demandeurDemandePayment.paypal.captureError"));
          }
        },
        onError: () => message.error(t("demandeurDemandePayment.paypal.error")),
      })
      .render(`#${containerId}`);
  }, [sdkReady, payload, quote, t, onSuccess]);

  if (!quote) return null;
  const amount = quote.amount ?? 0;
  const currency = (quote.currency || "USD").toUpperCase();

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
      <div id="paypal-buttons-create-demande-auth" />
      {!sdkReady && <Alert type="info" message={t("demandeurDemandePayment.paypal.loading")} showIcon />}
    </Space>
  );
}

export default function DemandeurDemandeAuthentificationCreate() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [quote, setQuote] = useState(null);
  const [step, setStep] = useState("form");
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [paymentPayload, setPaymentPayload] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [orgRes, quoteRes] = await Promise.all([
          organizationService.list({ limit: 500 }),
          paymentService.getQuoteDemandeAuthNew(),
        ]);
        const list = orgRes?.organizations ?? orgRes?.data?.organizations ?? [];
        setOrganizations(list.filter((o) => ["INSTITUT", "UNIVERSITE", "LYCEE", "COLLEGE"].includes(o.type)));
        const q = quoteRes?.data ?? quoteRes;
        setQuote(q);
      } catch (e) {
        message.error(t("demandesAuthentification.toasts.orgLoadError"));
      }
    })();
  }, [t]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        attributedOrganizationId: values.attributedOrganizationId,
        objet: values.objet || undefined,
        observation: values.observation || undefined,
        currency: (quote?.currency || "USD").toUpperCase(),
      };
      setPaymentPayload(payload);
      if (STRIPE_PUBLISHABLE) {
        const res = await paymentService.createStripeIntentDemandeAuth(payload);
        const secret = res?.data?.clientSecret ?? res?.clientSecret;
        setStripeClientSecret(secret || "");
      }
      setStep("payment");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || t("demandesAuthentification.toasts.createError");
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onPaymentSuccess = useCallback(
    (demande) => {
      navigate(`/demandeur/demandes-authentification/${demande.id}`, {
        state: { justCreated: true, codeADN: demande.codeADN },
      });
    },
    [navigate]
  );

  const backToForm = () => {
    setStep("form");
    setStripeClientSecret("");
    setPaymentPayload(null);
  };

  return (
    <div className="container-fluid relative px-3">
      <div className="layout-specing">
        <div className="mb-6">
          <Link to="/demandeur/demandes-authentification">
            <Button icon={<ArrowLeftOutlined />} type="text">{t("demandesAuthentification.backToList")}</Button>
          </Link>
        </div>

        <Card
          title={t("demandesAuthentification.createTitle")}
          extra={
            quote && (
              <Alert
                type="info"
                showIcon
                message={
                  <span>
                    {t("demandesAuthentification.payment.amount")} : <b>{quote.amount} {quote.currency}</b>
                  </span>
                }
              />
            )
          }
        >
          {step === "form" && (
            <>
              <Alert
                type="info"
                className="mb-4"
                showIcon
                message={t("demandesAuthentification.paymentRequiredFirst")}
                description={t("demandesAuthentification.paymentRequiredFirstDesc")}
              />
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  name="attributedOrganizationId"
                  label={t("demandesAuthentification.fields.attributedOrg")}
                  rules={[{ required: true, message: t("demandesAuthentification.validation.attributedOrgRequired") }]}
                >
                  <Select
                    placeholder={t("demandesAuthentification.fields.attributedOrgPlaceholder")}
                    showSearch
                    optionFilterProp="label"
                    options={organizations.map((o) => ({ value: o.id, label: `${o.name} (${o.type})` }))}
                  />
                </Form.Item>
                <Form.Item name="objet" label={t("demandesAuthentification.fields.objet")}>
                  <Input.TextArea rows={2} placeholder={t("demandesAuthentification.fields.objetPlaceholder")} />
                </Form.Item>
                <Form.Item name="observation" label={t("demandesAuthentification.fields.observation")}>
                  <Input.TextArea rows={3} placeholder={t("demandesAuthentification.fields.observationPlaceholder")} />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      {t("demandesAuthentification.submitPayAndCreate")}
                    </Button>
                    <Link to="/demandeur/demandes-authentification">
                      <Button>{t("demandesAuthentification.cancel")}</Button>
                    </Link>
                  </Space>
                </Form.Item>
              </Form>
            </>
          )}

          {step === "payment" && paymentPayload && quote && (
            <>
              <Alert
                type="success"
                className="mb-4"
                showIcon
                message={t("demandesAuthentification.paymentStepTitle")}
                description={t("demandesAuthentification.paymentStepDesc")}
              />
              <Button type="text" onClick={backToForm} className="mb-2">
                ← {t("demandesAuthentification.backToForm")}
              </Button>
              <Divider />
              <Tabs
                items={[
                  {
                    key: "stripe",
                    label: t("demandeurDemandePayment.tabs.stripe"),
                    children:
                      stripePromise && stripeClientSecret ? (
                        <Elements
                          stripe={stripePromise}
                          options={{
                            clientSecret: stripeClientSecret,
                            appearance: { theme: "stripe" },
                          }}
                        >
                          <StripeCheckoutCreate
                            payload={paymentPayload}
                            quote={quote}
                            onSuccess={onPaymentSuccess}
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
                      <PaypalButtonsCreate
                        payload={paymentPayload}
                        quote={quote}
                        onSuccess={onPaymentSuccess}
                      />
                    ) : (
                      <Alert type="warning" message={t("demandeurDemandePayment.paypal.notConfigured")} />
                    ),
                  },
                ]}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
