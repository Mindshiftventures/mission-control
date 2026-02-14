import { NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agentDir = join(process.env.HOME || "/Users/lyra", ".openclaw", "agents", id);
    const sessionsFile = join(agentDir, "sessions", "sessions.json");
    
    try {
      const content = await readFile(sessionsFile, "utf-8");
      const sessions = JSON.parse(content);
      
      // Find active sessions (those with .jsonl files without .deleted suffix and have lock files)
      const activeSessions = Object.entries(sessions)
        .filter(([_, session]: [string, any]) => {
          return session.label && session.sessionId;
        })
        .map(([sessionKey, session]: [string, any]) => ({
          sessionKey,
          label: session.label,
          updatedAt: session.updatedAt,
          channel: session.channel
        }))
        .sort((a: any, b: any) => b.updatedAt - a.updatedAt);
      
      if (activeSessions.length === 0) {
        return NextResponse.json({
          activeTask: null,
          allTasks: []
        });
      }
      
      // Check which sessions have lock files (indicating active sessions)
      const sessionsDir = join(agentDir, "sessions");
      const files = await readdir(sessionsDir);
      const lockFiles = files.filter(f => f.endsWith('.jsonl.lock'));
      
      const activeWithLocks = activeSessions.filter((session: any) => {
        return lockFiles.some(lock => lock.startsWith(session.sessionKey.split(':').pop() || ''));
      });
      
      return NextResponse.json({
        activeTask: activeWithLocks[0] || activeSessions[0],
        allTasks: activeSessions
      });
    } catch (error) {
      return NextResponse.json({
        activeTask: null,
        allTasks: [],
        error: "No sessions found"
      });
    }
  } catch (error) {
    console.error("Failed to read agent task:", error);
    return NextResponse.json(
      { error: "Failed to read agent task" },
      { status: 500 }
    );
  }
}
