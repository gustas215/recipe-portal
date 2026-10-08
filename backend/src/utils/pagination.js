const ApiError = require('./ApiError');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const MAX_INT = 2147483647;

function parsePositiveInt(value, name) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value) || Number(value) > MAX_INT) {
    throw new ApiError(400, `Parametras ${name} turi būti teigiamas sveikasis skaičius`);
  }
  return Number(value);
}

// Iš ?page=2&limit=5 gaunami page, limit ir offset (kiek eilučių praleisti DB užklausoje)
function getPagination(query) {
  const page = query.page === undefined ? 1 : parsePositiveInt(query.page, 'page');
  const requestedLimit =
    query.limit === undefined ? DEFAULT_LIMIT : parsePositiveInt(query.limit, 'limit');

  const limit = Math.min(requestedLimit, MAX_LIMIT);
  return { page, limit, offset: (page - 1) * limit };
}

// Objektas, kuris grąžinamas atsakyme lauke "pagination"
function buildPagination(page, limit, totalItems) {
  return { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) };
}

module.exports = { getPagination, buildPagination, parsePositiveInt };