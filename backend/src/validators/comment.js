const { z } = require('zod');

// Laukai, kuriuos naudotojas gali keisti (naudojama POST ir PUT).
// Autorius imamas iš žetono, todėl kūne jo nėra.
const commentSchema = z.object({
  text: z
    .string({ error: 'Tekstas privalomas' })
    .trim()
    .min(3, 'Tekstas turi būti bent 3 simbolių')
    .max(2000, 'Tekstas gali būti ne ilgesnis nei 2000 simbolių'),
  rating: z
    .number({ error: 'Įvertinimas turi būti skaičius' })
    .int('Įvertinimas turi būti sveikas skaičius')
    .min(1, 'Įvertinimas turi būti nuo 1 iki 5')
    .max(5, 'Įvertinimas turi būti nuo 1 iki 5'),
});

module.exports = { commentSchema };
