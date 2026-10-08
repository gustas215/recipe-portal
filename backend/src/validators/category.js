const { z } = require('zod');

// Ta pati schema naudojama POST ir PUT (PUT pakeičia visą objektą)
const categorySchema = z.object({
  name: z
    .string({ error: 'Pavadinimas privalomas' })
    .trim()
    .min(2, 'Pavadinimas turi būti bent 2 simbolių')
    .max(100, 'Pavadinimas gali būti ne ilgesnis nei 100 simbolių'),
  description: z
    .string({ error: 'Aprašymas privalomas' })
    .trim()
    .min(1, 'Aprašymas privalomas')
    .max(1000, 'Aprašymas gali būti ne ilgesnis nei 1000 simbolių'),
  imageUrl: z
    .url({ protocol: /^https?$/, error: 'Nuotraukos nuoroda turi būti http arba https adresas' })
    .max(500, 'Nuoroda per ilga')
    .nullable()
    .optional(),
});

module.exports = { categorySchema };