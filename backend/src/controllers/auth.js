const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { User, RefreshToken } = require('../models');
const {
  REFRESH_TOKEN_DAYS,
  createAccessToken,
  generateRefreshToken,
  hashToken,
} = require('../utils/tokens');

const isProduction = process.env.NODE_ENV === 'production';
const REFRESH_TOKEN_MS = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;

// Refresh žetonas siunčiamas tik cookie, kurio JavaScript naršyklėje nemato (httpOnly).
// Gamyboje frontend ir API yra skirtinguose domenuose, todėl reikia Secure + SameSite=None.
// Lokaliai (http://localhost) Secure cookie nepriimamas, todėl ten naudojame Lax.
const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_MS,
};

// Refresh žetonas iš cookie. cookie-parser reikšmę, prasidedančią "j:", paverčia objektu,
// todėl kitokio nei tekstas tipo reikšmė laikoma neegzistuojančia (kitaip hash funkcija mestų klaidą, 500).
function getRefreshToken(req) {
  const token = req.cookies?.refreshToken;
  return typeof token === 'string' && token !== '' ? token : null;
}

function toUserResource(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

// Sukuria naują sesiją (RefreshTokens eilutę), įrašo refresh žetoną į cookie
// ir grąžina atsakymo kūną su nauju access žetonu. Naudoja login ir refresh.
async function startSession(user, res) {
  const refreshToken = generateRefreshToken();
  const session = await RefreshToken.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_MS),
  });

  const accessToken = createAccessToken(user, session.id);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: 900,
    user: toUserResource(user),
  };
}

async function register(req, res) {
  const { username, email, password } = req.body;

  // Rolė visada 'user'. Admin sukuriamas tik tiesiogiai DB (seed).
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
    role: 'user',
  });

  res.status(201).json({
    ...toUserResource(user),
    _links: {
      self: { href: '/api/auth/register' },
      login: { href: '/api/auth/login' },
    },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  // Ta pati žinutė ir blogam el. paštui, ir blogam slaptažodžiui,
  // kad nebūtų galima išsiaiškinti, kurie el. paštai užregistruoti.
  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  const passwordOk = user && (await bcrypt.compare(password, user.passwordHash));
  if (!passwordOk) {
    throw new ApiError(401, 'Neteisingas el. paštas arba slaptažodis');
  }

  res.json(await startSession(user, res));
}

// Iškeičia refresh žetoną (cookie) į naują access žetoną.
// Rotacija: senoji sesija atšaukiama, sukuriama nauja su nauju refresh žetonu.
async function refresh(req, res) {
  const token = getRefreshToken(req);
  if (!token) {
    throw new ApiError(401, 'Trūksta refresh žetono');
  }

  const session = await RefreshToken.findOne({ where: { tokenHash: hashToken(token) } });
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new ApiError(401, 'Refresh žetonas negalioja arba pasibaigė');
  }

  // Rolė imama iš DB, todėl pasikeitusi rolė atsispindi naujame access žetone
  const user = await User.findByPk(session.userId);
  if (!user) {
    throw new ApiError(401, 'Refresh žetonas negalioja arba pasibaigė');
  }

  await session.update({ revokedAt: new Date() });
  res.json(await startSession(user, res));
}

// Atsijungimas: sesija atšaukiama DB, cookie išvalomas.
// Jei refresh žetono nėra, vis tiek grąžinamas 204 (naudotojas ir taip atsijungęs).
async function logout(req, res) {
  const token = getRefreshToken(req);
  if (token) {
    const session = await RefreshToken.findOne({ where: { tokenHash: hashToken(token) } });
    if (session && !session.revokedAt) {
      await session.update({ revokedAt: new Date() });
    }
  }

  res.clearCookie('refreshToken', refreshCookieOptions);
  res.status(204).end();
}

// Prisijungusio naudotojo duomenys pagal access žetoną (req.user nustato authenticate)
async function me(req, res) {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new ApiError(401, 'Naudotojas nebeegzistuoja');
  }

  res.json({
    ...toUserResource(user),
    _links: {
      self: { href: '/api/auth/me' },
      dashboard: { href: `/api/users/${user.id}/dashboard` },
      logout: { href: '/api/auth/logout' },
    },
  });
}

module.exports = { register, login, refresh, logout, me, refreshCookieOptions, toUserResource };
