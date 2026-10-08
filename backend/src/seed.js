const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Recipe, Comment } = require('./models');

// Demonstraciniai slaptažodžiai (naudosime prisijungimui L2 metu)
const ADMIN_PASSWORD = 'Admin123!';
const USER_PASSWORD = 'Slaptazodis123!';

const usersData = [
  { username: 'admin', email: 'admin@example.com', role: 'admin', password: ADMIN_PASSWORD },
  { username: 'jonas', email: 'jonas@example.com', role: 'user', password: USER_PASSWORD },
  { username: 'ruta', email: 'ruta@example.com', role: 'user', password: USER_PASSWORD },
  { username: 'mantas', email: 'mantas@example.com', role: 'user', password: USER_PASSWORD },
];

const categoriesData = [
  {
    name: 'Sriubos',
    description: 'Šaltos ir karštos sriubos: nuo vasaros šaltibarščių iki sočių žiemos sriubų.',
  },
  {
    name: 'Karšti patiekalai',
    description: 'Tradiciniai lietuviški pietų patiekalai iš bulvių, mėsos ir daržovių.',
  },
  {
    name: 'Desertai',
    description: 'Saldūs patiekalai ir kepiniai arbatai, šventėms ir kasdienai.',
  },
  {
    name: 'Vegetariški patiekalai',
    description: 'Patiekalai be mėsos ir žuvies, paprasti ir sotūs.',
  },
  {
    name: 'Salotos',
    description: 'Šaltieji patiekalai ir salotos šventiniam stalui bei kasdienai.',
  },
  {
    name: 'Užkandžiai',
    description: 'Greiti užkandžiai ir mažos porcijos svečiams.',
  },
];

