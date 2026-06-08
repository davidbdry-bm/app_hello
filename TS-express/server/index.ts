import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { configurePassport } from '../config/passport';
import { appRouter } from '../routes/app';
import { TokenService } from '../services/tokenService';

dotenv.config();

// ── VALIDATION ENV ─────────────────────────────────────────────────────────
if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET manquant');

const BASE         = process.env.APP_BASE;
const app          = express();
const tokenService = new TokenService();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── SESSION ────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));

// ── PASSPORT ───────────────────────────────────────────────────────────────
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// ── AUTH ROUTES ────────────────────────────────────────────────────────────
app.get(`${BASE}/auth/login`, passport.authenticate('oauth2'));

app.get(
  `${BASE}/auth/callback`,
  passport.authenticate('oauth2', { failureRedirect: `${BASE}/auth/error` }),
  (_req, res) => res.redirect(`${BASE}/`),
);

app.get(`${BASE}/auth/me`, (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Non authentifié' });
  return res.json(req.user);
});

app.get(`${BASE}/auth/logout`, (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect(`${BASE}/logged-out`);
  });
});

app.get(`${BASE}/logged-out`, (_req, res) => {
  res.send(`<p>Vous êtes déconnecté.</p><a href="${BASE}/auth/login">Se reconnecter</a>`);
});

app.get(`${BASE}/auth/error`, (_req, res) => {
  res.status(401).json({ error: "Échec de l'authentification OAuth2" });
});

// ── FRONT + APP ROUTES ─────────────────────────────────────────────────────
app.use(`${BASE}`, express.static(path.resolve(__dirname, '../public')));
app.use(`${BASE}`, appRouter(tokenService));

// ── START ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3008;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}${BASE}`));