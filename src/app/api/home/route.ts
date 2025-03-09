import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export async function POST(req: Request) {
  try {
    const reader = req.body?.getReader();
    let rawData = "";

    if (reader) {
      const stream = new Readable({
        async read() {
          let done = false;
          while (!done) {
            const { value, done: isDone } = await reader.read();
            done = isDone;
            if (value) this.push(value);
          }
          this.push(null);
        },
      });

      for await (const chunk of stream) {
        rawData += chunk.toString();
      }
    }

    // Define log file path
    const logFilePath = path.join(process.cwd(), "responses.txt");

    // Prepare log entry with raw request data
    const logEntry = `[${new Date().toISOString()}] Received Data:\n${rawData}\n\n`;

    // Append log entry to the file
    fs.appendFileSync(logFilePath, logEntry, "utf8");

    // Redirect to the specified URL
    return NextResponse.redirect("http://139.84.169.221:3001/menu");
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
