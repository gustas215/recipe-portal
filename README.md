# Receptų portalas

T120B165 Saityno taikomųjų programų projektavimas, Kauno technologijos universitetas, Informatikos fakultetas.
Studentas: Gustas Valaika, IF-4. Dėstytojai: Lukas Navickas, Rasa Mažutienė.

Veikianti sistema:

- Front-End: https://recipe-portal-1.onrender.com
- API: https://recipe-portal-4vyt.onrender.com/api
- API dokumentacija (Swagger UI): https://recipe-portal-4vyt.onrender.com/api-docs

Nemokami Render serveriai po 15 min. neveiklumo užmiega, todėl pirmas atsakymas gali užtrukti iki minutės.

## 1. Sprendžiamo uždavinio aprašymas

### 1.1. Sistemos paskirtis

Projekto tikslas yra internetinė platforma, kurioje registruoti naudotojai kuria, skelbia ir dalijasi maisto gaminimo receptais, o kiti naudotojai juos peržiūri, komentuoja ir vertina.

Platformą sudaro dvi dalys: internetinė aplikacija (Front-End), kuria naudojasi svečiai, registruoti naudotojai ir administratorius, ir aplikacijų programavimo sąsaja (API), kuri apdoroja duomenis ir keičiasi jais su duomenų baze.

Naudotojas prisiregistruoja, priskiria savo receptus kategorijoms (pvz. „Sriubos“, „Desertai“), nurodo aprašymą, ingredientus, gaminimo laiką, sudėtingumą ir porcijų kiekį. Kiti naudotojai skelbiamus receptus gali komentuoti ir vertinti 1-5 žvaigždutėmis. Komentaras ir įvertinimas saugomi kartu kaip vienas atsiliepimas. Administratorius tvarko kategorijas ir šalina netinkamą turinį bei naudotojus.

### 1.2. Funkciniai reikalavimai

Svečias (neregistruotas naudotojas) gali:

1. peržiūrėti pradinį puslapį ir receptų kategorijas;
2. peržiūrėti receptų sąrašą ir atskiro recepto informaciją;
3. prisiregistruoti arba prisijungti.

Registruotas naudotojas (rolė `user`) gali:

1. atsijungti;
2. sukurti receptą: pasirinkti kategoriją, nurodyti pavadinimą, aprašymą, ingredientus, gaminimo laiką, sudėtingumą ir porcijų kiekį;
3. redaguoti ir šalinti savo receptus;
4. palikti atsiliepimą (komentarą su įvertinimu 1-5) kito naudotojo receptui, vieną kartą kiekvienam receptui;
5. redaguoti ir šalinti savo atsiliepimus;
6. peržiūrėti savo skydelį: duomenis apie save, savo receptus ir jų gautus atsiliepimus bei įvertinimų vidurkį.

Administratorius (rolė `admin`) gali:

1. kurti, redaguoti ir šalinti receptų kategorijas;
2. šalinti netinkamus receptus ir atsiliepimus;
3. peržiūrėti naudotojų sąrašą ir šalinti naudotojus;
4. peržiūrėti bet kurio naudotojo skydelį.

### 1.3. Duomenų modelis

Hierarchija: kategorija → receptas → atsiliepimas (kiekvienas ryšys vienas su daug). Naudotojas į hierarchiją neįeina, jis tik recepto ar atsiliepimo autorius. Atsiliepimas yra komentaras su įvertinimu 1-5, vienas naudotojas receptui gali palikti tik vieną. Lentelės: Users, Categories, Recipes, Comments ir RefreshTokens (prisijungimo sesijos).

Trynimas: kategorijos, kurioje yra receptų, ištrinti negalima (409). Ištrynus receptą, ištrinami jo atsiliepimai. Ištrynus naudotoją, ištrinami jo receptai, atsiliepimai ir sesijos.

## 2. Sistemos architektūra

Sistemos dalys: sąsaja (Front-End) sukurta su React ir Vite, API (Back-End) su Node.js, Express 5 ir Sequelize, duomenų bazė yra PostgreSQL Supabase platformoje.

2.1 pav. pavaizduota diegimo diagrama. Front-End yra statinė svetainė (Render Static Site), API yra atskira Render Web Service. Naršyklė puslapio failus parsisiunčia iš statinės svetainės, o duomenis ir prisijungimą gauna tiesiogiai iš API (HTTPS, JSON). API su duomenų baze Supabase jungiasi per Sequelize su SSL.

![2.1 pav. Sistemos „Receptų portalas“ diegimo diagrama](docs/deployment-diagram.svg)

*2.1 pav. Sistemos „Receptų portalas“ diegimo diagrama*

