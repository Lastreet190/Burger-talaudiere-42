# Burger Talaud 42 — site avec paiement en ligne

## Ce que contient ce dossier
- `index.html` — le site (menu + panier + bouton "Payer maintenant")
- `success.html` — page affichée après un paiement réussi
- `api/create-checkout-session.js` — crée la session de paiement Stripe à partir du panier
- `api/webhook.js` — reçoit la confirmation de paiement de Stripe et envoie la commande sur Telegram

## Étape 1 — Compte Stripe
1. Crée un compte sur https://stripe.com (gratuit, Stripe prend une petite commission par paiement).
2. Dans le tableau de bord Stripe, récupère ta **clé secrète** (Developers → API keys → Secret key).

## Étape 2 — Un bot Telegram pour recevoir les commandes
1. Sur Telegram, cherche **@BotFather**, envoie `/newbot`, suis les instructions → tu obtiens un **token**.
2. Envoie un message à ton nouveau bot (n'importe quoi), puis va sur
   `https://api.telegram.org/bot<TON_TOKEN>/getUpdates` dans un navigateur pour récupérer ton **chat_id**
   (il apparaît dans le JSON sous `"chat":{"id": ...}`).

## Étape 3 — Déployer sur Vercel (gratuit)
1. Crée un compte sur https://vercel.com et installe leur outil : `npm i -g vercel`
2. Dans ce dossier, lance : `vercel`
3. Dans les réglages du projet sur vercel.com → **Environment Variables**, ajoute :
   - `STRIPE_SECRET_KEY` = ta clé secrète Stripe
   - `TELEGRAM_BOT_TOKEN` = le token de ton bot
   - `TELEGRAM_CHAT_ID` = ton chat_id
   - `STRIPE_WEBHOOK_SECRET` = voir étape 4 (à ajouter après)
4. Redéploie une fois les variables ajoutées : `vercel --prod`

## Étape 4 — Connecter le webhook Stripe
1. Dans le tableau de bord Stripe → Developers → Webhooks → **Add endpoint**.
2. URL de l'endpoint : `https://TON-SITE.vercel.app/api/webhook`
3. Événement à écouter : `checkout.session.completed`
4. Stripe te donne un **Signing secret** → colle-le dans la variable `STRIPE_WEBHOOK_SECRET` sur Vercel, puis redéploie.

## Tester
Utilise une carte de test Stripe (`4242 4242 4242 4242`, n'importe quelle date future, n'importe quel CVC)
pour vérifier que le paiement puis la notification Telegram fonctionnent, avant de passer en mode réel.

## Passer en argent réel
Tant que le compte Stripe est en mode test, les clés commencent par `sk_test_...`.
Une fois l'activation du compte validée par Stripe (infos bancaires de l'entreprise/auto-entrepreneur),
remplace les clés par les clés `sk_live_...` dans les variables d'environnement.
