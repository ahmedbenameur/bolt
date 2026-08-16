# Déploiement sur Netlify — TUNISIA Boutique

## 1. Préparer le fichier ZIP

Le fichier `tunisia-boutique.zip` contient tous les fichiers du projet.
Extrayez-le sur votre machine :

```bash
unzip tunisia-boutique.zip
cd tunisia-boutique
```

## 2. Installer les dépendances

```bash
npm install
```

## 3. Variables d'environnement

Créez un fichier `.env` à la racine avec :

```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

Vous trouverez ces valeurs dans votre projet Supabase :
- Allez sur https://supabase.com → votre projet
- Settings → API → Project URL et anon public key

## 4. Créer un compte admin Supabase

1. Dans Supabase → Authentication → Users
2. Cliquez "Add user" → entrez email + mot de passe
3. Cet utilisateur pourra se connecter à /admin

## 5. Configurer les emails (optionnel)

Pour les notifications de commande par email :
1. Créez un compte sur https://resend.com (gratuit)
2. Obtenez votre clé API Resend
3. Dans Supabase → Edge Functions → Secrets, ajoutez :
   - `RESEND_API_KEY` = votre clé Resend
   - `ADMIN_EMAIL` = votre email admin

## 6. Déploiement sur Netlify

### Méthode A : Via l'interface web

1. Allez sur https://app.netlify.com
2. Cliquez "Add new site" → "Deploy manually"
3. Glissez-déposez le dossier `dist` (après `npm run build`)
   OU glissez le dossier entier du projet

### Méthode B : Via Git (recommandé)

1. Poussez le projet sur GitHub
2. Sur Netlify → "Add new site" → "Import from Git"
3. Sélectionnez votre repo
4. Configuration automatique (déjà dans netlify.toml) :
   - Build command : `npm run build`
   - Publish directory : `dist`
5. Ajoutez les variables d'environnement dans Netlify :
   - Site settings → Environment variables
   - `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
6. Cliquez "Deploy site"

## 7. Après le déploiement

- Votre boutique sera accessible sur l'URL Netlify
- L'admin est sur `/admin`
- La base de données et les images sont déjà dans Supabase
- Les commandes sont sauvegardées automatiquement

## Structure du projet

```
tunisia-boutique/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── contexts/        # Contextes React (panier, auth, etc.)
│   ├── lib/             # Client Supabase, types, utils
│   ├── pages/           # Pages boutique
│   └── pages/admin/    # Pages administration
├── supabase/
│   ├── functions/       # Fonction email notification
│   └── migrations/      # Schéma base de données
├── netlify.toml         # Configuration Netlify
├── package.json
└── .env                 # Variables (à créer)
```

## Technologies

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (base de données + auth + edge functions)
- Recharts (graphiques admin)
- React Router (navigation)
