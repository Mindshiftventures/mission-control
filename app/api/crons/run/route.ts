import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { NextRequest } from "next/server";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cronId } = body;

    if (!cronId) {
      return NextResponse.json(
        { error: "Cron ID is required" },
        { status: 400 }
      );
    }

    // Run the cron job
    const { stdout, stderr } = await execAsync(`openclaw cron run ${cronId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Cron job triggered successfully",
      output: stdout,
      error: stderr
    });
  } catch (error: any) {
    console.error("Error running cron:", error);
    return NextResponse.json(
      { 
        error: "Failed to run cron job",
        details: error.message
      },
      { status: 500 }
    );
  }
}
