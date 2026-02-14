import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

const OPENCLAW_CONFIG = join(process.env.HOME || "/Users/lyra", ".openclaw", "openclaw.json");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await readFile(OPENCLAW_CONFIG, "utf-8");
    const config = JSON.parse(content);
    
    const agent = config.agents.list.find((a: any) => a.id === id);
    
    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      agent,
      configPath: OPENCLAW_CONFIG
    });
  } catch (error) {
    console.error("Failed to read agent config:", error);
    return NextResponse.json(
      { error: "Failed to read agent config" },
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
    const updates = await request.json();
    
    const content = await readFile(OPENCLAW_CONFIG, "utf-8");
    const config = JSON.parse(content);
    
    const agentIndex = config.agents.list.findIndex((a: any) => a.id === id);
    
    if (agentIndex === -1) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }
    
    // Merge updates with existing agent config
    config.agents.list[agentIndex] = {
      ...config.agents.list[agentIndex],
      ...updates
    };
    
    // Write back to file with formatting
    await writeFile(OPENCLAW_CONFIG, JSON.stringify(config, null, 2), "utf-8");
    
    return NextResponse.json({
      success: true,
      agent: config.agents.list[agentIndex]
    });
  } catch (error) {
    console.error("Failed to update agent config:", error);
    return NextResponse.json(
      { error: "Failed to update agent config" },
      { status: 500 }
    );
  }
}
