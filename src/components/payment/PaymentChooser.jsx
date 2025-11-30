/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Card, Tabs, Space, Tag, Button, message } from "antd";
import { CreditCardOutlined } from "@ant-design/icons";
import { Elements, loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm"; // <- ton composant existant (CardElement flow)

/**
 * ATTENTES CÔTÉ SERVICES (adapte les imports vers tes services réels) :
 *
 * paymentService = {
 *   // STRIPE
 *   getPublishableKey: () => Promise<{ publishable_key: string }>, // optionnel si createIntent renvoie la clé
 *   createPaymentIntentInstitut: ({ institutId, amount, currency }) =>
 *      Promise<{ clientSecret?: string, client_secret?: string, publishableKey?: string, publishable_key?: string, amount?: number, currency?: string }>,
 *   createPaymentIntentDemandeur: ({ demandeurId, amount, currency }) =>
 *      Promise<{ clientSecret?: string, client_secret?: string, publishableKey?: string, publishable_key?: string, amount?: number, currency?: string }>,
 *   confirmStripePayment: ({ paymentIntentId }) => Promise<any>, // si tu confirmes côté serveur après
 *
 *   // PAYPAL
 *   getPayPalConfig: () => Promise<{ clientId: string, currency: string, intent: "capture"|"authorize" }>,
 *   createPayPalOrderInstitut: ({ institutId, amount, currency }) => Promise<{ orderID: string }>,
 *   createPayPalOrderDemandeur: ({ demandeurId, amount, currency }) => Promise<{ orderID: string }>,
 *   capturePayPalOrder: ({ orderID }) => Promise<{ status: "COMPLETED"|"PAID"|string, ... }>,
 * }
 */

export default function PaymentChooser({
  /** "abonnement" | "demande" */
  mode = "abonnement",
  /** requis si mode === "abonnement" */
  institutId,
  /** requis si mode === "demande" */
  demandeurId,
  /** montant (centimes si tu veux aligner avec Stripe) — si non fourni, on prend ce que renvoie le backend */
  amountCents,
  /** ex: "USD" (par défaut "USD") */
  currency = "USD",
  /** callback succès global (paymentPayload: objet provider) */
  onPaid,
  /** titre optionnel */
  title = "Paiement sécurisé",
  /** style wrapper optionnel */
  style,
  /** service d’accès API (injectable pour tests) */
  paymentService,
}) {
  const isAbo = mode === "abonnement";
  const isDemande = mode === "demande";

  // ---- ÉTAT COMMUN ----
  const [method, setMethod] = useState("stripe"); // "stripe" | "paypal"
  const [displayAmount, setDisplayAmount] = useState(null); // en cents
  const [displayCurrency, setDisplayCurrency] = useState(currency?.toUpperCase() || "USD");

  // ---- STRIPE ----
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [initializingStripe, setInitializingStripe] = useState(false);

  // ---- PAYPAL ----
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalCfg, setPaypalCfg] = useState(null);
  const paypalRef = useRef(null);
  const paypalScriptEl = useRef(null);
  const [initializingPaypal, setInitializingPaypal] = useState(false);

  // ==========================================
  // Helpers
  // ==========================================
  const assertInputs = () => {
    if (isAbo && !institutId) throw new Error("institutId requis pour le mode abonnement");
    if (isDemande && !demandeurId) throw new Error("demandeurId requis pour le mode demande");
  };

  const humanPrice = useMemo(() => {
    if (displayAmount == null) return null;
    return `${(displayAmount / 100).toFixed(2)} ${displayCurrency}`;
  }, [displayAmount, displayCurrency]);

  const pickIntentFields = (obj = {}) => ({
    // normalise toutes les variantes rencontrées dans ton code/back
    clientSecret: obj.clientSecret || obj.client_secret || obj.publishableKey || obj.publishable_key || "",
    // NOTE : dans ton retour d’exemple, publishableKey == client_secret. On gère aussi la vraie clé publique :
    publishableKey: obj.publishable_key || obj.publishableKey || null,
    amount: obj.amount ?? null,
    currency: (obj.currency || displayCurrency || "USD").toUpperCase(),
  });

  // ==========================================
  // INIT STRIPE INTENT (suivant le mode)
  // ==========================================
  const initStripe = useCallback(async () => {
    assertInputs();
    setInitializingStripe(true);
    try {
      let resp;
      if (isAbo) {
        resp = await paymentService.createPaymentIntentInstitut({
          institutId,
          amount: amountCents, // facultatif si le back calcule
          currency: displayCurrency,
        });
      } else {
        resp = await paymentService.createPaymentIntentDemandeur({
          demandeurId,
          amount: amountCents,
          currency: displayCurrency,
        });
      }

      const { clientSecret: cs, publishableKey, amount, currency: cur } = pickIntentFields(resp || {});
      if (!cs) {
        message.error("client_secret manquant pour Stripe");
        setInitializingStripe(false);
        return;
      }
      setClientSecret(cs);
      setDisplayAmount(amount ?? amountCents ?? null);
      setDisplayCurrency(cur || displayCurrency);

      // obtenir la vraie clé publique si non fournie
      let pubKey = publishableKey;
      if (!pubKey && paymentService.getPublishableKey) {
        try {
          const cfg = await paymentService.getPublishableKey();
          pubKey = cfg?.publishable_key || cfg?.publishableKey || null;
        } catch {
          // noop — on tentera quand même un loadStripe nul → on affichera une erreur propre
        }
      }
      if (!pubKey) {
        message.error("Clé publique Stripe introuvable");
        setInitializingStripe(false);
        return;
      }
      setStripePromise(loadStripe(pubKey));
    } catch (e) {
      console.error("initStripe error:", e);
      message.error(e?.response?.data?.message || e?.message || "Initialisation Stripe impossible");
    } finally {
      setInitializingStripe(false);
    }
  }, [
    isAbo,
    institutId,
    isDemande,
    demandeurId,
    amountCents,
    displayCurrency,
    paymentService,
  ]);

  // ==========================================
  // INIT PAYPAL SDK + BUTTONS
  // ==========================================
  const injectPaypalScript = useCallback(async () => {
    assertInputs();
    setInitializingPaypal(true);
    try {
      const cfg = await paymentService.getPayPalConfig();
      const clientId = cfg?.clientId;
      const cur = (cfg?.currency || displayCurrency || "USD").toUpperCase();
      setPaypalCfg({ ...cfg, currency: cur });

      if (!clientId) {
        message.error("PayPal clientId introuvable");
        setInitializingPaypal(false);
        return;
      }

      // Nettoie ancien SDK si présent
      if (paypalScriptEl.current) {
        try {
          document.body.removeChild(paypalScriptEl.current);
        } catch {}
        paypalScriptEl.current = null;
      }
      setPaypalReady(false);

      const params = new URLSearchParams({
        "client-id": clientId,
        currency: cur,
        intent: cfg?.intent || "capture",
      });

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
      script.async = true;
      script.onload = () => setPaypalReady(true);
      script.onerror = () => message.error("Échec de chargement du SDK PayPal");
      document.body.appendChild(script);
      paypalScriptEl.current = script;
    } catch (e) {
      console.error("injectPaypalScript error:", e);
      message.error(e?.response?.data?.message || e?.message || "Initialisation PayPal impossible");
    } finally {
      setInitializingPaypal(false);
    }
  }, [displayCurrency, paymentService]);

  const mountPaypalButtons = useCallback(() => {
    if (!paypalReady || !paypalRef.current || !window.paypal) return;
    paypalRef.current.innerHTML = "";

    window.paypal
      .Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
        createOrder: async () => {
          try {
            let data;
            if (isAbo) {
              data = await paymentService.createPayPalOrderInstitut({
                institutId,
                amount: (displayAmount ?? amountCents) / 100,
                currency: displayCurrency,
              });
            } else {
              data = await paymentService.createPayPalOrderDemandeur({
                demandeurId,
                amount: (displayAmount ?? amountCents) / 100,
                currency: displayCurrency,
              });
            }
            return data?.orderID;
          } catch (err) {
            console.error("createOrder error:", err);
            message.error("Impossible de créer l’ordre PayPal");
            throw err;
          }
        },
        onApprove: async (data, actions) => {
          try {
            // Capture via SDK (front) OU via ton backend (préférable)
            // Ici on appelle le backend pour tracer proprement :
            const cap = await paymentService.capturePayPalOrder({ orderID: data?.orderID });
            const status = cap?.status || cap?.result?.status;
            if (status === "COMPLETED" || status === "PAID") {
              message.success("Paiement PayPal confirmé !");
              onPaid?.({ provider: "PAYPAL", payload: cap });
            } else {
              message.warning(`Statut PayPal: ${status || "inconnu"}`);
            }
          } catch (err) {
            console.error("onApprove error:", err);
            message.error("Capture PayPal impossible");
          }
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          message.error("Erreur PayPal");
        },
      })
      .render(paypalRef.current);
  }, [
    paypalReady,
    isAbo,
    institutId,
    isDemande,
    demandeurId,
    displayAmount,
    amountCents,
    displayCurrency,
    paymentService,
    onPaid,
  ]);

  // ==========================================
  // LIFECYCLE
  // ==========================================
  // (re)init quand on change de méthode
  useEffect(() => {
    if (method === "stripe") {
      initStripe();
    } else {
      injectPaypalScript();
    }
    // cleanup PayPal zone au switch
    return () => {
      if (paypalRef.current) paypalRef.current.innerHTML = "";
    };
  }, [method, initStripe, injectPaypalScript]);

  // Monte les boutons une fois le SDK prêt
  useEffect(() => {
    if (method === "paypal") {
      mountPaypalButtons();
    }
  }, [method, paypalReady, mountPaypalButtons]);

  // ==========================================
  // HANDLERS STRIPE (post-succès)
  // ==========================================
  const handleStripeSuccess = async (paymentIntent) => {
    try {
      // Si tu veux confirmer côté serveur :
      if (paymentService.confirmStripePayment) {
        await paymentService.confirmStripePayment({ paymentIntentId: paymentIntent?.id });
      }
      message.success("Paiement Stripe confirmé !");
      onPaid?.({ provider: "STRIPE", payload: paymentIntent });
    } catch (e) {
      console.error("confirmStripePayment error:", e);
      // même si la confirmation serveur échoue, on notifie le succès local
      onPaid?.({ provider: "STRIPE", payload: paymentIntent, serverConfirmError: e?.message });
    }
  };

  return (
    <Card
      title={title}
      style={{ borderRadius: 8, ...style }}
      extra={
        humanPrice ? (
          <Tag color="blue" style={{ fontSize: 14, padding: "4px 10px" }}>
            {humanPrice}
          </Tag>
        ) : null
      }
      bodyStyle={{ paddingTop: 12 }}
    >
      <Tabs
        activeKey={method}
        onChange={setMethod}
        items={[
          {
            key: "stripe",
            label: (
              <Space>
                <CreditCardOutlined />
                <span>Stripe</span>
              </Space>
            ),
            children: (
              <div>
                {initializingStripe ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="animate-spin" style={spinnerStyle} />
                    <span>Initialisation Stripe…</span>
                  </div>
                ) : stripePromise && clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: { theme: "stripe", variables: { colorPrimary: "#0A2642" } },
                    }}
                  >
                    <CheckoutForm
                      amount={(displayAmount ?? amountCents ?? 0) / 100}
                      currency={displayCurrency}
                      clientSecret={clientSecret}
                      onPaymentSuccess={handleStripeSuccess}
                    />
                  </Elements>
                ) : (
                  <div style={{ color: "#999" }}>
                    Clé publique ou client_secret manquant — vérifie l’API.
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "paypal",
            label: (
              <Space>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0070BA">
                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.028.15a.805.805 0 0 1-.794.68H7.72a.483.483 0 0 1-.477-.558L9.22 7.08a.964.964 0 0 1 .952-.814h4.242c.94 0 1.814.078 2.592.28 1.318.34 2.29 1.098 2.817 2.218z" />
                </svg>
                <span>PayPal</span>
              </Space>
            ),
            children: (
              <div>
                {initializingPaypal ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="animate-spin" style={spinnerStyleBlue} />
                    <span>Chargement du SDK PayPal…</span>
                  </div>
                ) : (
                  <div ref={paypalRef} />
                )}
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
}

const spinnerStyle = {
  width: 18,
  height: 18,
  border: "2px solid #ddd",
  borderTopColor: "#0A2642",
  borderRadius: "50%",
};

const spinnerStyleBlue = {
  width: 18,
  height: 18,
  border: "2px solid #ddd",
  borderTopColor: "#0070BA",
  borderRadius: "50%",
};
