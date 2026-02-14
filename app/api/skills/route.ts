import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  dependencies?: string[];
  status: "installed" | "missing" | "error";
  content?: string;
  lastModified?: string;
}

export async function GET() {
  try {
    const skillsPath = join(process.env.HOME || "/Users/lyra", "clawd", "skills");
    const entries = await readdir(skillsPath, { withFileTypes: true });
    
    const skills: Skill[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const skillPath = join(skillsPath, entry.name);
      const skillMdPath = join(skillPath, "SKILL.md");
      
      try {
        const content = await readFile(skillMdPath, "utf-8");
        const stats = await stat(skillMdPath);
        
        // Parse SKILL.md for metadata
        const nameMatch = content.match(/^#\s+(.+)$/m);
        const descMatch = content.match(/^>\s+(.+)$/m);
        
        // Extract dependencies from content
        const depsSection = content.match(/##\s+Dependencies\s+([\s\S]*?)(?=\n##|\n---|\Z)/i);
        const dependencies: string[] = [];
        if (depsSection) {
          const depLines = depsSection[1].match(/[-*]\s+`([^`]+)`/g);
          if (depLines) {
            dependencies.push(...depLines.map(line => {
              const match = line.match(/`([^`]+)`/);
              return match ? match[1] : '';
            }).filter(Boolean));
          }
        }

        skills.push({
          id: entry.name,
          name: nameMatch ? nameMatch[1] : entry.name,
          description: descMatch ? descMatch[1] : "No description available",
          path: skillPath,
          dependencies,
          status: "installed",
          content,
          lastModified: stats.mtime.toISOString()
        });
      } catch (error) {
        skills.push({
          id: entry.name,
          name: entry.name,
          description: "Error reading SKILL.md",
          path: skillPath,
          status: "error"
        });
      }
    }

    return NextResponse.json({ skills, count: skills.length });
  } catch (error) {
    console.error("Error reading skills:", error);
    return NextResponse.json(
      { error: "Failed to read skills directory" },
      { status: 500 }
    );
  }
}
