# Mission Control - Phase 1

Agent Status & Cost Tracking Dashboard for OpenClaw AI agents.

## Features

### Phase 1 (Current)
- **Real-time Agent Status Dashboard**
  - Visual cards for each agent (Lyra, Researcher, Writer, Developer, Designer)
  - Status indicators (IDLE/ACTIVE/WORKING) with animated pulse
  - Current task display when active
  - Token usage and cost per agent
  - Last activity timestamp

- **Today's Cost Summary**
  - Total daily spend
  - Total tokens processed
  - Task completion count
  - Breakdown by agent with individual costs

- **Recent Sessions Table**
  - Last 20 completed tasks
  - Sortable columns
  - Task details, tokens, cost, completion time

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Neon Postgres (Drizzle ORM)
- **Real-time Data:** Upstash Redis
- **Deployment:** Vercel
- **Auth:** Tailscale (VPN-based, no login UI)

## Architecture

### Data Sources
1. **Upstash Redis** - Real-time agent status (updated every 5 seconds)
   - Key: `agents:status` - Current status of all agents
   - Key: `agents:completed_today` - Completed tasks today

2. **Neon Postgres** - Historical data (future phases)
   - Tables: `agents`, `sessions`, `cost_events`, `daily_costs`

### API Routes
- `GET /api/agents/status` - Current agent statuses
- `GET /api/sessions` - Recent completed sessions
- `GET /api/costs/today` - Today's cost summary

## Setup

### Prerequisites
- Node.js 18+
- npm
- Upstash Redis account
- Neon Postgres account (optional for Phase 1)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mindshiftventures/mission-control.git
   cd mission-control
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   # Upstash Redis (Required)
   KV_REST_API_URL="your_upstash_redis_url"
   KV_REST_API_TOKEN="your_upstash_redis_token"

   # Neon Postgres (Optional for Phase 1)
   DATABASE_URL="postgresql://user:password@host/database"
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000/mission](http://localhost:3000/mission)

### Database Setup (Optional - Phase 2+)

When ready to use Neon Postgres for historical data:

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Deployment

### Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Mission Control Phase 1"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Connect repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy

3. **Configure Custom Domain:**
   - Domain: `hq.birjuravaliya.com`
   - Path: `/mission`
   - Already configured with `basePath` in `next.config.ts`

### Environment Variables (Vercel)

Add these in Vercel project settings:

```
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
DATABASE_URL=your_neon_postgres_url (optional)
```

## Project Structure

```
mission-control/
├── app/
│   ├── api/                  # API routes
│   │   ├── agents/status/    # Agent status endpoint
│   │   ├── sessions/         # Sessions endpoint
│   │   └── costs/today/      # Cost summary endpoint
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main dashboard
│   └── globals.css           # Global styles
├── components/
│   ├── AgentCard.tsx         # Agent status card
│   ├── CostSummary.tsx       # Cost summary widget
│   └── SessionsTable.tsx     # Sessions table
├── lib/
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema
│   │   └── index.ts          # Database client
│   └── redis.ts              # Redis client & types
├── drizzle/                  # Database migrations
├── next.config.ts            # Next.js config (with basePath)
├── drizzle.config.ts         # Drizzle Kit config
└── package.json
```

## Development

### Auto-refresh
The dashboard auto-refreshes every 5 seconds to show real-time status.

### Testing Locally
1. Ensure the agent-status-pusher script is running
2. Start the dev server: `npm run dev`
3. Open browser to `http://localhost:3000/mission`

## Roadmap

### Phase 2 (Planned)
- Skills & Capabilities tracking
- Historical cost charts
- Model usage breakdown (Opus/Sonnet/Haiku)
- Burn rate calculator
- Cron jobs dashboard

### Phase 3 (Planned)
- Agent configuration editor
- Skill assignment UI
- Real-time notifications
- Export/reporting features

## Security

- **Authentication:** Tailscale VPN-based access only
- **No public access:** Dashboard requires VPN connection
- **Environment variables:** Never commit `.env.local`

## Contributing

This is an internal project for Mindshift Ventures. Contact Birju for access.

## License

Proprietary - Mindshift Ventures © 2026
