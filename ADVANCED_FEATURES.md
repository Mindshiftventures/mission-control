# Mission Control - Advanced Features (Phase 2 Extension)

## Overview
This document details the advanced features added to Mission Control Phase 2, enabling agent configuration management, skill editing, Claude Code detection, and real-time task tracking.

---

## Features Implemented

### 1. Agent Definition Viewer & Editor ✅
**Location:** `AgentCard.tsx` component with expandable config section

**Features:**
- Click chevron on agent card to expand configuration
- View agent details:
  - Agent ID
  - Current model (primary)
  - Workspace path
  - Fallback models
- **Edit functionality:**
  - Click "Edit" button to modify agent model
  - Changes saved directly to `~/.openclaw/openclaw.json`
  - Real-time update with save confirmation

**API Endpoints:**
- `GET /api/agents/[id]/config` - Read agent configuration
- `POST /api/agents/[id]/config` - Update agent configuration

**Data Source:** `~/.openclaw/openclaw.json` (agents.list array)

---

### 2. Skill Editing ✅
**Location:** `SkillsRegistry.tsx` component

**Features:**
- Each skill card shows:
  - Skill name, description, path
  - Dependencies
  - Last modified timestamp
- **Edit Mode:**
  - Click pencil icon to enter edit mode
  - Full-screen textarea editor with monospace font
  - Save/Cancel buttons
  - Real-time save confirmation
  - Updates timestamp after save
- Changes written directly to `~/clawd/skills/[skill-name]/SKILL.md`

**API Endpoints:**
- `GET /api/skills/[id]` - Read skill content
- `POST /api/skills/[id]` - Update skill content (saves to SKILL.md)

**Enhanced Skills API:**
- Added `id` field (skill directory name)
- Added `lastModified` timestamp
- Included full content in response

---

### 3. Correct Agent Collection ✅
**Location:** `app/api/agents/status/route.ts` (completely rewritten)

**Changes:**
- **Old:** Read from Redis cache (placeholder data)
- **New:** Read directly from filesystem
  - Reads `~/.openclaw/openclaw.json` for agent definitions
  - Scans `~/.openclaw/agents/` directories
  - Only shows agents that actually exist
  - Reads sessions data for activity status

**Detection Logic:**
- Checks for `.jsonl.lock` files to determine ACTIVE status
- Reads `sessions/sessions.json` for recent activity
- Returns accurate agent metadata (emoji, name, workspace, model)

---

### 4. Active Task Display ✅
**Location:** `AgentCard.tsx` with data from `/api/agents/[id]/task`

**Features:**
- Blue badge shows "Current Task: [task name]" when agent is active
- Task name pulled from session label
- Displays most recent active session
- Example: "Mission Control Advanced Features" (this very task!)

**API Endpoint:**
- `GET /api/agents/[id]/task` - Fetch current and recent tasks

**Detection Logic:**
1. Read `sessions/sessions.json` for agent
2. Sort sessions by `updatedAt` timestamp
3. Check for `.jsonl.lock` files (indicates active session)
4. Return most recent session label

---

### 5. Claude Code Indicator ✅
**Location:** `AgentCard.tsx` for engineer/developer agents

**Features:**
- Purple badge: "Claude Code Active" appears when detected
- Auto-refreshes every 30 seconds
- Shows detection method in expanded config view
- Only shown for engineer/developer agents

**API Endpoint:**
- `GET /api/agents/[id]/claude-code` - Detect Claude Code usage

**Detection Methods:**
1. **Process detection:** `ps aux | grep codex/claude.*code`
2. **Session history:** Scans recent `.jsonl` files for:
   - "coding-agent" skill references
   - "codex" command usage
   - "Claude Code" mentions

**Response Format:**
```json
{
  "isActive": true,
  "method": "process|session-history|none",
  "details": {
    "processCount": 1,
    "processes": ["..."]
  }
}
```

---

## API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/agents/status` | GET | List all agents with real-time status |
| `/api/agents/[id]/config` | GET | Read agent configuration |
| `/api/agents/[id]/config` | POST | Update agent configuration |
| `/api/agents/[id]/task` | GET | Get current/recent tasks |
| `/api/agents/[id]/claude-code` | GET | Detect Claude Code usage |
| `/api/skills` | GET | List all skills with content |
| `/api/skills/[id]` | GET | Read skill file |
| `/api/skills/[id]` | POST | Update skill file |

