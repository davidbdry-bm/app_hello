# app_hello — Boilerplate app BoondManager (Node.js / TypeScript)

Adaptation TypeScript du boilerplate PHP officiel [wishgroupe/app_hello](https://github.com/wishgroupe/app_hello).

---

## Stack

- **Backend** : Node.js + Express + TypeScript
- **Frontend** : HTML / JS vanilla (servi par Express)
- **Auth** : OAuth2 (Authorization Code Flow) via BoondManager

---

## Structure

```
app_hello/
├── server/
│   ├── config/
│   │   └── passport.ts       # Configuration OAuth2 (passport.js)
│   ├── boondmanager.ts       # Classe BoondManager (callApiOAuth)
│   └── index.ts              # Bootstrap + routes auth
├── routes/
│   └── app.ts                # Routes métier (protégées par passport)
├── services/
│   └── tokenService.ts       # Appels API BoondManager (Bearer token)
├── public/
│   └── index.html            # Front vanilla servi par Express
├── .env                      # Variables d'environnement (non versionné)
├── .env.example              # Template des variables d'environnement
├── package.json
└── tsconfig.json
```

---

## Installation

```bash
npm install
```

---

## Configuration

Copie `.env.example` et remplis les valeurs :

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3008

# Préfixe de toutes les routes de l'app (ex: /api ou laisser vide)
APP_BASE=

SESSION_SECRET=une_chaine_aleatoire_longue_32chars

OAUTH_AUTHORIZATION_URL=
OAUTH_TOKEN_URL=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_URL_CALLBACK=http://localhost:3008/auth/callback

BOOND_API_URL=
```

Générer un `SESSION_SECRET` aléatoire :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Lancer le projet

### Dev (hot reload)
```bash
npm run dev
```

### Production
```bash
npm run build && npm start
```

---

## Routes

Les routes sont préfixées par `APP_BASE` (vide par défaut).

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `{APP_BASE}/auth/login` | Démarre le flow OAuth2 → redirige vers BoondManager |
| `GET` | `{APP_BASE}/auth/callback` | Callback OAuth2 (à enregistrer chez BoondManager) |
| `GET` | `{APP_BASE}/auth/me` | Utilisateur courant (session) |
| `GET` | `{APP_BASE}/auth/logout` | Déconnexion |
| `GET` | `{APP_BASE}/data/me` | API utilisateur courant (protégée) |
| `GET` | `{APP_BASE}/` | Front iframe |

---

## Architecture

### OAuth2 — `server/config/passport.ts`
Configure la stratégie `passport-oauth2` avec les endpoints BoondManager. Gère la sérialisation de session. Le token OAuth2 est stocké dans `req.user.accessToken` et transmis en header `Authorization: Bearer` à chaque appel API.

### TokenService — `services/tokenService.ts`
Fournit `callApi(api, accessToken)` avec déduplication des requêtes simultanées (évite les appels en double pour un même endpoint + token).

### Appels API — `server/boondmanager.ts`
`callApiOAuth(api, accessToken)` envoie les requêtes à l'API BoondManager avec le header `Authorization: Bearer <token>`.

### Flow d'authentification
1. L'utilisateur accède au front → `/auth/me` retourne 401
2. Le front redirige vers `/auth/login`
3. Passport redirige vers BoondManager (authorization URL)
4. BoondManager redirige vers `/auth/callback` avec le code
5. Passport échange le code contre un `access_token`
6. L'utilisateur est redirigé vers le front, authentifié

---

## Nginx (production)

Adapte `APP_BASE` et le `location` en conséquence :

```nginx
location / {
    proxy_pass         http://127.0.0.1:3008;
    proxy_http_version 1.1;
    proxy_set_header   Host $host;
    proxy_set_header   X-Real-IP $remote_addr;
    proxy_read_timeout 600s;
}
```
