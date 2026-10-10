// Atakų ir nestandartinių užklausų scenarijus lokaliai API patikrai. NEKOMITUOTI į repozitoriją.
// Naudojimas: 1) npm run seed, 2) npm run dev (kitame terminale), 3) iš backend aplanko: node attack.mjs
// Naudoja jonas, ruta ir admin iš seed, kuria testinius įrašus 5 kategorijoje.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_ACCESS_SECRET;
const B = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}/api`;
const results = []; const fives = [];
let total = 0;

async function call(label, method, path, { headers = {}, body, raw, cookie } = {}) {
  total++;
  const h = { ...headers };
  if (cookie) h.Cookie = cookie;
  let payload = raw;
  if (payload === undefined && body !== undefined) { payload = JSON.stringify(body); h['Content-Type'] ??= 'application/json'; }
  try {
    const r = await fetch(B + path, { method, headers: h, body: payload, redirect: 'manual' });
    const text = await r.text();
    if (r.status >= 500) fives.push(`${r.status} ${label}: ${text.slice(0, 120)}`);
    results.push({ label, status: r.status, text, headers: r.headers });
    return { status: r.status, text, headers: r.headers, json: () => { try { return JSON.parse(text); } catch { return null; } } };
  } catch (e) { fives.push(`NETWORK ${label}: ${e.message}`); return { status: 0, text: '', headers: new Headers(), json: () => null }; }
}
const login = async (email, password) => (await call('login', 'POST', '/auth/login', { body: { email, password } })).json();
const J = await login('jonas@example.com', 'Slaptazodis123!'); const A = await login('admin@example.com', 'Admin123!'); const R = await login('ruta@example.com', 'Slaptazodis123!');
const auth = (t) => ({ Authorization: `Bearer ${t}` });
const expect = (name, got, want) => { const ok = Array.isArray(want) ? want.includes(got) : got === want; console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${name}  (gauta ${got}, tikėtasi ${want})`); if (!ok) fails.push(name); };
const fails = [];

