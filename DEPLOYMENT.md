# Deployment Guide

## Current Status

✅ **Deployed to:** https://mission-control-six-wheat.vercel.app/mission  
✅ **GitHub:** https://github.com/Mindshiftventures/mission-control  
✅ **All APIs working**  
✅ **Environment variables configured**

---

## Production URLs

- **Live Dashboard:** https://mission-control-six-wheat.vercel.app/mission
- **API Endpoints:**
  - `/mission/api/agents/status` - Current agent statuses
  - `/mission/api/sessions` - Recent completed sessions  
  - `/mission/api/costs/today` - Today's cost summary

---

## Custom Domain Setup (hq.birjuravaliya.com/mission)

### In Vercel Dashboard:

1. Go to Project Settings → Domains
2. Add domain: `hq.birjuravaliya.com`
3. Follow DNS verification steps

### DNS Configuration:

Add these records to your DNS provider (Cloudflare/etc):

```
Type: CNAME
Name: hq
Value: cname.vercel-dns.com
```

### Path-based routing:

The app is already configured with `basePath: "/mission"` in `next.config.ts`, so it will automatically work at `/mission` once the domain is connected.

---

## Environment Variables

Required environment variables (already configured in Vercel):

```env
KV_REST_API_URL=https://powerful-ladybug-44393.upstash.io
KV_REST_API_TOKEN=Aa1pAAIncDIyOGNlYTY3NGZlYmI0YWQ4YmM1NGM2Y2M2ODQ3NDk0YXAyNDQzOTM
```

These are set for:
- ✅ Production
- ✅ Preview  
- ✅ Development

---

## Redeploying

### Via Git (Recommended):

```bash
cd ~/clawd/mission-control
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will auto-deploy on push to `main`.

### Via Vercel CLI:

```bash
cd ~/clawd/mission-control
vercel --prod
```

---

## Local Development

```bash
cd ~/clawd/mission-control
npm run dev
```

Open: http://localhost:3000/mission

Ensure `.env.local` contains:
```env
KV_REST_API_URL="https://powerful-ladybug-44393.upstash.io"
KV_REST_API_TOKEN="Aa1pAAIncDIyOGNlYTY3NGZlYmI0YWQ4YmM1NGM2Y2M2ODQ3NDk0YXAyNDQzOTM"
```

---

## Vercel Project Details

- **Project ID:** `prj_jphT9P7lovoFL3nQ7PBQNsep15Cb`
- **Team:** birjuravaliya-gmailcoms-projects
- **Auto-deploy:** Enabled on push to `main`
- **Framework:** Next.js 16.1.6
- **Node version:** 20.x (auto-detected)

---

## Future: Phase 2 Database Setup

When ready to add Neon Postgres for historical data:

1. Create Neon database
2. Add `DATABASE_URL` to Vercel env vars:
   ```bash
   echo "postgresql://user:pass@host/db" | vercel env add DATABASE_URL production
   ```
3. Run migrations:
   ```bash
   npm run db:push
   ```

---

## Monitoring

### Check deployment status:
```bash
vercel ls mission-control
```

### View logs:
```bash
vercel logs mission-control-six-wheat.vercel.app
```

### Test APIs:
```bash
# Agent status
curl https://mission-control-six-wheat.vercel.app/mission/api/agents/status | jq

# Cost summary
curl https://mission-control-six-wheat.vercel.app/mission/api/costs/today | jq

# Recent sessions
curl https://mission-control-six-wheat.vercel.app/mission/api/sessions | jq
```

---

## Troubleshooting

### "Failed to fetch agent status"

Check environment variables are set:
```bash
vercel env ls
```

Should show `KV_REST_API_URL` and `KV_REST_API_TOKEN` for all environments.

### Data not updating

Check agent-status-pusher is running:
```bash
launchctl list | grep agent-status
```

Should show: `com.lyra.agent-status-pusher`

If not running:
```bash
cd ~/clawd/scripts
launchctl load com.lyra.agent-status-pusher.plist
```

### UI not loading

- Check Vercel deployment status
- Verify the `/mission` basePath in URLs
- Clear browser cache

---

## Security Notes

- ✅ Tailscale-only access (VPN required) - configure in Vercel once domain is added
- ✅ Environment variables encrypted by Vercel
- ✅ No authentication needed (protected by VPN)
- ✅ No public access without VPN connection
