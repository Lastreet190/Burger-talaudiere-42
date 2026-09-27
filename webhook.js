// Webhook Stripe : appelé automatiquement par Stripe quand un paiement est confirmé.
// Envoie alors la commande sur Telegram pour que le commerçant la voie tout de suite.

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Vercel n'analyse pas le corps brut par défaut pour ce type de route ;
// on le lit nous-mêmes car Stripe a besoin du corps brut pour vérifier la signature.
module.exports.config = {
  api: { bodyParser: false },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

async function notifyTelegram(text) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return;
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
      }),
    }
  );
}

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Erreur de signature webhook : ${err.message}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const m = session.metadata || {};

    const text =
      `🍔 Nouvelle commande payée — Burger Talaud 42\n\n` +
      `${m.recap || ""}\n\n` +
      `Total : ${(session.amount_total / 100).toFixed(2)} €\n` +
      `Client : ${m.client_nom} (${m.client_tel})\n` +
      `Mode : ${m.mode === "livraison" ? "Livraison" : "À emporter"}\n` +
      (m.adresse ? `Adresse : ${m.adresse}\n` : "") +
      (m.remarque ? `Remarque : ${m.remarque}\n` : "");

    try {
      await notifyTelegram(text);
    } catch (err) {
      console.error("Erreur notification Telegram :", err);
    }
  }

  res.status(200).json({ received: true });
};
