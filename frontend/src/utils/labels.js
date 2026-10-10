export const DIFFICULTY_LABELS = {
  easy: 'Lengvas',
  medium: 'Vidutinis',
  hard: 'Sudėtingas',
};

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('lt-LT');
}

export function formatMinutes(minutes) {
  if (minutes < 60) {
    return `${minutes} min.`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} val. ${rest} min.` : `${hours} val.`;
}

// API nuorodos prasideda /api, o sąsajos keliai ne: /api/categories/2/recipes/3 -> /categories/2/recipes/3
export function hrefToRoute(href) {
  return href.replace(/^\/api/, '');
}
