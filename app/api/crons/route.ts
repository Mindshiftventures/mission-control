import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: string;
  target: string;
  agent: string;
}

export async function GET() {
  try {
    const { stdout } = await execAsync("openclaw cron list");
    
    // Parse the table output
    const lines = stdout.trim().split('\n');
    if (lines.length < 2) {
      return NextResponse.json({ crons: [], count: 0 });
    }

    // Skip header line
    const cronLines = lines.slice(1);
    
    const crons: CronJob[] = cronLines.map(line => {
      // Parse fixed-width columns
      const parts = line.split(/\s{2,}/); // Split by 2+ spaces
      
      return {
        id: parts[0]?.trim() || '',
        name: parts[1]?.trim() || '',
        schedule: parts[2]?.trim() || '',
        nextRun: parts[3]?.trim() || '',
        lastRun: parts[4]?.trim() || '',
        status: parts[5]?.trim() || '',
        target: parts[6]?.trim() || '',
        agent: parts[7]?.trim() || '',
      };
    }).filter(cron => cron.id); // Filter out any empty entries

    return NextResponse.json({ crons, count: crons.length });
  } catch (error) {
    console.error("Error fetching crons:", error);
    return NextResponse.json(
      { error: "Failed to fetch cron jobs" },
      { status: 500 }
    );
  }
}