const recipesData = [
  {
    title: 'Šaltibarščiai',
    category: 'Sriubos',
    author: 'jonas',
    description:
      'Burokėlius sutarkuokite, sumaišykite su kefyru ir atskieskite vandeniu iki norimo tirštumo. Įdėkite supjaustytus agurkus, svogūnų laiškus ir krapus, pagal skonį pasūdykite. Atšaldykite bent valandą ir patiekite su karštomis virtomis bulvėmis bei pusėmis kiaušinio.',
    ingredients: [
      '1 l kefyro',
      '3 virti burokėliai',
      '2 švieži agurkai',
      '1 ryšelis žaliųjų svogūnų',
      '1 ryšelis krapų',
      '2 virti kiaušiniai',
      '4 virtos bulvės patiekimui',
      'druskos pagal skonį',
    ].join('\n'),
    prepTimeMinutes: 30,
    difficulty: 'easy',
    servings: 4,
  },
  {
    title: 'Žirnių sriuba su rūkytais šonkauliukais',
    category: 'Sriubos',
    author: 'ruta',
    description:
      'Žirnius užpilkite vandeniu ir mirkykite per naktį. Šonkauliukus virkite 40 minučių, tada suberkite nuskalautus žirnius ir virkite dar 30 minučių. Įdėkite supjaustytas bulves, morką ir svogūną, virkite, kol daržovės suminkštės. Pabaigoje įdėkite lauro lapus, druską ir pipirus.',
    ingredients: [
      '300 g džiovintų žirnių',
      '400 g rūkytų šonkauliukų',
      '3 bulvės',
      '1 morka',
      '1 svogūnas',
      '2 lauro lapai',
      '2,5 l vandens',
      'druskos ir juodųjų pipirų',
    ].join('\n'),
    prepTimeMinutes: 120,
    difficulty: 'medium',
    servings: 6,
  },
  {
    title: 'Cepelinai su mėsa',
    category: 'Karšti patiekalai',
    author: 'jonas',
    description:
      'Žalias bulves sutarkuokite ir nuspauskite sultis, nusistovėjusį krakmolą grąžinkite į tarkį. Įmaišykite virtų bulvių košę ir druskos. Faršą pakepinkite su svogūnu, pagardinkite. Iš bulvių masės suformuokite blynelius, į vidurį dėkite faršo ir uždarykite į ovalo formos cepeliną. Virkite pasūdytame vandenyje apie 25 minutes. Patiekite su grietine ir spirgučiais.',
    ingredients: [
      '2 kg žalių bulvių',
      '500 g virtų bulvių',
      '500 g kiaulienos faršo',
      '1 svogūnas',
      '200 g grietinės',
      '100 g spirgučių',
      'druskos ir pipirų',
    ].join('\n'),
    prepTimeMinutes: 120,
    difficulty: 'hard',
    servings: 6,
  },
  {
    title: 'Bulvių kugelis',
    category: 'Karšti patiekalai',
    author: 'ruta',
    description:
      'Bulves ir svogūną smulkiai sutarkuokite, nusunkite skystį. Šoninę supjaustykite kubeliais ir pakepinkite. Į bulvių masę įmaišykite kiaušinius, pieną, šoninę, druską ir pipirus. Masę supilkite į riebalais ištepytą formą ir kepkite 190 °C temperatūroje apie 70 minučių, kol paviršius apskrus.',
    ingredients: [
      '1,5 kg bulvių',
      '1 didelis svogūnas',
      '200 g rūkytos šoninės',
      '2 kiaušiniai',
      '200 ml pieno',
      'druskos ir juodųjų pipirų',
      'grietinės patiekimui',
    ].join('\n'),
    prepTimeMinutes: 90,
    difficulty: 'medium',
    servings: 6,
  },
  {
    title: 'Įdaryti kopūstų lapai (balandėliai)',
    category: 'Karšti patiekalai',
    author: 'mantas',
    description:
      'Kopūsto galvą pavirkite pasūdytame vandenyje ir atskirkite lapus. Faršą sumaišykite su pusiau išvirtais ryžiais ir pakepintu svogūnu. Ant kiekvieno lapo dėkite įdaro ir susukite. Sudėkite į troškintuvą, užpilkite pomidorų padažu ir vandeniu, troškinkite apie 60 minučių.',
    ingredients: [
      '1 kopūsto galva (apie 1 kg)',
      '500 g kiaulienos faršo',
      '100 g ryžių',
      '1 svogūnas',
      '1 morka',
      '300 ml pomidorų padažo',
      'druskos ir pipirų',
    ].join('\n'),
    prepTimeMinutes: 110,
    difficulty: 'medium',
    servings: 4,
  },
  {
    title: 'Varškės apkepas su manų kruopomis',
    category: 'Desertai',
    author: 'ruta',
    description:
      'Varškę išmaišykite su kiaušiniais, cukrumi, vaniliniu cukrumi, grietine ir manų kruopomis. Palikite 15 minučių, kad kruopos išbrinktų. Masę supilkite į sviestu ištepytą formą ir kepkite 180 °C temperatūroje apie 40 minučių. Patiekite šiltą su uogiene arba grietine.',
    ingredients: [
      '500 g varškės',
      '3 kiaušiniai',
      '3 šaukštai manų kruopų',
      '3 šaukštai cukraus',
      '1 šaukštelis vanilinio cukraus',
      '150 g grietinės',
      'žiupsnelis druskos',
    ].join('\n'),
    prepTimeMinutes: 60,
    difficulty: 'easy',
    servings: 6,
  },
  {
    title: 'Obuolių pyragas (šarlotė)',
    category: 'Desertai',
    author: 'mantas',
    description:
      'Kiaušinius išplakite su cukrumi iki purumo, pridėkite miltų su kepimo milteliais. Obuolius nulupkite, supjaustykite griežinėliais ir sudėkite į formą, pabarstykite cinamonu. Užpilkite tešla ir kepkite 180 °C temperatūroje apie 40 minučių. Ataušusį pyragą pabarstykite cukraus pudra.',
    ingredients: [
      '4 dideli obuoliai',
      '3 kiaušiniai',
      '1 stiklinė cukraus',
      '1 stiklinė miltų',
      '1 šaukštelis kepimo miltelių',
      '1 šaukštelis cinamono',
      'cukraus pudros papuošimui',
    ].join('\n'),
    prepTimeMinutes: 60,
    difficulty: 'easy',
    servings: 8,
  },
  {
    title: 'Bulviniai blynai',
    category: 'Vegetariški patiekalai',
    author: 'jonas',
    description:
      'Bulves ir svogūną smulkiai sutarkuokite, nusunkite skystį. Įmaišykite kiaušinį, miltus ir druską. Šaukštu dėkite masę į įkaitintą aliejų ir kepkite iš abiejų pusių, kol gražiai apskrus. Patiekite su grietine.',
    ingredients: [
      '1 kg bulvių',
      '1 svogūnas',
      '1 kiaušinis',
      '2 šaukštai miltų',
      'aliejaus kepimui',
      'druskos pagal skonį',
      'grietinės patiekimui',
    ].join('\n'),
    prepTimeMinutes: 40,
    difficulty: 'easy',
    servings: 4,
  },
  {
    title: 'Grikių košė su grybais',
    category: 'Vegetariški patiekalai',
    author: 'mantas',
    description:
      'Grikius nuplaukite ir virkite pasūdytame vandenyje apie 15 minučių, kol sugers visą skystį. Svogūną pakepinkite aliejuje, pridėkite supjaustytus pievagrybius ir kepkite, kol išgaruos skystis. Grybus sumaišykite su košė, pagardinkite pipirais ir pabarstykite petražolėmis.',
    ingredients: [
      '250 g grikių kruopų',
      '300 g pievagrybių',
      '1 svogūnas',
      '2 šaukštai aliejaus',
      '500 ml vandens',
      'petražolių',
      'druskos ir pipirų',
    ].join('\n'),
    prepTimeMinutes: 35,
    difficulty: 'easy',
    servings: 3,
  },
  {
    title: 'Silkė pataluose',
    category: 'Salotos',
    author: 'ruta',
    description:
      'Bulves, morkas ir burokėlius išvirkite ir sutarkuokite atskirai. Silkių filė supjaustykite kubeliais. Į indą dėkite sluoksniais: silkė su svogūnu, bulvės, morkos, burokėliai, kiekvieną sluoksnį patepdami majonezu. Prieš patiekdami palaikykite šaldytuve bent 3 valandas.',
    ingredients: [
      '2 sūdytos silkės filė',
      '3 bulvės',
      '2 morkos',
      '2 burokėliai',
      '1 svogūnas',
      '250 g majonezo',
      'druskos pagal skonį',
    ].join('\n'),
    prepTimeMinutes: 60,
    difficulty: 'medium',
    servings: 6,
  },
];