Back-End kode keliai aprašomi `backend/src/routes`, užklausos logika yra `controllers`, bendri tikrinimai (žetonas, teisės, ID, validacija) `middleware`. Front-End puslapiai yra `frontend/src/pages`, pakartotinai naudojami elementai `components`, kreipiniai į API `api/client.js`.

## 3. Naudotojo sąsajos projektas

Sąsaja sukurta nuo wireframe: pirma suprojektuoti keturi langai, tada jie realizuoti. Wireframe yra SVG formatu (`docs/wireframes`), juos galima atidaryti ar importuoti į Figmą. Visi langai turi tris sritis (antraštė, turinys, poraštė) ir prisitaiko prie ekrano: iki 1024 px meniu paslepiamas už hamburgerio (siauresniame lange netelpa ilgesnis prisijungusio naudotojo meniu), iki 768 px tinkleliai tampa vienu stulpeliu, tinkleliai tampa vienu stulpeliu, lentelės virsta kortelėmis.

**1. Pradžios puslapis**

| Wireframe | Realizacija |
|---|---|
| ![Pradžios wireframe](docs/wireframes/1-pradzia.svg) | ![Pradžios puslapis](docs/screenshots/pradzia.png) |

**2. Recepto puslapis** (receptas, ingredientai, gaminimo eiga, atsiliepimai ir jų forma)

| Wireframe | Realizacija |
|---|---|
| ![Recepto wireframe](docs/wireframes/2-receptas.svg) | ![Recepto puslapis](docs/screenshots/receptas.png) |

**3. Recepto forma** (modalinis langas kūrimui ir redagavimui)

| Wireframe | Realizacija |
|---|---|
| ![Recepto formos wireframe](docs/wireframes/3-recepto-forma.svg) | ![Recepto forma](docs/screenshots/recepto-forma.png) |

**4. Telefono versija** (hamburger meniu)

| Wireframe | Realizacija |
|---|---|
| ![Telefono wireframe](docs/wireframes/4-telefonas.svg) | ![Telefono meniu](docs/screenshots/telefonas-meniu.png) |

Papildomi langai: [mano skydelis](docs/screenshots/skydelis.png) ir [administravimas](docs/screenshots/administravimas.png).

Sąsajos sprendimai:

- spalvų paletė laikoma CSS kintamuosiuose, šriftai iš Google Fonts (Nunito tekstui, Playfair Display antraštėms, lietuviškas raides turi latin-ext poaibis);
- ikonos yra SVG (`react-icons`), recepto nuotrauka nurodoma nuoroda, o jei jos nėra, rodoma pakaitinė iliustracija;
- antraštė, turinys ir poraštė turi skirtingą stilių, o duomenų įvedimui naudojami tekstas, textarea, select, number, radio, url ir žvaigždučių pasirinkimas;
- kūrimas, redagavimas ir trynimas vyksta modaliniuose languose, o grįžtamasis ryšys rodomas pranešimais ir klaidomis prie laukų (naršyklės `alert()` nenaudojamas);
- animacijos: kortelių ir mygtukų `transition`, `@keyframes` modalo atsiradimui, krovimo rateliui ir turinio atsiradimui.

## 4. API specifikacija

Pilna OpenAPI 3.0 specifikacija: [docs/api-spec.yaml](docs/api-spec.yaml) (25 metodai). Kiekvienam metodui joje yra aprašas, galimi atsako kodai ir užklausos bei atsakymo pavyzdžiai. Paleidus serverį, ji matoma Swagger UI adresu `/api-docs`.

Sąrašai puslapiuojami (`page`, `limit`) ir filtruojami, atsakymuose yra hypermedia nuorodos `_links`. Klaidos visada tokio formato: `{ "error": { "status": 404, "message": "...", "details": null } }`.

### 4.1. Autentifikacija ir teisės

Naudojami JWT žetonai. Access žetonas galioja 15 min., siunčiamas antraštėje `Authorization: Bearer`, jo viduje yra naudotojo ID (`sub`), rolė (`role`) ir sesijos ID (`sid`). Refresh žetonas galioja 7 d., siunčiamas `HttpOnly` cookie, duomenų bazėje saugomas tik jo hash, o kiekvieną kartą atnaujinant išduodamas naujas. Atsijungimas atšaukia sesiją, todėl po jo nustoja veikti ir dar nepasibaigęs access žetonas.

| Veiksmas | Svečias | user | admin |
|---|---|---|---|
| Viešų duomenų skaitymas (kategorijos, receptai, atsiliepimai) | taip | taip | taip |
| Kategorijų kūrimas, keitimas, šalinimas | 401 | 403 | taip |
| Recepto kūrimas | 401 | taip | taip |
| Recepto keitimas | 401 | tik savo | tik savo |
| Recepto šalinimas | 401 | tik savo | bet kurio |
| Atsiliepimo kūrimas | 401 | taip (ne savo recepto, vienas receptui) | taip (tos pačios taisyklės) |
| Atsiliepimo keitimas | 401 | tik savo | tik savo |
| Atsiliepimo šalinimas | 401 | tik savo | bet kurio |
| Naudotojų sąrašas, naudotojo šalinimas | 401 | 403 | taip |
| Skydelis `/users/{id}/dashboard` | 401 | tik savo | bet kurio |