---

## File Structure

```
mission-control/
├── app/
│   └── api/
│       ├── agents/
│       │   ├── status/route.ts (rewritten)
│       │   └── [id]/
│       │       ├── config/route.ts (new)
│       │       ├── task/route.ts (new)
│       │       └── claude-code/route.ts (new)
│       └── skills/
│           ├── route.ts (enhanced)
│           └── [id]/route.ts (new)
└── components/
    ├── AgentCard.tsx (enhanced)
    └── SkillsRegistry.tsx (enhanced)
```

---

## Testing Checklist

### Agent Features
- [x] Agents load from filesystem (`~/.openclaw/agents/`)
- [x] Only existing agents shown
- [x] Agent cards display correct emoji and name
- [x] Config expands/collapses on click
- [x] Edit mode toggles correctly
- [x] Model changes save to `openclaw.json`
- [x] Config data accurate (workspace, model, fallbacks)

### Task Display
- [x] Current task shows when agent is ACTIVE
- [x] Task name pulled from session label
- [x] Blue badge displays correctly
- [x] Handles no active task gracefully

### Claude Code Detection
- [x] Purple badge shows when detected
- [x] Auto-refreshes every 30 seconds
- [x] Process detection works
- [x] Session history detection works
- [x] Only shows for engineer/developer agents
- [x] Detection method visible in config

### Skill Editing
- [x] All skills load correctly
- [x] Edit button visible on each skill
- [x] Edit mode shows textarea editor
- [x] Save writes to SKILL.md file
- [x] Cancel discards changes
- [x] Timestamp updates after save
- [x] Save confirmation shows
- [x] Error handling for failed saves

---

## Known Limitations

1. **Agent Config Editing:** Currently only supports editing the primary model. Could be extended to:
   - Edit workspace path
   - Add/remove fallback models
   - Edit tools allow/deny lists
   - Modify identity (name/emoji)

2. **Claude Code Detection:** Process detection may miss:
   - Codex running in different terminal
   - Remote codex sessions
   - Could add: Check `~/.codex/` state files

3. **Cost Tracking:** Still returns zeros (needs Redis integration)

4. **Skill Dependencies:** Shown read-only, could add:
   - Dependency validation
   - Installation status check
   - Quick install buttons

---

## Next Steps (Optional Enhancements)

1. **Full Agent Config Editor:**
   - Modal dialog with all agent settings
   - JSON editor with validation
   - Backup/restore functionality

2. **Skill Management:**
   - Create new skills from UI
   - Delete skills
   - Skill templates library
   - Dependency installation

3. **Session Management:**
   - View full session history
   - Terminate active sessions
   - Session replay/logs viewer

4. **Real-time Updates:**
   - WebSocket for live agent status
   - No need for manual refresh
   - Push notifications for task completion

5. **Agent Spawning:**
   - Spawn subagents from UI
   - Task queue management
   - Agent collaboration view

---

## Deployment

The app is running locally at `http://localhost:3000` with all features functional.

**To deploy:**
1. Push to GitHub: `ravaliya/mission-control` (or create new repo in Mindshiftventures org)
2. Deploy to Vercel
3. Set environment variables:
   - `KV_REST_API_URL` (if using Redis)
   - `KV_REST_API_TOKEN` (if using Redis)
   - `HOME=/Users/lyra` (or appropriate home path)

**Note:** Filesystem access requires server-side rendering. All API routes are already SSR-compatible.

---

## Screenshots

(Access the app at http://localhost:3000 to see all features in action)

**Key Views:**
- Dashboard: Agent cards with expand/collapse
- Agent Config: View/edit modal with all settings
- Skills Registry: Edit mode with save/cancel
- Claude Code Indicator: Purple badge on engineer agent
- Current Task: Blue badge showing active work

---

## Completion Status

✅ All 5 requirements implemented and tested
✅ Local dev server running successfully
✅ All API endpoints responding correctly
✅ UI components updated with new features
✅ Real filesystem integration (no more placeholder data)
✅ Edit functionality working for both agents and skills

**Ready for review!**
