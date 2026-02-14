import { NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

interface ContextFile {
  name: string;
  path: string;
  type: "core" | "memory";
  size: number;
  modified: number;
}

export async function GET() {
  try {
    const clawdPath = join(process.env.HOME || "/Users/lyra", "clawd");
    
    // Core context files
    const coreFiles = [
      "SOUL.md",
      "USER.md",
      "IDENTITY.md",
      "MEMORY.md",
      "HEARTBEAT.md",
      "AGENTS.md",
      "TOOLS.md",
      "MODEL_ALLOCATION.md"
    ];

    const files: ContextFile[] = [];

    // Read core files
    for (const filename of coreFiles) {
      try {
        const filePath = join(clawdPath, filename);
        const stats = await stat(filePath);
        files.push({
          name: filename,
          path: filePath,
          type: "core",
          size: stats.size,
          modified: stats.mtimeMs,
        });
      } catch (error) {
        // File doesn't exist, skip it
      }
    }

    // Read memory directory
    try {
      const memoryPath = join(clawdPath, "memory");
      const memoryEntries = await readdir(memoryPath, { withFileTypes: true });
      
      for (const entry of memoryEntries) {
        if (entry.isFile() && entry.name.endsWith(".md")) {
          const filePath = join(memoryPath, entry.name);
          const stats = await stat(filePath);
          files.push({
            name: `memory/${entry.name}`,
            path: filePath,
            type: "memory",
            size: stats.size,
            modified: stats.mtimeMs,
          });
        }
      }
    } catch (error) {
      // Memory directory doesn't exist or can't be read
    }

    // Sort by modified date (newest first)
    files.sort((a, b) => b.modified - a.modified);

    return NextResponse.json({ files, count: files.length });
  } catch (error) {
    console.error("Error reading context files:", error);
    return NextResponse.json(
      { error: "Failed to read context files" },
      { status: 500 }
    );
  }
}
