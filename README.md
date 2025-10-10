# EnduranceHub

Centrine platforma, kuri suvienija sportininko, trenerio, dietologo ir medicinos komandos darba vienoje vietoje. Sprendimas apima REST API ir modernia React kliento aplikacija.

## Architektura
- Front-end: React (Vite), React Router, kontekstine autentifikacija
- Back-end: Node.js, Express, Sequelize, JWT autentifikacija
- Duomenu baze: MySQL
- Dokumentacija: OpenAPI (Swagger UI pasiekiamas adresu `/api/docs`)

## Funkcionalumas
- Registracija ir prisijungimas su prieigos ir atnaujinimo zetonais
- Vartotoju roles: svecias, sportininkas, specialistas, administratorius
- Sportininku profiliai, treniruociu ir mitybos planai (15 REST CRUD metodu)
- Pranesimu sistema tarp komandos nariu
- Hierarchines sasajos: treniruociu ir mitybos planai pagal sportininka

## Katalogu struktura
- `backend/`  Node.js REST API, Swagger specifikacija
- `frontend/`  React kliento aplikacija
- `README.md`  projekto dokumentacija

## Diegimas
### 0. Docker Compose (greičiausias būdas)
1. Įsitikinkite, kad turite įdiegtą Docker ir Docker Compose.
2. Iš projekto šaknies paleiskite:
   ```
   docker compose up backend
   ```
3. Komanda automatiškai įdiegs priklausomybes, užpildys DB seed duomenimis ir paleis API http://localhost:4000.

### 1. Back-end
1. Atsidarykite kataloga `backend`
2. Sukurkite `.env` faila remdamiesi `.env.example`
3. Idiekite priklausomybes: `npm install`
4. Paleiskite API: `npm run dev` (arba `npm start` gamybai)
5. Swagger dokumentacija: `http://localhost:4000/api/docs`

### 2. Front-end
1. Atsidarykite kataloga `frontend`
2. Sukurkite `.env` faila remdamiesi `.env.example`
3. Idiekite priklausomybes: `npm install`
4. Paleiskite dev serveri: `npm run dev`
5. Numatyta kliento nuoroda: `http://localhost:5173`

## Duomenų paruošimas
- Seed skriptas greitai užpildo MySQL prasmingais duomenimis (vartotojai, sportininkai, planai, pranešimai). **Perspėjimas:** skriptas išvalo lenteles (`sync({ force: true })`).
  ```
  cd backend
  npm run seed
  ```
- Demo paskyrų duomenys:
  | Role              | El. paštas                  | Slaptažodis       |
  |-------------------|-----------------------------|-------------------|
  | Administratorius  | admin@endurancehub.test     | AdminPass123!     |
  | Specialistas      | coach@endurancehub.test     | CoachPass123!     |
  | Sportininkė Rūta  | runner@endurancehub.test    | AthleteOne123!    |
  | Sportininkas Tomas| triathlete@endurancehub.test| AthleteTwo123!    |

## Postman demonstracija
- Paruošta kolekcija su 18 užklausų (visos 15 API funkcijų + klaidų scenarijai) ir automatiniais testais: `docs/endurancehub.postman_collection.json`.
- Kolekcija aprėpia 200/201/204/400/401/403/404/422 atsakymus. Tą patį galima paleisti su `newman`:
  ```
  newman run docs/endurancehub.postman_collection.json
  ```
- Kolekcija pati pasigamina prieigos žetonus ir kintamuosius (`collection variables`), todėl užtenka paleisti vieną Runner turą (~15 sekundžių).

## Environment kintamieji
### Back-end `.env`
```
PORT=4000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=secret
MYSQL_DB=endurancehub
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CORS_ORIGIN=http://localhost:5173
```

### Front-end `.env`
```
VITE_API_URL=http://localhost:4000/api
```

## Naudojimas
1. Registruokite vartotoja (pagal role). Sportininko registracija automatiskai sukuria profili
2. Prisijunge sportininkas mato skydeli, savo profili, treniruociu ir mitybos planus
3. Specialistas ir administratorius gali kurti, redaguoti ir salinti planus, siusti pranesimus
4. Administratorius turi papildomus irankius sportininku profiliams valdyti

## Testavimas
- Back-end: `npm run lint`
- Front-end: `npm run build`

## Ateities pltra
- Automatines el. laisku zinutes apie pakeitimus
- Integracija su ismaniaisiais laikrodziais (sveikatos duomenys)
- Detalesnes ataskaitos ir diagramos statistikai
