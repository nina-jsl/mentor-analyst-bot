// app/api/mentor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

type MentorMode =
  | "communication_coach"
  | "pm_simulator"
  | "workflow_helper"
  | "safe_qa";

interface MentorRequestBody {
  mode: MentorMode;
  userInput: string;
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      // This will show up both in response and in your terminal
      console.error("Missing GROQ_API_KEY env var");
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set. Check your .env.local file." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as MentorRequestBody;
    const { mode, userInput } = body;

    if (!mode || !userInput) {
      return NextResponse.json(
        { error: "Missing 'mode' or 'userInput' in request body" },
        { status: 400 }
      );
    }

    const basePersona = `
You are a senior research analyst at a global asset management firm.
You mentor junior analysts who have just transitioned from university.
You focus on:
- clear, concise communication for portfolio managers,
- structured thinking (thesis, catalysts, risks, what changes the view),
- practical advice on workflow and professional behavior.
Always answer in a friendly, professional tone and prefer bullet points when helpful.
    `.trim();

    let modeInstructions = "";
    let userPrompt = "";

    switch (mode) {
      case "communication_coach":
        modeInstructions = `
You are acting as a communication coach.
The user will paste drafts of emails, meeting notes, or IC memos.
Your tasks:
1) Briefly point out what is clear vs. unclear.
2) Rewrite the draft in a more concise, PM-friendly style.
3) Give 2–3 concrete tips they can remember for next time.
        `.trim();

        userPrompt = `
Here is the draft. Please review and improve:

"""${userInput}"""
        `.trim();
        break;

      case "pm_simulator":
        modeInstructions = `
Act as a portfolio manager challenging a junior analyst's thesis.
Your tasks:
1) Ask 3–5 tough but fair questions about their idea.
2) Focus on portfolio relevance, risk, catalysts, and "what would change your mind".
3) Do NOT rewrite their thesis; only challenge it.
        `.trim();

        userPrompt = `
Here is my investment thesis. Challenge me like a PM:

"""${userInput}"""
        `.trim();
        break;

      case "workflow_helper":
        modeInstructions = `
You help junior analysts prioritize tasks and structure their workday.
Your tasks:
1) Sort tasks by urgency and importance.
2) Propose a simple schedule for today.
3) Suggest what they should communicate to their PM (e.g. delays, trade-offs).
        `.trim();

        userPrompt = `
These are my tasks and deadlines. Help me prioritize and plan today:

"""${userInput}"""
        `.trim();
        break;

      case "safe_qa":
      default:
        modeInstructions = `
You answer questions about asset management culture, expectations, and soft skills.
You explain concepts in simple, concrete language and give examples when helpful.
Avoid giving specific buy/sell recommendations on individual securities.
        `.trim();

        userPrompt = userInput;
        break;
    }

    const fullPrompt = `
SYSTEM:
${basePersona}

MODE:
${modeInstructions}

USER:
${userPrompt}
    `.trim();

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: fullPrompt,
      temperature: 0.4,
      maxOutputTokens: 800,
    });

    return NextResponse.json({ answer: text });
  } catch (err: unknown) {
    console.error("Error in /api/mentor:", err);

    let message = "Unexpected server error";
    if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
