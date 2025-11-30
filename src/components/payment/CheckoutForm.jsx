// src/pages/.../CheckoutForm.jsx
import { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button, message } from "antd";

/**
 * Props:
 * - amount (number)
 * - currency (string)  ex: "USD"
 * - clientSecret (string)  // client_secret du PaymentIntent
 * - onPaymentSuccess(fn)   // callback(paymentIntent)
 */
export default function CheckoutForm({ amount, currency = "USD", clientSecret, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!clientSecret) {
      message.error("Client secret manquant");
      return;
    }

    setLoading(true);
    try {
      const card = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card },
      });

      if (error) {
        message.error(error.message || "Erreur de paiement");
        return;
      }

      if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "requires_capture") {
        onPaymentSuccess?.(paymentIntent);
      } else {
        message.warning(`Statut paiement: ${paymentIntent?.status || "inconnu"}`);
      }
    } catch (err) {
      message.error(err?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding: 12, border: "1px solid #e5e5e5", borderRadius: 8, marginBottom: 12 }}>
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <Button type="primary" htmlType="submit" loading={loading} disabled={!stripe}>
        Payer {amount?.toFixed ? amount.toFixed(2) : amount} {currency}
      </Button>
    </form>
  );
}
