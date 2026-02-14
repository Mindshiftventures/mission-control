import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { problemComments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const db = getDb();
    const { commentId } = await params;
    const body = await request.json();
    
    const { content } = body;
    
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }
    
    const [updatedComment] = await db.update(problemComments)
      .set({ content })
      .where(eq(problemComments.id, commentId))
      .returning();
    
    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const db = getDb();
    const { commentId } = await params;
    
    await db.delete(problemComments).where(eq(problemComments.id, commentId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
