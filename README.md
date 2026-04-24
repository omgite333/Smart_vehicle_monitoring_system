# 🚗 VehicleOS — Smart Vehicle Monitoring System

A full-stack IoT vehicle monitoring system built with Next.js App Router, Neon PostgreSQL, Prisma ORM, Leaflet maps, and FASTag-style wallet system.

---

## ✨ Features

- **Live GPS Tracking** — Real-time map with OpenStreetMap + Leaflet.js
- **Speed Monitoring** — Auto-detects overspeed violations with configurable limits
- **IoT Hardware Integration** — Accepts both JSON and raw text messages
- **FASTag Wallet** — Add money, pay fines, view transaction history
- **Violations Management** — Unpaid/paid tabs, map links, one-click pay
- **JWT Authentication** — Secure login/register with bcrypt password hashing
- **Polling Updates** — Auto-refreshes every 5 seconds
- **Cyber Dashboard** — Dark theme with speed gauge, live stats

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript |
| Styling | Tailwind CSS |
| Database | Neon PostgreSQL (serverless) |
| ORM | Prisma |
| Auth | JWT + bcrypt |
| Maps | Leaflet.js + OpenStreetMap |
| State | React Hooks |
| Realtime | Polling (5s interval) |

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example env file:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Get from https://console.neon.tech → your project → Connection Details
DATABASE_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require"

# Any random secret string
JWT_SECRET="your-secret-key-here"
```

### 3. Set up Neon PostgreSQL

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the **Connection string** (with `?sslmode=require`)
4. Paste it as `DATABASE_URL` in your `.env`

### 4. Push Database Schema

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📡 IoT Hardware Integration

### JSON Input (POST /api/location/update)

```json
{
  "vehicleId": "V123",
  "speed": 55,
  "latitude": 16.8542,
  "longitude": 74.6015
}
```

### Raw Text Input (POST /api/location/update)

```
Overspeed Alert!
Speed: 55 km/h
Fine: Rs. 500
Location: https://maps.google.com/?q=16.8542,74.6015
```

### Example curl command:
```bash
# JSON
curl -X POST http://localhost:3000/api/location/update \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"V123","speed":55,"latitude":16.8542,"longitude":74.6015}'

# Raw text
curl -X POST http://localhost:3000/api/location/update \
  -H "Content-Type: text/plain" \
  -d "Speed: 55 km/h\nLocation: https://maps.google.com/?q=16.8542,74.6015"
```

---

## 🔢 Violation Logic

```
Speed Limit = 40 km/h

if speed > 40:
  if speed > 60:  → Fine = ₹1000
  else:           → Fine = ₹500
```

---

## 📁 Project Structure

```
├── app/
│   ├── dashboard/     # Main dashboard with speed gauge
│   ├── location/      # Live map + IoT simulator
│   ├── violations/    # Unpaid/paid violations table
│   ├── vehicle/       # Vehicle info & registration
│   ├── wallet/        # FASTag wallet & transactions
│   ├── login/         # Authentication
│   ├── register/      # New account registration
│   └── api/           # All API routes
├── components/
│   ├── Sidebar.js     # Navigation sidebar
│   ├── MapComponent.js # Leaflet map wrapper
│   └── Card.js        # Stat card component
├── lib/
│   ├── prisma.js      # Prisma client singleton
│   ├── auth.js        # JWT + bcrypt utilities
│   └── parser.js      # IoT message parser
└── prisma/
    └── schema.prisma  # Database schema
```

---

## 🔐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user + vehicle |
| POST | `/api/auth/login` | No | Login, get JWT token |
| GET | `/api/dashboard` | Yes | Dashboard summary |
| POST | `/api/location/update` | No | Update location (IoT endpoint) |
| GET | `/api/location/latest` | Yes | Latest location |
| GET | `/api/location/history` | Yes | Location history |
| GET | `/api/violations/:vehicleId` | Yes | List violations |
| POST | `/api/violations/pay` | Yes | Pay violation fine |
| GET | `/api/wallet` | Yes | Wallet balance + history |
| POST | `/api/wallet/add-money` | Yes | Top up wallet |
| POST | `/api/wallet/pay-fine` | Yes | Pay fine via wallet |
| GET | `/api/vehicle` | Yes | List vehicles |
| POST | `/api/vehicle` | Yes | Add vehicle |

---

## 📦 Production Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# DATABASE_URL, JWT_SECRET
```

After deployment, run:
```bash
npx prisma db push
```
