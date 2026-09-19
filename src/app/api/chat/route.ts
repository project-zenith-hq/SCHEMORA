import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10);

const SYSTEM_PROMPT_TEMPLATE = `
You are the SCHEMORA Assistant. Your role is strictly to help the user understand the CURRENT government scheme based ONLY on the provided verified context.

SOURCE-FIRST & ANTI-HALLUCINATION RULES:
1. NEVER invent government scheme names, eligibility requirements, funding limits, subsidy percentages, interest rates, documents, application URLs, banks/channel partners, approval probabilities, deadlines, or government procedures.
2. If the user asks about something NOT in the provided context, you MUST reply: "I don't have verified information about that in the current SCHEMORA scheme data." or "Please verify this with the official implementing agency/bank because SCHEMORA does not have enough verified information for that point."
3. DO NOT independently override the deterministic eligibility engine results provided in the context. The engine is the source of truth. You are here to explain it naturally.
4. Keep your answers confident, clear, concise, and in short paragraphs. Use a precise, premium tone.

MULTILINGUAL INSTRUCTION:
Always respond in the same language the user requests, including regional Indian languages. Match their language fluently and naturally. Do not translate the user's question unnecessarily.
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
        { error: 'Rate limit exceeded. Please wait a minute before sending more messages.' },
        { status: 429 }
      );
    }
    
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);

    // 2. Input Validation
    const body = await req.json();
    const { query, profileContext, schemeContext, language } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!schemeContext) {
      return NextResponse.json({ error: 'Scheme context is required' }, { status: 400 });
    }

    let effectivePrompt = language 
      ? `${SYSTEM_PROMPT_TEMPLATE}\n\nThe user's preferred UI language is ${language}. Please prioritize responding in this language fluently and naturally.`
      : SYSTEM_PROMPT_TEMPLATE;

    const contextData = `
CURRENT SCHEME CONTEXT:
Name: ${schemeContext.scheme.name}
Ministry: ${schemeContext.scheme.ministry || 'N/A'}
Tagline: ${schemeContext.scheme.tagline || 'N/A'}
Description: ${schemeContext.scheme.description || 'N/A'}
Max Funding: ${schemeContext.scheme.maxFundingAmount ? '₹' + schemeContext.scheme.maxFundingAmount : 'N/A'}
Interest Rate: ${schemeContext.scheme.interestRateMin ? schemeContext.scheme.interestRateMin + '%' : 'N/A'}
Documents: ${schemeContext.scheme.requiredDocuments?.length ? schemeContext.scheme.requiredDocuments.join(', ') : 'N/A'}

USER ELIGIBILITY CONTEXT:
Eligibility Status: ${schemeContext.eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
Match Score: ${schemeContext.matchScore}%
Matched Rules: ${schemeContext.eligibility.matchedRules.join('; ') || 'None'}
Failed Rules: ${schemeContext.eligibility.failedRules.join('; ') || 'None'}
Pending Checks: ${schemeContext.eligibility.pendingCheckRules.join('; ') || 'None'}
Subsidy Info: ${schemeContext.eligibility.calculatedSubsidyPercent ? schemeContext.eligibility.calculatedSubsidyPercent + '% subsidy' : 'N/A'}

USER PROFILE (if available):
Industry: ${profileContext?.industry || 'N/A'}
Category: ${profileContext?.category || 'N/A'}
Funding Needed: ${profileContext?.requiredFunding ? '₹' + profileContext?.requiredFunding : 'N/A'}
    `;

    // 3. Groq API Call (OpenAI-compatible)
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const baseUrl = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';

    if (apiKey && apiKey !== 'your-key-here') {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: effectivePrompt + '\n\n' + contextData },
            { role: 'user', content: query }
          ],
          temperature: 0.2, // Low temperature to reduce hallucination
          max_tokens: 500
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || 'Error from AI provider');

      return NextResponse.json({ 
        reply: data.choices[0].message.content 
      });
    }

    // Fallback if no valid API key (should not happen in prod with valid key)
    return NextResponse.json({ 
      reply: "The SCHEMORA AI service is currently unavailable. Please check official sources."
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the response.' },
      { status: 500 }
    );
  }
}
