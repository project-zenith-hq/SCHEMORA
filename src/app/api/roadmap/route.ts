import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10);

const SYSTEM_PROMPT = `
You are the SCHEMORA Eligibility Advisor. The user is attempting to apply for a specific Indian government scheme but they are currently "Not Eligible" because they fail certain rules.

Your task is to provide a short, ordered, step-by-step action plan on HOW to fix these gaps.
1. Be realistic and base your advice on real Indian government processes (e.g., Udyam registration, income certificates).
2. If a gap CANNOT be fixed realistically (e.g., age, gender, location requirements, or past defaults), say that honestly instead of inventing a workaround.
3. Keep it brief and easy to understand for someone with no experience with paperwork or banks. No jargon.
4. If closing these gaps makes them eligible for other schemes generally, mention it briefly as a bonus to encourage them.

MULTILINGUAL INSTRUCTION:
Always respond in the same language the user requests, including regional Indian languages. If the request is not in English, provide the same high-quality step-by-step guidance translated into the requested language natively.
`;

export async function POST(req: Request) {
  try {
    // 1. IP Tracking & Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }
    
    const timestamps = rateLimitMap.get(ip)!;
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    
    const recentRequests = timestamps.filter(ts => ts > windowStart);
    
    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before sending more requests.' },
        { status: 429 }
      );
    }
    
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);

    // 2. Input Validation
    const body = await req.json();
    const { schemeName, failedRules, profile, language } = body;

    if (!schemeName || !failedRules || !Array.isArray(failedRules)) {
      return NextResponse.json({ error: 'Invalid request format. schemeName and failedRules are required.' }, { status: 400 });
    }

    let effectivePrompt = language && language !== 'en'
      ? `${SYSTEM_PROMPT}\n\nThe user's preferred UI language is ${language}. Please prioritize responding in this language fluently and naturally.`
      : SYSTEM_PROMPT;

    // 3. Groq API Call (OpenAI-compatible)
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const baseUrl = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';

    if (apiKey && apiKey !== 'your-key-here') {
      const prompt = `Scheme: ${schemeName}
User Profile Summary: 
- Industry: ${profile?.industry}
- Stage: ${profile?.businessStage}
- Category: ${profile?.category}
- Required Funding: ₹${profile?.requiredFunding}
- Project Cost: ₹${profile?.projectCost}

The user failed these specific rules for the scheme:
${failedRules.map((r: string) => `- ${r}`).join('\n')}

Generate the step-by-step action plan to become eligible, or explain why it cannot be fixed.`;

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: effectivePrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 400
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Error from AI provider');

      return NextResponse.json({ 
        roadmap: data.choices[0].message.content 
      });
    }

    // Fallback if no valid API key
    return NextResponse.json({ 
      roadmap: "To become eligible, you will need to meet the criteria listed above. Since the AI service is currently unavailable, we recommend reviewing the official guidelines for the scheme."
    });

  } catch (error: any) {
    console.error('Roadmap API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the roadmap.' },
      { status: 500 }
    );
  }
}
