const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/tokens');
const { RefreshToken } = require('../models');

// Atsako į klausimą "kas tu?". Nepavykus bet kuriam patikrinimui, grąžinamas 401.
async function authenticate(req, res, next) {
  // 1. Antraštė turi būti: Authorization: Bearer <žetonas>
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Reikalingas prisijungimas');
  }

  // 2. Parašas ir galiojimo laikas
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, 'Žetonas negalioja arba pasibaigė');
  }

  // 3. Sesija (RefreshTokens eilutė) turi egzistuoti, priklausyti šiam naudotojui
  //    ir būti neatšaukta bei nepasibaigusi. Dėl šito po logout access žetonas nustoja veikti.
  if (!Number.isInteger(payload.sid)) {
    throw new ApiError(401, 'Žetonas negalioja arba pasibaigė');
  }
  const session = await RefreshToken.findByPk(payload.sid);
  const userId = Number(payload.sub);
  if (
    !session ||
    session.userId !== userId ||
    session.revokedAt ||
    session.expiresAt < new Date()
  ) {
    throw new ApiError(401, 'Sesija nebegalioja');
  }

  // 4. Viskas gerai: kitos funkcijos naudos req.user
  req.user = { id: userId, role: payload.role, sessionId: payload.sid };
  next();
}

module.exports = authenticate;
