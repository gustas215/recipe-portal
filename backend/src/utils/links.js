// Viena puslapiavimo nuoroda. Kiti query parametrai (filtrai, limit) išsaugomi.
function pageLink(basePath, query, page) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key !== 'page' && typeof value === 'string') {
      params.set(key, value);
    }
  }
  params.set('page', page);
  return { href: `${basePath}?${params.toString()}` };
}

// _links sąrašui: self, first, last, o prev ir next tik jei yra kur eiti
function buildListLinks(basePath, query, { page, totalPages }) {
  const links = {
    self: pageLink(basePath, query, page),
    first: pageLink(basePath, query, 1),
    last: pageLink(basePath, query, Math.max(totalPages, 1)),
  };

  if (page > 1) {
    links.prev = pageLink(basePath, query, page - 1);
  }
  if (page < totalPages) {
    links.next = pageLink(basePath, query, page + 1);
  }
  return links;
}

module.exports = { buildListLinks };