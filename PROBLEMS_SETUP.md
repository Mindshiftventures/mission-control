# Problems Tracker Setup

## ✅ Completed
1. Database schema added to `lib/db/schema.ts`
2. Migration generated: `drizzle/0000_charming_beyonder.sql`
3. All API routes created:
   - `/api/problems` (GET, POST)
   - `/api/problems/[id]` (GET, PATCH, DELETE)
   - `/api/problems/[id]/comments` (POST)
   - `/api/problems/[id]/comments/[commentId]` (PATCH, DELETE)
   - `/api/problems/[id]/attachments` (POST)
   - `/api/problems/[id]/attachments/[attachId]` (DELETE)
   - `/api/problems/sync/telegram` (POST)
4. Frontend components created:
   - `/app/problems/page.tsx` - Main problems page
   - `components/ProblemsKanban.tsx` - Kanban board with drag-drop
   - `components/ProblemDetail.tsx` - Problem detail modal
   - `components/CreateProblem.tsx` - Create problem dialog
5. Navigation updated with "Problems" tab

## 🔧 Next Steps

### 1. Database Setup (REQUIRED)

The database needs to be configured. Two options:

#### Option A: Use Existing Neon Database
If you already have a Neon database for Mission Control:
1. Get the connection string from Neon dashboard
2. Add to `.env.local`:
   ```
   DATABASE_URL="postgresql://user:pass@host.neon.tech/db"
   ```
3. Push schema:
   ```bash
   cd ~/clawd/mission-control
   npm run db:push
   ```

#### Option B: Create New Neon Database
1. Go to https://console.neon.tech
2. Create new project: "mission-control"
3. Copy connection string
4. Add to `.env.local` (see above)
5. Push schema (see above)

### 2. Deploy to Vercel

After database is configured:

```bash
cd ~/clawd/mission-control

# Add DATABASE_URL to Vercel
vercel env add DATABASE_URL production
# Paste your Neon connection string

# Also add for preview & development
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Deploy
git add .
git commit -m "Add Problems Tracker"
git push origin main
```

### 3. Test Locally

```bash
cd ~/clawd/mission-control
npm run dev
```

Open: http://localhost:3000/problems

## Features Implemented

### Kanban Board
- 6 columns: Backlog, Planning, In Progress, Blocked, Review, Done
- Drag-and-drop between columns (auto-updates status)
- Color-coded by priority (Low, Medium, High)
- Shows owner, assignee, tags
- Telegram badge for items created from Telegram

### Problem Detail Modal
- View/edit all problem fields
- Comments section (add, view)
- Attachments section (add links)
- Activity log (tracks all changes)
- Full editing capabilities

### Create Problem Dialog
- Title, description, owner, assignee, priority
- Tag management (add/remove)
- Telegram thread linking

### API Features
- Full CRUD for problems
- Comments with bidirectional sync support
- Attachments (links)
- Activity logging for all changes
- Filtering by status, owner, assignee, tags

## TODO: Telegram Integration

The Telegram sync endpoint is created but needs integration with the actual Telegram bot. This requires:

1. Add webhook to Telegram bot
2. Parse incoming messages for keywords
3. Auto-create problems when keywords detected
4. Sync comments bidirectionally
5. Send notifications for assignments/status changes

## TODO: Heartbeat Integration

Create `heartbeat-problems.md` with checks for:
- New problems created (triage)
- Problems assigned to Birju waiting >1 day (remind)
- Problems assigned to Lyra stale >24h (flag)
- Blocked items waiting >2 days (escalate)
- Due dates < 3 days (alert)
- Items moved to "review" (notify)

Add to `HEARTBEAT.md`:
```md
## Problems Tracker
- Check for stale/blocked items
- Remind on upcoming due dates
- Notify on review items
```

## File Structure

```
mission-control/
├── app/
│   ├── api/
│   │   └── problems/
│   │       ├── route.ts (GET, POST)
│   │       ├── [id]/
│   │       │   ├── route.ts (GET, PATCH, DELETE)
│   │       │   ├── comments/
│   │       │   │   ├── route.ts (POST)
│   │       │   │   └── [commentId]/route.ts (PATCH, DELETE)
│   │       │   └── attachments/
│   │       │       ├── route.ts (POST)
│   │       │       └── [attachId]/route.ts (DELETE)
│   │       └── sync/
│   │           └── telegram/route.ts (POST)
│   └── problems/
│       └── page.tsx
├── components/
│   ├── ProblemsKanban.tsx
│   ├── ProblemDetail.tsx
│   ├── CreateProblem.tsx
│   └── Navigation.tsx (updated)
└── lib/
    └── db/
        └── schema.ts (updated)
```

## Next Review

After database is configured and deployed, test:
1. Create problem via UI
2. Drag-drop between columns
3. Add comments
4. Add attachments
5. Edit problem details
6. Filter by owner/assignee
7. View activity log

---

**Total Time:** ~2 hours (API + Frontend + Components)
**Status:** ✅ Code Complete - Database setup required
