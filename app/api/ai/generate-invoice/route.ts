import { GoogleGenerativeAI } from "@google/generative-ai";
import { rateLimit } from "@/lib/rateLimit";
import { sanitizePrompt } from "@/lib/validate";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "local";
  if (!rateLimit(ip, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const rawPrompt = body.prompt;

    if (!rawPrompt || typeof rawPrompt !== "string")
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const prompt = sanitizePrompt(rawPrompt);
    if (prompt.length < 5)
      return NextResponse.json({ error: "Prompt too short" }, { status: 400 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(
      `You are an invoice line-item generator. A user described their work. Generate structured invoice items.

User description: "${prompt}"

Respond ONLY with valid JSON. No markdown, no explanation:
{
  "items": [
    { "description": "string", "quantity": number, "rate": number }
  ],
  "notes": "string"
}

Rules:
- Break into logical line items
- Infer reasonable hourly rates if not stated (dev: $50-100/hr)
- quantity = hours or units, rate = price per unit
- notes = short payment terms or thank you`
    );

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const data = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(data.items)) throw new Error("Invalid response structure");

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    const isQuota = message.includes("429") || message.includes("quota");
    return NextResponse.json(
      { error: isQuota ? "AI rate limit reached. Try again in a minute." : "AI generation failed" },
      { status: 500 }
    );
  }
}
