import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

const execAsync = promisify(exec);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check for running codex/claude-code processes
    try {
      const { stdout } = await execAsync("ps aux | grep -i 'codex\\|claude.*code' | grep -v grep");
      const processes = stdout.trim().split('\n').filter(Boolean);
      
      if (processes.length > 0) {
        return NextResponse.json({
          isActive: true,
          method: "process",
          details: {
            processCount: processes.length,
            processes: processes.slice(0, 3) // Limit to first 3 for brevity
          }
        });
      }
    } catch (e) {
      // No processes found, that's okay
    }
    
    // Check recent session history for coding-agent skill usage
    try {
      const agentDir = join(process.env.HOME || "/Users/lyra", ".openclaw", "agents", id);
      const sessionsDir = join(agentDir, "sessions");
      const files = await readdir(sessionsDir);
      
      // Look for recent .jsonl files (not deleted, with lock files)
      const recentSessions = files
        .filter(f => f.endsWith('.jsonl') && !f.includes('.deleted'))
        .slice(-5); // Check last 5 sessions
      
      for (const sessionFile of recentSessions) {
        const sessionPath = join(sessionsDir, sessionFile);
        const content = await readFile(sessionPath, "utf-8");
        const lines = content.trim().split('\n').slice(-50); // Check last 50 lines
        
        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            if (entry.content && typeof entry.content === 'string') {
              if (entry.content.includes('coding-agent') || 
                  entry.content.includes('codex') || 
                  entry.content.includes('Claude Code')) {
                return NextResponse.json({
                  isActive: true,
                  method: "session-history",
                  details: {
                    foundIn: sessionFile,
                    indication: "coding-agent skill or codex reference found"
                  }
                });
              }
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (e) {
      // Session check failed, continue
    }
    
    return NextResponse.json({
      isActive: false,
      method: "none",
      details: null
    });
  } catch (error) {
    console.error("Failed to check Claude Code status:", error);
    return NextResponse.json(
      { error: "Failed to check Claude Code status" },
      { status: 500 }
    );
  }
}