console.log('== A. Žetonų klastojimas ir piktnaudžiavimas');
const payloadOf = (t) => JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString());
const jp = payloadOf(J.accessToken);
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const noneTok = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ ...jp, role: 'admin', sub: '1' })}.`;
expect('alg:none žetonas atmestas', (await call('none', 'GET', '/auth/me', { headers: auth(noneTok) })).status, 401);
const parts = J.accessToken.split('.');
const tampered = `${parts[0]}.${b64({ ...jp, role: 'admin' })}.${parts[2]}`;
expect('pakeistas payload (role=admin) su sena parašu atmestas', (await call('tamper', 'POST', '/categories', { headers: auth(tampered), body: { name: 'Hack', description: 'x' } })).status, 401);
expect('žetonas su kitu raktu atmestas', (await call('wrongkey', 'GET', '/auth/me', { headers: auth(jwt.sign({ sub: '2', role: 'user', sid: jp.sid }, 'kitas-raktas')) })).status, 401);
expect('pasibaigęs žetonas atmestas', (await call('expired', 'GET', '/auth/me', { headers: auth(jwt.sign({ sub: '2', role: 'user', sid: jp.sid, exp: Math.floor(Date.now() / 1000) - 60 }, SECRET)) })).status, 401);
expect('sub nesutampa su sesijos savininku (sid kito naudotojo)', (await call('sidmismatch', 'GET', '/auth/me', { headers: auth(jwt.sign({ sub: '2', role: 'user', sid: payloadOf(R.accessToken).sid }, SECRET)) })).status, 401);
expect('pasirašytas žetonas su nežinoma role neturi admin teisių (403)', (await call('rolejunk', 'POST', '/categories', { headers: auth(jwt.sign({ sub: '2', role: 'root', sid: jp.sid }, SECRET)), body: { name: 'Hack2', description: 'x' } })).status, 403);
for (const [n, sid] of [['sid tekstas', 'abc'], ['sid trupmena', 1.5], ['sid neigiamas', -1], ['sid milžiniškas', 99999999999], ['sid nėra', undefined], ['sid null', null], ['sid masyvas', [1]]]) {
  const claims = { sub: '2', role: 'user' }; if (sid !== undefined) claims.sid = sid;
  expect(`${n} -> 401 (ne 500)`, (await call(n, 'GET', '/auth/me', { headers: auth(jwt.sign(claims, SECRET)) })).status, 401);
}
for (const sub of ['abc', '', '0', '99999999999', '[1]']) expect(`sub="${sub}" -> 401`, (await call('sub', 'GET', '/auth/me', { headers: auth(jwt.sign({ sub, role: 'user', sid: jp.sid }, SECRET)) })).status, 401);
for (const [n, hd] of [['be Bearer', 'abc'], ['tik Bearer', 'Bearer'], ['Bearer + tarpas', 'Bearer '], ['Basic', 'Basic YTpi'], ['bearer mažosiomis', `bearer ${J.accessToken}`], ['du tarpai', `Bearer  ${J.accessToken}`], ['šiukšlės', 'Bearer a.b.c'], ['labai ilga', 'Bearer ' + 'a'.repeat(20000)]])
  expect(`Authorization: ${n} -> 401 (arba 431 jei per didelė antraštė)`, (await call(n, 'GET', '/auth/me', { headers: { Authorization: hd } })).status, [401, 431]);

console.log('== B. Refresh žetono pakartotinis naudojimas ir keisti slapukai');
const lg = await call('login', 'POST', '/auth/login', { body: { email: 'ruta@example.com', password: 'Slaptazodis123!' } });
const c1 = lg.headers.get('set-cookie').split(';')[0];
const rf = await call('refresh1', 'POST', '/auth/refresh', { cookie: c1 });
expect('refresh su galiojančiu slapuku', rf.status, 200);
expect('tas pats (jau panaudotas) refresh žetonas antrą kartą atmestas', (await call('refresh-reuse', 'POST', '/auth/refresh', { cookie: c1 })).status, 401);
for (const [n, ck] of [['j: objektas', 'refreshToken=j:{"a":1}'], ['j: masyvas', 'refreshToken=j:[1,2]'], ['j: skaičius', 'refreshToken=j:5'], ['tuščias', 'refreshToken='], ['blogas kodavimas', 'refreshToken=%E0%A4%A'], ['labai ilgas', 'refreshToken=' + 'a'.repeat(50000)], ['s: parašytas', 'refreshToken=s:abc.def'], ['trys vienodi', 'refreshToken=a; refreshToken=b; refreshToken=c']]) {
  expect(`refresh su slapuku (${n}) -> 401 ne 500`, (await call('refresh ' + n, 'POST', '/auth/refresh', { cookie: ck })).status, [401, 431]);
  expect(`logout su slapuku (${n}) -> 204 ne 500`, (await call('logout ' + n, 'POST', '/auth/logout', { cookie: ck })).status, [204, 431]);
}

console.log('== C. Teisių eskalacija ir masinis priskyrimas (mass assignment)');
const reg = await call('register-admin', 'POST', '/auth/register', { body: { username: 'hax' + Date.now() % 100000, email: `hax${Date.now()}@example.com`, password: 'Slaptazodis123!', role: 'admin', id: 1, passwordHash: 'x' } });
expect('registracija su role=admin sukuria user', reg.json()?.role, 'user');
const rec = await call('mk-recipe', 'POST', '/categories/5/recipes', { headers: auth(J.accessToken), body: { title: 'Testinis', description: 'Aprasymas bent desimt simboliu.', ingredients: 'a\nb', prepTimeMinutes: 5, difficulty: 'easy', servings: 1, authorId: 3, categoryId: 1, id: 999 } });
const rid = rec.json()?.id;
expect('naujas receptas: autorius iš žetono (2), kategorija iš URL (5)', `${rec.json()?.authorId}/${rec.json()?.categoryId}`, '2/5');
const up = await call('put-recipe', 'PUT', `/categories/5/recipes/${rid}`, { headers: auth(J.accessToken), body: { title: 'Testinis 2', description: 'Aprasymas bent desimt simboliu.', ingredients: 'a\nb', prepTimeMinutes: 5, difficulty: 'easy', servings: 1, authorId: 3, categoryId: 1 } });
expect('PUT ignoruoja authorId/categoryId', `${up.json()?.authorId}/${up.json()?.categoryId}`, '2/5');
const cm = await call('mk-comment', 'POST', `/categories/5/recipes/${rid}/comments`, { headers: auth(R.accessToken), body: { text: 'Gerai pavyko.', rating: 5, authorId: 2, recipeId: 1 } });
expect('atsiliepimas: autorius iš žetono (3), receptas iš URL', `${cm.json()?.authorId}/${cm.json()?.recipeId}`, `3/${rid}`);
expect('svetimo atsiliepimo trynimas (IDOR) -> 403', (await call('idor', 'DELETE', `/categories/5/recipes/${rid}/comments/${cm.json()?.id}`, { headers: auth(J.accessToken) })).status, 403);
expect('svetimo skydelio peržiūra -> 403', (await call('dash', 'GET', '/users/3/dashboard', { headers: auth(J.accessToken) })).status, 403);
expect('naudotojų sąrašas paprastam naudotojui -> 403', (await call('users', 'GET', '/users', { headers: auth(J.accessToken) })).status, 403);

console.log('== D. SQL injekcijos bandymai');
for (const [n, p] of [['search', "/recipes?search=' OR 1=1 --"], ['search 2', "/recipes?search=%27%3B%20DROP%20TABLE%20%22Recipes%22%3B--"], ['difficulty', "/recipes?difficulty=easy' OR '1'='1"], ['kategorijos search', "/categories?search=%27%20OR%201%3D1--"]])
  expect(`${n} neišduoda duomenų ir nesukelia 500`, [200, 400].includes((await call(n, 'GET', p)).status), true);
expect('login el. paštas su SQL -> 401', (await call('sqli-login', 'POST', '/auth/login', { body: { email: "' OR '1'='1", password: "' OR '1'='1" } })).status, 401);
const sq = await call('sqli-count', 'GET', "/recipes?search=' OR 1=1 --"); expect('SQL injekcija negrąžina visų receptų', sq.json()?.data?.length ?? 0, 0);

console.log('== E. Blogos užklausos: ieškome 500');
const bodies = [['null', 'null'], ['masyvas', '[]'], ['eilutė', '"abc"'], ['skaičius', '123'], ['tuščias', ''], ['blogas JSON', '{bad'], ['gili struktūra', '{"a":'.repeat(500) + '1' + '}'.repeat(500)], ['proto', '{"__proto__":{"role":"admin"},"constructor":{"prototype":{"x":1}}}'], ['tipai', '{"username":123,"email":[],"password":{}}'], ['unikodas', JSON.stringify({ username: 'ąčę\u0000x', email: 'a@b.lt', password: 'ž'.repeat(72) })], ['ilgas slaptažodis', JSON.stringify({ username: 'ilgas' + Date.now() % 1e5, email: `ilgas${Date.now()}@b.lt`, password: 'ž'.repeat(72) })], ['null baitas el. paštas', JSON.stringify({ email: 'a\u0000@b.lt', password: 'x' })]];
for (const ep of ['/auth/register', '/auth/login']) for (const [n, raw] of bodies) await call(`${ep} ${n}`, 'POST', ep, { raw, headers: { 'Content-Type': 'application/json' } });
await call('register be Content-Type', 'POST', '/auth/register', { raw: '{"a":1}' });
await call('register text/plain', 'POST', '/auth/register', { raw: '{"a":1}', headers: { 'Content-Type': 'text/plain' } });
await call('register 2MB', 'POST', '/auth/register', { raw: JSON.stringify({ username: 'x'.repeat(2e6) }), headers: { 'Content-Type': 'application/json' } });
for (const ep of ['/categories', `/categories/5/recipes`, `/categories/5/recipes/${rid}/comments`]) for (const [n, raw] of bodies.slice(0, 9)) await call(`${ep} ${n} (admin)`, 'POST', ep, { raw, headers: { ...auth(A.accessToken), 'Content-Type': 'application/json' } });
for (const [n, rb] of [['rating tekstas', { text: 'abc', rating: '5' }], ['rating NaN', { text: 'abc', rating: 1e999 }], ['rating trupmena', { text: 'abcd', rating: 4.5 }], ['text masyvas', { text: ['a'], rating: 3 }]]) await call('comment ' + n, 'POST', `/categories/5/recipes/${rid}/comments`, { headers: auth(A.accessToken), body: rb });
for (const [n, rb] of [['imageUrl javascript:', { imageUrl: 'javascript:alert(1)' }], ['imageUrl masyvas', { imageUrl: [] }], ['laikas 1e999', { prepTimeMinutes: 1e999 }], ['laikas tekstas', { prepTimeMinutes: '10' }], ['difficulty objektas', { difficulty: {} }], ['ingredientai ilgi', { ingredients: 'x'.repeat(100000) }]]) await call('recipe ' + n, 'PUT', `/categories/5/recipes/${rid}`, { headers: auth(J.accessToken), body: { title: 'T2', description: 'Aprasymas bent desimt simboliu.', ingredients: 'a', prepTimeMinutes: 5, difficulty: 'easy', servings: 1, ...rb } });

const nums = ['0', '-1', '1.5', '1e3', 'abc', '99999999999999999999', '2147483648', '2147483647', '%00', '%E0%A4%A', '%20', '..%2F', '1%2F2', 'null', 'NaN', '٣'];
for (const n of nums) for (const tpl of ['/categories/N', '/categories/N/recipes', '/categories/5/recipes/N', '/categories/5/recipes/N/comments', '/categories/5/recipes/N/comments/N', '/users/N/dashboard'])
  await call(`GET ${tpl.replace(/N/g, n)}`, 'GET', tpl.replace(/N/g, n), { headers: auth(A.accessToken) });
for (const n of ['0', 'abc', '99999999999999999999', '%00']) { await call('PUT cat ' + n, 'PUT', `/categories/${n}`, { headers: auth(A.accessToken), body: { name: 'x', description: 'y' } }); await call('DELETE cat ' + n, 'DELETE', `/categories/${n}`, { headers: auth(A.accessToken) }); await call('DELETE user ' + n, 'DELETE', `/users/${n}`, { headers: auth(A.accessToken) }); }
const qvals = ['0', '-1', '1.5', '1e3', 'abc', '99999999999999999999', '2147483648', '', '%00', '%', '_', '%25', '[]', '[a]=1', 'a&page=2', '٣', '1,2', ' 1'];
for (const q of qvals) for (const key of ['page', 'limit', 'search', 'difficulty', 'maxTime', 'categoryId', 'authorId', 'minRating']) {
  await call(`/recipes?${key}=${q}`, 'GET', `/recipes?${key}=${q}`); await call(`/categories?${key}=${q}`, 'GET', `/categories?${key}=${q}`);
  await call(`comments ?${key}=${q}`, 'GET', `/categories/5/recipes/${rid}/comments?${key}=${q}`); await call(`/users?${key}=${q}`, 'GET', `/users?${key}=${q}`, { headers: auth(A.accessToken) });
}
for (const [n, m, p] of [['PATCH', 'PATCH', '/categories/1'], ['HEAD', 'HEAD', '/categories'], ['TRACE-lik', 'OPTIONS', '/categories'], ['POST į sąrašą /recipes', 'POST', '/recipes'], ['DELETE /recipes', 'DELETE', '/recipes'], ['nežinomas kelias', 'GET', '/nera'], ['dvigubas /', 'GET', '//categories'], ['/api/ su pabaiga', 'GET', '/'], ['kategorijos id su pabaiga /', 'GET', '/categories/1/']]) await call(n, m, p);
console.log(`  išsiųsta užklausų: ${total}; 5xx atsakymų: ${fives.length}`);
fives.slice(0, 15).forEach((f) => console.log('   5xx:', f));

console.log('== F. CORS, antraštės, slapukai');
const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
const pre = await call('preflight ok', 'OPTIONS', '/categories', { headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' } });
expect('preflight iš FRONTEND_URL leidžiamas', [200, 204].includes(pre.status) && pre.headers.get('access-control-allow-origin') === origin && pre.headers.get('access-control-allow-credentials') === 'true', true);
const evil = await call('evil', 'GET', '/categories', { headers: { Origin: 'https://evil.example' } });
expect('svetimas Origin negauna savo adreso leidimo (ACAO != svetimas Origin)', evil.headers.get('access-control-allow-origin') !== 'https://evil.example', true);
expect('X-Powered-By paslėptas (helmet)', evil.headers.get('x-powered-by'), null);
expect('X-Content-Type-Options: nosniff', evil.headers.get('x-content-type-options'), 'nosniff');
const lg2 = await call('cookie-dev', 'POST', '/auth/login', { body: { email: 'jonas@example.com', password: 'Slaptazodis123!' } });
console.log('  Set-Cookie (dev):', lg2.headers.get('set-cookie')?.replace(/refreshToken=[a-f0-9]+/, 'refreshToken=...'));
expect('401 atsakymas yra JSON', (await call('json401', 'GET', '/auth/me')).headers.get('content-type')?.includes('application/json'), true);
console.log(`\nNEPAVYKO: ${fails.length}`); fails.forEach((f) => console.log(' -', f));
process.exit(0);
