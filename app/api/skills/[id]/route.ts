import { NextResponse } from "next/server";
import { readFile, writeFile, stat } from "fs/promises";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skillPath = join(process.env.HOME || "/Users/lyra", "clawd", "skills", id, "SKILL.md");
    
    const content = await readFile(skillPath, "utf-8");
    const stats = await stat(skillPath);
    
    return NextResponse.json({
      content,
      path: skillPath,
      lastModified: stats.mtime.toISOString()
    });
  } catch (error) {
    console.error("Failed to read skill:", error);
    return NextResponse.json(
      { error: "Failed to read skill" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: "Invalid content" },
        { status: 400 }
      );
    }
    
    const skillPath = join(process.env.HOME || "/Users/lyra", "clawd", "skills", id, "SKILL.md");
    
    await writeFile(skillPath, content, "utf-8");
    const stats = await stat(skillPath);
    
    return NextResponse.json({
      success: true,
      path: skillPath,
      lastModified: stats.mtime.toISOString()
    });
  } catch (error) {
    console.error("Failed to update skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}
