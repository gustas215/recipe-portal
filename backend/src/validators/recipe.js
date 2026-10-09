const { z } = require('zod');

// Laukai, kuriuos naudotojas gali keisti (naudojama POST ir PUT)
const recipeSchema = z.object({
  title: z
    .string({ error: 'Pavadinimas privalomas' })
    .trim()
    .min(2, 'Pavadinimas turi būti bent 2 simbolių')
    .max(150, 'Pavadinimas gali būti ne ilgesnis nei 150 simbolių'),
  description: z
    .string({ error: 'Aprašymas privalomas' })
    .trim()
    .min(10, 'Aprašymas turi būti bent 10 simbolių')
    .max(5000, 'Aprašymas gali būti ne ilgesnis nei 5000 simbolių'),
  ingredients: z
    .string({ error: 'Ingredientai privalomi' })
    .trim()
    .min(3, 'Ingredientai turi būti bent 3 simbolių')
    .max(3000, 'Ingredientai gali būti ne ilgesni nei 3000 simbolių'),
  prepTimeMinutes: z
    .number({ error: 'Gaminimo laikas turi būti skaičius' })
    .int('Gaminimo laikas turi būti sveikas skaičius')
    .min(1, 'Gaminimo laikas turi būti bent 1 minutė')
    .max(10000, 'Gaminimo laikas per ilgas'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    error: 'Sudėtingumas turi būti easy, medium arba hard',
  }),
  servings: z
    .number({ error: 'Porcijų kiekis turi būti skaičius' })
    .int('Porcijų kiekis turi būti sveikas skaičius')
    .min(1, 'Porcijų kiekis turi būti bent 1')
    .max(100, 'Porcijų kiekis per didelis'),
  imageUrl: z
    .url({ protocol: /^https?$/, error: 'Nuotraukos nuoroda turi būti http arba https adresas' })
    .max(500, 'Nuoroda per ilga')
    .nullable()
    .optional(),
});



module.exports = { recipeSchema };