import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { problems, problemComments, problemAttachments, problemActivity } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    
    const [problem] = await db.select().from(problems).where(eq(problems.id, id));
    
    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }
    
    const comments = await db.select()
      .from(problemComments)
      .where(eq(problemComments.problemId, id))
      .orderBy(desc(problemComments.createdAt));
    
    const attachments = await db.select()
      .from(problemAttachments)
      .where(eq(problemAttachments.problemId, id))
      .orderBy(desc(problemAttachments.createdAt));
    
    const activity = await db.select()
      .from(problemActivity)
      .where(eq(problemActivity.problemId, id))
      .orderBy(desc(problemActivity.timestamp));
    
    return NextResponse.json({
      ...problem,
      comments,
      attachments,
      activity,
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await request.json();
    
    const [existingProblem] = await db.select().from(problems).where(eq(problems.id, id));
    
    if (!existingProblem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }
    
    const updates: any = { updatedAt: new Date() };
    
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;
    if (body.owner !== undefined) updates.owner = body.owner;
    if (body.assignee !== undefined) updates.assignee = body.assignee;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.tags !== undefined) updates.tags = body.tags;
    if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.blockedReason !== undefined) updates.blockedReason = body.blockedReason;
    
    const [updatedProblem] = await db.update(problems)
      .set(updates)
      .where(eq(problems.id, id))
      .returning();
    
    if (body.status && body.status !== existingProblem.status) {
      await db.insert(problemActivity).values({
        problemId: id,
        action: "status_changed",
        oldValue: existingProblem.status,
        newValue: body.status,
      });
    }
    
    if (body.assignee && body.assignee !== existingProblem.assignee) {
      await db.insert(problemActivity).values({
        problemId: id,
        action: "assigned",
        oldValue: existingProblem.assignee || "unassigned",
        newValue: body.assignee,
      });
    }
    
    return NextResponse.json(updatedProblem);
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = getDb();
    const { id } = await params;
    
    await db.delete(problems).where(eq(problems.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 }
    );
  }
}
