# Deployment Guide (Vercel + Railway/Render)

This project is split:
- `frontend/` -> React + Vite (deploy on Vercel)
- root app -> NestJS API (deploy on Railway or Render)

## 1) Backend Env Vars (exact keys)

Set these on Railway or Render:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DB_NAME?ssl=true
JWT_SECRET=replace-with-long-random-secret
JWT_EXPIRES_IN=7d
NODE_ENV=production
HOST=0.0.0.0
CORS_ORIGIN=https://YOUR_VERCEL_PROJECT.vercel.app
TELEGRAM_ENABLED=false
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
CLOUDINARY_CLOUD_NAME=dsgl6pzua
CLOUDINARY_API_KEY=YOUR_CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=YOUR_CLOUDINARY_API_SECRET
```

Notes:
- Do not set `PORT` manually on Railway/Render; platform provides it.
- `CORS_ORIGIN` supports comma-separated values if you use multiple frontend domains.

## 2) Railway Backend (recommended)

Service settings:

- Root Directory: repository root (`/`)
- Build Command: `npm install && npm run build`
- Start Command: `npx prisma migrate deploy && npm run start:prod`

After first deploy:
- Copy Railway public URL (example: `https://store-api-production.up.railway.app`)
- Check:
  - `GET /`
  - `GET /docs`

## 3) Render Backend (alternative)

Web service settings:

- Root Directory: repository root (`/`)
- Build Command: `npm install && npm run build`
- Start Command: `npx prisma migrate deploy && npm run start:prod`
- Health Check Path: `/`

Then verify:
- `https://YOUR_SERVICE.onrender.com/`
- `https://YOUR_SERVICE.onrender.com/docs`

## 4) Vercel Frontend

Project settings:

- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Env var on Vercel:

```env
VITE_API_BASE_URL=https://YOUR_BACKEND_URL
```

Use your real backend URL, for example:
- Railway: `https://store-api-production.up.railway.app`
- Render: `https://store-api.onrender.com`

`frontend/vercel.json` already includes SPA rewrite for React Router refresh support.

## 5) Final CORS Sync

After Vercel gives final domain (for example `https://store-ui.vercel.app`), set:

```env
CORS_ORIGIN=https://store-ui.vercel.app
```

If you also use custom domain:

```env
CORS_ORIGIN=https://store-ui.vercel.app,https://shop.yourdomain.com
```

## 6) Deploy Order

1. Deploy backend (Railway or Render) and confirm `/docs` works.
2. Deploy frontend on Vercel with `VITE_API_BASE_URL` set to backend URL.
3. Update backend `CORS_ORIGIN` to the final Vercel domain.
4. Redeploy backend once after CORS change.
