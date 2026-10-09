const { z } = require('zod');

const registerSchema = z.object({
  username: z
    .string({ error: 'Naudotojo vardas privalomas' })
    .trim()
    .min(3, 'Naudotojo vardas turi būti bent 3 simbolių')
    .max(50, 'Naudotojo vardas gali būti ne ilgesnis nei 50 simbolių'),
  email: z
    .email({ error: 'Neteisingas el. pašto formatas' })
    .max(255, 'El. paštas per ilgas'),
  password: z
    .string({ error: 'Slaptažodis privalomas' })
    .min(8, 'Slaptažodis turi būti bent 8 simbolių')
    .max(72, 'Slaptažodis gali būti ne ilgesnis nei 72 simboliai'),
});

const loginSchema = z.object({
  email: z.string({ error: 'El. paštas privalomas' }).min(1, 'El. paštas privalomas'),
  password: z.string({ error: 'Slaptažodis privalomas' }).min(1, 'Slaptažodis privalomas'),
});

module.exports = { registerSchema, loginSchema };