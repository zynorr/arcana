# Deployment Guide

## Architecture

- **Dashboard**: Vercel (Next.js)
- **API + Collector**: Render (Node.js services)
- **Database**: Render PostgreSQL (free tier)
- **Cache**: Render Redis (free tier)

---

## Option A: Manual Setup (Recommended)

### Step 1: Deploy Database & Redis on Render

1. Go to https://dashboard.render.com
2. Create **PostgreSQL**:
   - Name: `arcana-db`
   - Plan: Free
   - Region: Oregon (or closest to you)
   - Copy the "Connection String" (format: `postgres://...`)
3. Create **Redis**:
   - Name: `arcana-redis`
   - Plan: Free
   - Region: Oregon
   - Copy the "Connection String" (format: `redis://...`)

### Step 2: Deploy API to Render

1. Go to https://dashboard.render.com → "New" → "Web Service"
2. Connect your GitHub repo
3. Settings:
   - **Name**: `arcana-api`
   - **Root Directory**: `packages/api`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node dist/index.js`
4. Add Environment Variables:
   ```
   DATABASE_URL=postgres://... (from Step 1)
   REDIS_URL=redis://... (from Step 1)
   ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
   ARBITRUM_CHAIN_ID=42161
   API_PORT=10000
   NODE_ENV=production
   ```
5. Click "Create Web Service"

### Step 3: Deploy Collector to Render

1. Go to https://dashboard.render.com → "New" → "Web Service"
2. Connect your GitHub repo
3. Settings:
   - **Name**: `arcana-collector`
   - **Root Directory**: `packages/collector`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node dist/index.js`
4. Add Environment Variables (same as API):
   ```
   DATABASE_URL=postgres://... (from Step 1)
   REDIS_URL=redis://... (from Step 1)
   ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
   ARBITRUM_CHAIN_ID=42161
   COLLECTOR_POLL_INTERVAL_MS=1000
   COLLECTOR_BATCH_SIZE=100
   NODE_ENV=production
   ```
5. Click "Create Web Service"

### Step 4: Deploy Dashboard to Vercel

1. Go to https://vercel.com/new → Import your repo
2. Settings:
   - Framework: Next.js
   - Root Directory: `packages/dashboard`
3. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://arcana-api.onrender.com
   NEXT_PUBLIC_WS_URL=wss://arcana-api.onrender.com
   ```
4. Click "Deploy"

### Step 5: Run Migrations

1. In Render dashboard, go to your API service
2. Click "Shell" to open a terminal
3. Run:
   ```bash
   cd packages/db && pnpm migrate
   ```

---

## Option B: Using render-cli (Advanced)

```bash
# Install render-cli
npm install -g render-cli

# Deploy everything
render deploy
```

(Note: You may need to adjust `render.yaml` for your account)

---

## Important Notes

1. **Order matters**: Deploy API and Collector together
2. **Cold starts**: First request may be slow (Render free tier sleeps after 15min inactivity)
3. **Backfill time**: Initial historical data backfill takes time (Arbitrum has 450M+ blocks)
4. **Health check**: The collector logs its progress - check Render logs for debugging