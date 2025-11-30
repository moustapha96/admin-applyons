"use client"
import { useState } from "react";
import { createPaymentIntent, confirmPayment } from "@/actions/payments";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/stripe-js";
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function PaymentPage({ demandeId }) {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Stripe: Composant pour le formulaire de paiement
  const StripeForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      try {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: { return_url: `${window.location.origin}/payment/success` },
        });
        if (error) throw error;
        setMessage("Paiement réussi !");
      } catch (error) {
        setMessage(`Erreur: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    return (
      <form onSubmit={handleSubmit}>
        <PaymentElement />
        <button type="submit" disabled={!stripe || loading}>
          {loading ? "Traitement..." : "Payer avec Stripe"}
        </button>
      </form>
    );
  };

  // PayPal: Composant pour le bouton PayPal
  const PayPalButton = () => {
    return (
      <PayPalButtons
        createOrder={async () => {
          const data = await createPaymentIntent(demandeId, "paypal");
          return data.orderID;
        }}
        onApprove={async (data, actions) => {
          setLoading(true);
          try {
            const details = await actions.order.capture();
            await confirmPayment(demandeId, "paypal", details.id);
            setMessage("Paiement PayPal réussi !");
          } catch (error) {
            setMessage(`Erreur PayPal: ${error.message}`);
          } finally {
            setLoading(false);
          }
        }}
      />
    );
  };

  // Initialisation du paiement
  const initPayment = async (method) => {
    setPaymentMethod(method);
    setLoading(true);
    try {
      const data = await createPaymentIntent(demandeId, method);
      setPaymentData(data);
      if (method === "stripe") {
        // Pour Stripe, on charge le formulaire
        return;
      }
    } catch (error) {
      setMessage(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Paiement pour la demande #{demandeId}</h1>
      {!paymentMethod ? (
        <div>
          <button onClick={() => initPayment("stripe")} disabled={loading}>
            Payer avec Stripe
          </button>
          <button onClick={() => initPayment("paypal")} disabled={loading}>
            Payer avec PayPal
          </button>
        </div>
      ) : paymentMethod === "stripe" ? (
        <div>
          {paymentData?.clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret: paymentData.clientSecret }}>
              <StripeForm />
            </Elements>
          )}
        </div>
      ) : (
        <div>
          <PayPalButton />
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}
