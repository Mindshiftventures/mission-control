import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { problemComments, problemActivity } from "@/lib/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    
    const { author, content, source, telegramMessageId } = body;
    
    if (!author || !content) {
      return NextResponse.json(
        { error: "Author and content are required" },
        { status: 400 }
      );
    }
    
    const [comment] = await db.insert(problemComments).values({
      problemId: id,
      author,
      content,
      source: source || "ui",
      telegramMessageId,
    }).returning();
    
    await db.insert(problemActivity).values({
      problemId: id,
      action: "commented",
      newValue: `${author} added a comment`,
    });
    
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
