import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { problems, problemActivity } from "@/lib/db/schema";
import { eq, desc, and, or, inArray } from "drizzle-orm";

// GET /api/problems - List all problems with filters
export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get("status");
    const owner = searchParams.get("owner");
    const assignee = searchParams.get("assignee");
    const tags = searchParams.get("tags")?.split(",");
    
    let query = db.select().from(problems);
    
    const conditions = [];
    if (status) conditions.push(eq(problems.status, status));
    if (owner) conditions.push(eq(problems.owner, owner));
    if (assignee) conditions.push(eq(problems.assignee, assignee));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const results = await query.orderBy(desc(problems.createdAt));
    
    // Filter by tags if provided (array contains check)
    let filteredResults = results;
    if (tags && tags.length > 0) {
      filteredResults = results.filter(p => 
        p.tags && tags.some(tag => p.tags?.includes(tag))
      );
    }
    
    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

// POST /api/problems - Create new problem
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    
    const { title, description, owner, assignee, priority, tags, dueDate, createdFromTelegram, telegramThreadId } = body;
    
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    
    const [problem] = await db.insert(problems).values({
      title,
      description,
      owner,
      assignee,
      priority: priority || 0,
      tags: tags || [],
      dueDate: dueDate ? new Date(dueDate) : null,
      createdFromTelegram: createdFromTelegram || false,
      telegramThreadId,
      status: "backlog",
    }).returning();
    
    // Log activity
    await db.insert(problemActivity).values({
      problemId: problem.id,
      action: "created",
      newValue: `Problem created: ${title}`,
    });
    
    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}
