// Klaidos tekstas naudotojui
export function getErrorMessage(error) {
  if (!error.response) {
    return 'Nepavyko susisiekti su serveriu. Jei jis ką tik paleistas, palaukite kelias sekundes ir bandykite dar kartą.';
  }
  return error.response.data?.error?.message || 'Įvyko nenumatyta klaida';
}

// 422 atsakymo details paverčiamas objektu { laukas: žinutė }, kad klaida būtų rodoma prie lauko
export function getFieldErrors(error) {
  const details = error.response?.data?.error?.details;
  const result = {};
  if (Array.isArray(details)) {
    for (const item of details) {
      if (item.field && !result[item.field]) {
        result[item.field] = item.message;
      }
    }
  }
  return result;
}
