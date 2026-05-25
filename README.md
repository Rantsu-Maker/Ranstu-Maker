# Ranstu-Maker 🎬

Videoiden jakamisalusta, jossa käyttäjät voivat:
- 📹 Jakaa omia videoita
- 🤖 Luoda AI-videoita
- ❤️ Tykätä ja kommentoida videoita
- 👥 Seurata muita käyttäjiä

## Asennus

### Vaatimukset
- Node.js v14+
- PostgreSQL v12+

### Setup

1. **Kloonaa repo**
```bash
git clone https://github.com/Rantsu-Maker/Ranstu-Maker.git
cd Ranstu-Maker
```

2. **Asenna riippuvuudet**
```bash
npm install
```

3. **Luo .env tiedosto**
```bash
cp .env.example .env
```
Muokkaa `.env`:ää PostgreSQL-tietosi mukaan.

4. **Alusta tietokanta**
```sql
psql -U your_user -d your_database -f src/database/schema.sql
```

5. **Käynnistä palvelin**
```bash
npm run dev
```

Palvelin käynnistyy osoitteessa `http://localhost:5000`

## API Endpoints

### Autentikaatio
- `POST /api/auth/register` - Rekisteröi uusi käyttäjä
- `POST /api/auth/login` - Kirjaudu sisään

### Käyttäjät
- `GET /api/users/:userId` - Hae käyttäjäprofiili
- `PUT /api/users/:userId` - Päivitä profiilia
- `POST /api/users/:userId/follow` - Seuraa käyttäjää
- `POST /api/users/:userId/unfollow` - Poista seuranta

### Videot
- `GET /api/videos` - Hae videoita (feedissä)
- `GET /api/videos/:videoId` - Hae video
- `POST /api/videos` - Lataa video
- `POST /api/videos/:videoId/like` - Tykkää videosta
- `POST /api/videos/:videoId/unlike` - Poista tykkäys
- `POST /api/videos/:videoId/comments` - Lisää kommentti

## Projektirakennus

```
ranstu-maker/
├── src/
│   ├── database/
│   │   ├── db.js (tietokantayhteys)
│   │   └── schema.sql (tietokannan rakenne)
│   ├── routes/
│   │   ├── auth.js (autentikaatio)
│   │   ├── users.js (käyttäjät)
│   │   └── videos.js (videot)
│   └── middleware/
│       └── auth.js (JWT-todistus)
├── server.js (pääpalvelin)
├── package.json
├── .env.example
└── README.md
```

## Seuraavat vaiheet

- [ ] Frontend-kehitys (Next.js)
- [ ] AI-videofunktiot
- [ ] Hakutoiminnot
- [ ] Deployment

## Lisenssi

MIT

---
*Valmistettu Ranstu-Makerin kanssa* 🚀
