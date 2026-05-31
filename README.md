# SastaKhojo v2.1 — Live Price Comparison
### MCA Final Sem College Project

---

## Real Prices Setup — EASY (5 minute mein)

### Step 1: RapidAPI pe free account banao
https://rapidapi.com par jao → "Sign Up" (Google se bhi login kar sakte ho)

### Step 2: Amazon API subscribe karo (FREE)
Is link par jao:
https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data

"Subscribe to Test" button dabao → Basic plan FREE hai (200 req/month)

### Step 3: API Key copy karo
RapidAPI dashboard mein upar "X-RapidAPI-Key" dikhti hai — woh copy karo

### Step 4: .env file mein daalo
```
RAPIDAPI_KEY=paste_your_key_here
```

### Step 5: Server start karo
```bash
node server.js
```
Console mein dikhega:
```
MODE: LIVE — RapidAPI se real Amazon prices aayenge!
```

Ab search karo — **real Amazon India prices** aayenge! 🎉

---

## Normal Setup (bina real prices ke — demo mode)

```bash
npm install
mongod                    # MongoDB start karo (alag terminal mein)
node seed.js              # Sample data
node server.js            # Server start karo
# Browser mein: http://localhost:3000
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML + CSS + JavaScript |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Real Prices | RapidAPI (Real-Time Amazon Data) |
| Cache | node-cache (10 min TTL) |
| Config | dotenv |

---

## API Endpoints

| URL | Description |
|-----|-------------|
| `GET /api/search?q=earphones` | Search |
| `GET /api/search?q=shirt&maxPrice=500` | Budget filter |
| `GET /api/health` | Mode check (LIVE/DEMO) |

---
Made for MCA Final Sem | SastaKhojo v2.1
