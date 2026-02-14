import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    // Security: Ensure the file is within clawd directory
    const clawdPath = process.env.HOME ? `${process.env.HOME}/clawd` : "/Users/lyra/clawd";
    if (!filePath.startsWith(clawdPath)) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content, path: filePath });
  } catch (error) {
    console.error("Error reading file:", error);
    return NextResponse.json(
      { error: "Failed to read file" },
      { status: 500 }
    );
  }
}
