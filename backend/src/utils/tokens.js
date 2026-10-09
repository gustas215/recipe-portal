const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Access žetonas galioja trumpai, refresh žetonas ilgiau
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_DAYS = 7;

// Access žetonas yra JWT: turinys (sub, role, sid) pasirašomas slaptu raktu
function createAccessToken(user, sessionId) {
  return jwt.sign(
    { sub: String(user.id), role: user.role, sid: sessionId },
    process.env.JWT_ACCESS_SECRET,
    { algorithm: 'HS256', expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

// Patikrina parašą ir galiojimą. Netinkamas žetonas meta klaidą.
function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
}

// Refresh žetonas nėra JWT, tai tiesiog atsitiktinė eilutė
function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

// DB saugome tik hash, ne patį žetoną
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  REFRESH_TOKEN_DAYS,
  createAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
};