const commentsData = [
  { recipe: 'Šaltibarščiai', author: 'ruta', rating: 5, text: 'Labai gaivūs, kaip tik tinka karštą dieną. Pridėjau daugiau krapų ir buvo dar geriau.' },
  { recipe: 'Šaltibarščiai', author: 'mantas', rating: 4, text: 'Skanu, bet man pritrūko druskos. Kitą kartą įdėsiu daugiau žaliųjų svogūnų.' },
  { recipe: 'Žirnių sriuba su rūkytais šonkauliukais', author: 'jonas', rating: 4, text: 'Sotus patiekalas, mirkymas per naktį tikrai padeda, žirniai gerai suvirė.' },
  { recipe: 'Žirnių sriuba su rūkytais šonkauliukais', author: 'mantas', rating: 5, text: 'Verdu pagal šį receptą kiekvieną žiemą, šeima prašo pakartoti.' },
  { recipe: 'Cepelinai su mėsa', author: 'ruta', rating: 5, text: 'Pirmą kartą pavyko, kad cepelinai neišvirtų. Tešla tobula, įdaras sultingas.' },
  { recipe: 'Cepelinai su mėsa', author: 'mantas', rating: 4, text: 'Skanu, bet užtrukau ilgiau nei 2 valandas, nes ilgai tarkavau bulves.' },
  { recipe: 'Bulvių kugelis', author: 'jonas', rating: 5, text: 'Apskrudusi plutelė ir minkštas vidus, tikras kaip iš močiutės virtuvės.' },
  { recipe: 'Įdaryti kopūstų lapai (balandėliai)', author: 'jonas', rating: 3, text: 'Neblogai, bet man įdaras buvo šiek tiek sausas. Kitą kartą pridėčiau daugiau svogūno.' },
  { recipe: 'Įdaryti kopūstų lapai (balandėliai)', author: 'ruta', rating: 4, text: 'Gražiai išėjo, pomidorų padažas gerai dera su kopūstu.' },
  { recipe: 'Varškės apkepas su manų kruopomis', author: 'jonas', rating: 5, text: 'Puikus pusryčiams, vaikai suvalgė viską per kelias minutes.' },
  { recipe: 'Varškės apkepas su manų kruopomis', author: 'mantas', rating: 4, text: 'Paprastas ir greitas. Su braškių uogiene labai skanu.' },
  { recipe: 'Obuolių pyragas (šarlotė)', author: 'ruta', rating: 5, text: 'Minkštas pyragas, obuoliai puikiai dera su cinamonu. Geriausia su arbata.' },
  { recipe: 'Bulviniai blynai', author: 'mantas', rating: 4, text: 'Gerai, kad receptas paprastas. Man geriau patiko kepti ant vidutinės ugnies.' },
  { recipe: 'Bulviniai blynai', author: 'ruta', rating: 5, text: 'Traškūs iš išorės ir minkšti viduje. Su grietine nieko geriau nereikia.' },
  { recipe: 'Grikių košė su grybais', author: 'jonas', rating: 4, text: 'Greitas ir sotus patiekalas po darbo. Pridėjau česnako ir buvo gerai.' },
  { recipe: 'Silkė pataluose', author: 'jonas', rating: 5, text: 'Būtinai palaikykite šaldytuve, kitaip sluoksniai nesilaiko. Šventinis klasikinis patiekalas.' },
  { recipe: 'Silkė pataluose', author: 'mantas', rating: 5, text: 'Ruošiau šeimos susibūrimui, visi prašė recepto. Sluoksniai gražiai išsilaikė.' },
];

async function seed() {
  try {
    // Ištrina visas lenteles ir sukuria iš naujo
    await sequelize.sync({ force: true });

    const users = {};
    for (const u of usersData) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      users[u.username] = await User.create({
        username: u.username,
        email: u.email,
        role: u.role,
        passwordHash,
      });
    }

    const categories = {};
    for (const c of categoriesData) {
      categories[c.name] = await Category.create(c);
    }

    const recipes = {};
    for (const r of recipesData) {
      const { category, author, ...fields } = r;
      recipes[r.title] = await Recipe.create({
        ...fields,
        categoryId: categories[category].id,
        authorId: users[author].id,
      });
    }

    for (const c of commentsData) {
      await Comment.create({
        recipeId: recipes[c.recipe].id,
        authorId: users[c.author].id,
        text: c.text,
        rating: c.rating,
      });
    }

    console.log('Seed baigtas:');
    console.log('  naudotojai:', await User.count());
    console.log('  kategorijos:', await Category.count());
    console.log('  receptai:', await Recipe.count());
    console.log('  atsiliepimai:', await Comment.count());
  } catch (err) {
    console.error('Seed klaida:', err.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();