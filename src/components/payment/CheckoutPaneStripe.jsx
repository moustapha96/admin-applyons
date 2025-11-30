/* eslint-disable react/prop-types */
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button, Space, Spin, message } from "antd";

export default function CheckoutPaneStripe({ onPaid, price }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    setSubmitting(false);
    if (error) {
      message.error(error.message || "Paiement refusé");
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      onPaid?.(paymentIntent);
    } else {
      message.info(`Statut du paiement: ${paymentIntent?.status || "en attente"}`);
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <PaymentElement />
      {price?.amount && (
        <div>
          Montant: {(price.amount / 100).toFixed(2)} {price.currency}
        </div>
      )}
      <Button
        type="primary"
        block
        onClick={handlePay}
        loading={submitting}
      >
        Payer avec Stripe
      </Button>
    </Space>
  );
}
