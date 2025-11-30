"use server"

// Fonction générique pour créer une intention de paiement (Stripe ou PayPal)
export async function createPaymentIntent(demandeId, paymentMethod) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/${paymentMethod}/create-${paymentMethod === "stripe" ? "intent" : "order"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandeId }),
      }
    );
    if (!response.ok) throw new Error("Erreur création paiement");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur:", error);
    throw new Error("Échec création paiement");
  }
}

// Fonction pour confirmer un paiement (Stripe ou PayPal)
export async function confirmPayment(demandeId, paymentMethod, paymentId) {
  try {
    const endpoint = paymentMethod === "stripe" ? "confirm" : "capture";
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payments/${paymentMethod}/${endpoint}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demandeId, [paymentMethod === "stripe" ? "paymentIntentId" : "orderID"]: paymentId }),
      }
    );
    if (!response.ok) throw new Error("Erreur confirmation paiement");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur:", error);
    throw new Error("Échec confirmation paiement");
  }
}
