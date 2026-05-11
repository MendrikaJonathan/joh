# 🛒 ShopHub — Plateforme E-commerce Multi-Vendeurs

> Projet S5 — React + Tailwind CSS + Supabase + Vercel

---

## 🚀 Installation en 5 étapes

### 1. Cloner et installer les dépendances

```bash
cd shophub
npm install
```

### 2. Configurer Supabase

1. Créer un compte gratuit sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans **SQL Editor** et coller le contenu de `supabase/migrations/001_initial.sql`
4. Exécuter le script → toutes les tables, politiques RLS et triggers sont créés

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir `.env` avec vos clés Supabase (Settings → API) :

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...   # optionnel
```

### 4. Lancer en développement

```bash
npm run dev
# → http://localhost:5173
```

### 5. Déployer sur Vercel

```bash
npm install -g vercel
vercel --prod
# Ajouter les variables d'environnement dans le dashboard Vercel
```

---

## 🏗️ Structure du projet

```
shophub/
├── src/
│   ├── components/
│   │   ├── layout/          # Navbar, Footer
│   │   └── products/        # ProductCard
│   ├── context/
│   │   ├── AuthContext.jsx  # Authentification + rôles
│   │   └── CartContext.jsx  # Panier persistant
│   ├── lib/
│   │   └── supabase.js      # Client Supabase
│   ├── pages/
│   │   ├── auth/            # Login, Register
│   │   ├── client/          # Cart, Checkout, Orders, Profile
│   │   ├── vendor/          # Dashboard, Products CRUD, Orders
│   │   └── admin/           # Dashboard, Users, Products, Orders
│   ├── App.jsx              # Router principal
│   └── main.jsx
├── supabase/
│   └── migrations/
│       └── 001_initial.sql  # Schéma complet Supabase
├── .env.example
├── tailwind.config.js
└── vite.config.js
```

---

## 👥 Rôles et accès

| Rôle    | Pages accessibles                          |
|---------|--------------------------------------------|
| Visiteur| Accueil, Catalogue, Fiche produit          |
| Client  | + Panier, Commandes, Profil                |
| Vendeur | + Dashboard, Produits CRUD, Commandes reçues|
| Admin   | + Panel admin (users, produits, commandes) |

---

## ✨ Fonctionnalités

- ✅ Authentification Supabase (email/mot de passe)
- ✅ Gestion des rôles client / vendeur / admin
- ✅ Catalogue produits avec recherche et filtres
- ✅ Fiche produit complète avec avis clients
- ✅ Panier persistant (sauvegardé en BDD)
- ✅ Checkout complet avec adresse de livraison
- ✅ Simulation de paiement (+ intégration Stripe prête)
- ✅ Historique et suivi de commandes
- ✅ Dashboard vendeur avec KPIs et analytics
- ✅ CRUD produits avec upload d'images (Supabase Storage)
- ✅ Panel d'administration complet
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Design responsive (mobile-first avec Tailwind CSS)
- ✅ Déploiement Vercel (CI/CD automatique)

---

## 🔒 Sécurité

- JWT automatique via Supabase Auth
- Row Level Security sur toutes les tables PostgreSQL
- Les vendeurs ne voient que leurs propres données
- Les clients ne voient que leurs commandes
- Routes protégées côté React ET côté base de données

---

## 📦 Technologies

| Technologie      | Version | Usage                          |
|-----------------|---------|-------------------------------|
| React           | 18.2    | Interface utilisateur          |
| Vite            | 5.x     | Build tool                     |
| Tailwind CSS    | 3.x     | Styles utilitaires             |
| React Router    | 6.x     | Navigation SPA                 |
| Supabase        | 2.x     | Auth + PostgreSQL + Storage    |
| Zustand/Context | —       | État global                    |
| Lucide React    | 0.344   | Icônes                         |
| react-hot-toast | 2.x     | Notifications                  |
| Vercel          | Cloud   | Hébergement + CI/CD            |
