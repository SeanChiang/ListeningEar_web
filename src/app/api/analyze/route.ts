import { NextResponse } from 'next/server';
import { analyzeTriage } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mainComplaint, observation, understanding } = body;

    if (!mainComplaint || !understanding) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await analyzeTriage(mainComplaint, observation, understanding);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze API Error:", error);
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    );
  }
}
