/* eslint-disable react/prop-types */
import { PayPalButtons } from "@paypal/react-paypal-js";
import { Button, Space, Spin, message } from "antd";

export default function CheckoutPanePayPal({ onPaid, price }) {
  const [submitting, setSubmitting] = useState(false);

  const handlePay = async (details, data) => {
    setSubmitting(true);
    try {
      // Simuler la réponse de PayPal (à adapter selon votre API)
      const paymentIntent = {
        id: data.orderID,
        status: "SUCCEEDED",
        amount_received: price.amount,
        currency: price.currency,
      };
      onPaid?.(paymentIntent);
    } catch (error) {
      message.error("Paiement PayPal échoué");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {price?.amount && (
        <div>
          Montant: {(price.amount / 100).toFixed(2)} {price.currency}
        </div>
      )}
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: (price.amount / 100).toFixed(2),
                currency: price.currency,
              },
            }],
          });
        }}
        onApprove={handlePay}
      />
    </Space>
  );
}
