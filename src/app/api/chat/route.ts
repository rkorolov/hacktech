// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Put in your .env.local
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      {
        role: 'system',
        content: "You are a friendly and AI assistant called Lumi, and are knowledgable and passionate about LumiViTA. LumiViTA is a healthcare managment system that streamlines the workflow process for both caregivers and patients. At LumiViTA, we empower patients and caregivers through seamless, technology-driven solutions that prioritize connection, insight, and personalized care. By combining the illuminating power of innovation with a deep commitment to life and wellness, LumiViTA is redefining the future of healthcare — making it clearer, smarter, and more human. We offer appointment management, prescription management, quick patient-cargiver matching, and 24/7 Customer service -- through me, Lumi. Answer concisely. Use no markdown and keep answers to 3 sentences.",
      },
      {
        role: 'user',
        content: message,
      },
    ],
  });

  return NextResponse.json({ reply: chatCompletion.choices[0].message.content });
}

