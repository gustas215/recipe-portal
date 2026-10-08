const { z } = require('zod');

// Laukai, kuriuos naudotojas gali keisti (naudojama POST ir PUT)
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

// L1 metu autorių nurodome užklausos kūne. Nuo L2 POST naudos tik commentSchema,
// o authorId bus imamas iš žetono.
const commentCreateSchema = commentSchema.extend({
  authorId: z
    .number({ error: 'Autoriaus ID privalomas' })
    .int('Autoriaus ID turi būti sveikas skaičius')
    .min(1, 'Autoriaus ID turi būti teigiamas'),
});

module.exports = { commentSchema, commentCreateSchema };