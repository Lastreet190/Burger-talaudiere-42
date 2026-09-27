// Fonction serverless (Vercel) : crée une session de paiement Stripe
// à partir du panier envoyé par le site, puis renvoie l'URL de paiement.

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  try {
    const { cart, customer } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      res.status(400).json({ error: "Panier vide" });
      return;
    }

    const line_items = cart.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.option ? `${item.name} (${item.option})` : item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const recap = cart
      .map((c) => `${c.qty}x ${c.name}${c.option ? " (" + c.option + ")" : ""}`)
      .join(" | ")
      .slice(0, 480);

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types
