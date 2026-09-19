import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10);

const SYSTEM_PROMPT_TEMPLATE = `
You are SCHEMORA Assistant.

You are answering questions about the CURRENT SCHEME supplied in the context.

Use the supplied scheme data, eligibility result, user profile, and verified source information.

Prefer specific information from the current scheme context over generic knowledge.

Never invent missing government facts.

When information is available in the supplied context, answer directly and clearly.

When information is genuinely absent, explicitly say that SCHEMORA does not currently have verified information about that specific point.

Do not confuse missing data with scheme ineligibility.

Do not call an answer 'verified' unless the supplied source actually verifies it.

Never override deterministic eligibility results.

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
Purpose: ${schemeContext.scheme.purpose || 'N/A'}
Who It Is For: ${schemeContext.scheme.whoItIsFor || 'N/A'}
Description: ${schemeContext.scheme.description || 'N/A'}
Sectors: ${schemeContext.scheme.sectors?.join(', ') || 'N/A'}
Funding Band: ${schemeContext.scheme.minFundingAmount ? '₹' + schemeContext.scheme.minFundingAmount : 'N/A'} - ${schemeContext.scheme.maxFundingAmount ? '₹' + schemeContext.scheme.maxFundingAmount : 'N/A'}
Interest Rate: ${schemeContext.scheme.interestRateMin ? schemeContext.scheme.interestRateMin + '%' : 'N/A'} to ${schemeContext.scheme.interestRateMax ? schemeContext.scheme.interestRateMax + '%' : 'N/A'}
Tenure/Moratorium: Up to ${schemeContext.scheme.repaymentTenureYears || 'N/A'} years (Moratorium: ${schemeContext.scheme.moratoriumMonths || 'N/A'} months)
Collateral: ${schemeContext.scheme.collateralRequired === false ? 'No collateral required' : (schemeContext.scheme.collateralDetails || 'N/A')}
Application Channel: ${schemeContext.scheme.applicationChannel || 'N/A'}
Application Steps: ${schemeContext.scheme.applicationSteps?.join(' -> ') || 'N/A'}
Official Portal URL: ${schemeContext.scheme.officialPortalUrl || 'N/A'}
Documents: ${schemeContext.scheme.requiredDocuments?.length ? schemeContext.scheme.requiredDocuments.join(', ') : 'N/A'}
Channel Partners: ${schemeContext.scheme.channelPartners?.length ? schemeContext.scheme.channelPartners.map((p: any) => p.name).join(', ') : 'N/A'}

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
Project Cost: ${profileContext?.projectCost ? '₹' + profileContext?.projectCost : 'N/A'}
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
