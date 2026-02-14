import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { problemAttachments } from "@/lib/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    
    const { type, url, title } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }
    
    const [attachment] = await db.insert(problemAttachments).values({
      problemId: id,
      type: type || "link",
      url,
      title,
    }).returning();
    
    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error adding attachment:", error);
    return NextResponse.json(
      { error: "Failed to add attachment" },
      { status: 500 }
    );
  }
}
