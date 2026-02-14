import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { problems, problemComments, problemActivity } from "@/lib/db/schema";

// POST /api/problems/sync/telegram - Sync from Telegram
export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const body = await request.json();
    
    const { action, message, threadId, messageId } = body;
    
    // Detect if this is a new problem based on keywords
    const keywords = ["problem:", "issue:", "idea:", "project:", "todo:", "build:", "create:"];
    const hasKeyword = keywords.some(kw => message.toLowerCase().includes(kw));
    
    if (action === "create_problem" || hasKeyword) {
      // Extract title (first line or up to 100 chars)
      const title = message.split("\n")[0].substring(0, 100);
      
      // Infer tags from content
      const tags = [];
      if (message.toLowerCase().includes("urgent")) tags.push("urgent");
      if (message.toLowerCase().includes("bug")) tags.push("bug");
      if (message.toLowerCase().includes("feature")) tags.push("feature");
      
      const [problem] = await db.insert(problems).values({
        title,
        description: message,
        status: "backlog",
        owner: "birju",
        createdFromTelegram: true,
        telegramThreadId: threadId,
        tags,
      }).returning();
      
      await db.insert(problemActivity).values({
        problemId: problem.id,
        action: "created",
        newValue: "Created from Telegram",
      });
      
      return NextResponse.json({ problem, created: true });
    }
    
    if (action === "add_comment" && body.problemId) {
      // Add comment to existing problem
      const [comment] = await db.insert(problemComments).values({
        problemId: body.problemId,
        author: "birju",
        content: message,
        source: "telegram",
        telegramMessageId: messageId,
      }).returning();
      
      await db.insert(problemActivity).values({
        problemId: body.problemId,
        action: "commented",
        newValue: "Comment added from Telegram",
      });
      
      return NextResponse.json({ comment, added: true });
    }
    
    return NextResponse.json({ message: "No action taken" });
  } catch (error) {
    console.error("Error syncing from Telegram:", error);
    return NextResponse.json(
      { error: "Failed to sync from Telegram" },
      { status: 500 }
    );
  }
}
