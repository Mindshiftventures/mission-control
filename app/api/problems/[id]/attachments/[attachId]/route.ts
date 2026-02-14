import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { problemAttachments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attachId: string }> }
) {
  try {
    const db = getDb();
    const { attachId } = await params;
    
    await db.delete(problemAttachments).where(eq(problemAttachments.id, attachId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}