Autorius (`authorId`) imamas iš žetono, o užklausos kūne atsiųstas `authorId` ar `role` ignoruojami.

## 5. Išvados

1. Užtruko nemažai laiko parsisiųsti visas programas, "Supabase", "Postman", "Render.com" užsiregistruoti, "Github" repository susikurti, VSCode aplinką susetup'int ir taip toliau. Apie 5 valandas, kol viską padariau.
2. Pats darbas užtruko apie 15 valandų. Po maždaug tiek laiko viskas veikė, tačiau pilnai dar nesupratau kodo ir visko. Iš viso su mokinimosi, aiškinimusi gavosi kokia +-25 valandų.
3. Kodą visą parašė Claude. Turiu pro versiją nusipirkęs, todėl padėjo, tikrai išmokau kaip geriau promptus rašyti. Naudojausi daug terminalu. Be LLM nežinau kiek laiko užtrukčiau viską pats darant... turbūt tiesiog naudočiau 3rd party app, kur viską už mane padaro.
4. Gavosi hierarchinis API kelias (kategorija → receptas → atsiliepimas). Taip pat 3 rolės. Svečias, narys, administratorius.
5. Visą projektą padariau per savaitę laiko.
## Diegimas ir nuorodos

Sistema diegiama Render platformoje (Back-End ir Front-End atskirai), duomenų bazė yra Supabase.

| Paslauga | Render nustatymai |
|---|---|
| API (Web Service) | Root Directory: nenurodyti (turi būti viso repozitorijos šaknis, nes API skaito `docs/api-spec.yaml`). Build Command: `cd backend && npm install`. Start Command: `cd backend && node src/server.js`. Aplinkos kintamieji: `NODE_ENV=production`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `FRONTEND_URL` (Front-End adresas be pasvirojo brūkšnio pabaigoje) |
| Front-End (Static Site) | Root Directory: `frontend`. Build Command: `npm install && npm run build`. Publish Directory: `dist`. Aplinkos kintamasis: `VITE_API_URL` (API adresas su `/api`, pvz. `https://.../api`). Rewrite taisyklė: `/*` → `/index.html` |

`VITE_API_URL` įrašomas į programą kūrimo metu, todėl jį pakeitus Front-End reikia perkurti (Manual Deploy).

Nuorodos: Front-End https://recipe-portal-1.onrender.com, API https://recipe-portal-4vyt.onrender.com/api, Swagger UI https://recipe-portal-4vyt.onrender.com/api-docs, kodas https://github.com/gustas215/recipe-portal.

## Paleidimas lokaliai

Reikia Node.js (LTS) ir PostgreSQL duomenų bazės (pvz. Supabase projekto).

1. Aplanke `backend` įdiegti paketus: `npm install`.
2. Sukurti `backend/.env` pagal `backend/.env.example` (`DATABASE_URL`, `JWT_ACCESS_SECRET`, `FRONTEND_URL`, `PORT`). Slaptą raktą galima sugeneruoti komanda `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
3. Užpildyti duomenų bazę: `npm run seed`. Komanda ištrina ir sukuria lenteles iš naujo.
4. Paleisti serverį: `npm run dev`. API pasiekiamas adresu `http://localhost:3000/api`, dokumentacija `http://localhost:3000/api-docs`.
5. Kitame terminale aplanke `frontend` įdiegti paketus (`npm install`) ir paleisti sąsają: `npm run dev`. Sąsaja pasiekiama adresu `http://localhost:5173`. API adresas imamas iš `VITE_API_URL` (pagal `frontend/.env.example`), o jei jo nėra, naudojamas `http://localhost:3000/api`. Back-End `FRONTEND_URL` turi būti `http://localhost:5173`.

Testiniai naudotojai (po `npm run seed`): `admin@example.com` / `Admin123!` (administratorius), `jonas@example.com`, `ruta@example.com`, `mantas@example.com` / `Slaptazodis123!` (paprasti naudotojai).

Testavimas: Postman kolekcija `postman/recipe-portal.postman_collection.json`. Importuoti į Postman, paleisti visą kolekciją per Runner (išjungti „Stop run if an error occurs“). Pirmas aplankas prisijungia keturiais naudotojais ir išsaugo žetonus, todėl kolekciją reikia leisti iš karto, žetonai galioja 15 min. Prieš kiekvieną paleidimą vykdyti `npm run seed`, nes aplankas 8 ištrina naudotoją.
