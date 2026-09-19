import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10);

const SYSTEM_PROMPT_TEMPLATE = `
You are SCHEMORA Assistant.

You are answering questions about the CURRENT SCHEME supplied in the context.

HYBRID ANSWERING MODEL:
1. VERIFIED SCHEMORA KNOWLEDGE: When the user asks about a specific scheme fact (eligibility, benefits, subsidy, documents, application process) that exists in the supplied context, answer directly and clearly using that verified information.
2. GENERAL AI KNOWLEDGE: When the user asks a general conceptual question (e.g., "What is a margin money subsidy?", "What is a DPR?", "How do government loans work?"), use your general AI knowledge to provide a natural, useful explanation. Do NOT say "I don't have verified information" for general concepts.
3. MIXED QUESTIONS (Missing Specifics): If the user asks for a scheme-specific fact that is NOT in the context (e.g., "How do I apply for this exact scheme?" when application steps are missing), DO NOT invent the specific fact. Instead, state that SCHEMORA currently lacks the verified specific information, BUT provide useful general guidance (e.g., "SCHEMORA doesn't currently have a verified application procedure for [Scheme]. General guidance: government-backed business schemes commonly involve confirming eligibility, preparing documents, and submitting via the designated portal. Please verify the exact process with the official authority.").

SAFETY & ANTI-HALLUCINATION:
- NEVER fabricate or guess government facts: subsidy percentages, max/min loan amounts, interest rates, eligibility requirements, age limits, required documents, official URLs, deadlines, or scheme-specific procedures.
- NEVER override the deterministic eligibility results provided in the context. If the engine says "Not Eligible", explain the actual failed criteria.

ANSWER STYLE:
- Be conversational, concise, and helpful for first-time entrepreneurs.
- Do not be robotic. Avoid repeatedly saying "I don't have verified information" unless verification is genuinely necessary.
- According to the scheme information available in SCHEMORA... (use this natural phrasing).

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

    // Map language codes to full names for clearer AI instruction
    const LANG_NAMES: Record<string, string> = {
      'en': 'English', 'hi': 'Hindi', 'bn': 'Bengali', 'te': 'Telugu', 'mr': 'Marathi',
      'ta': 'Tamil', 'gu': 'Gujarati', 'pa': 'Punjabi', 'kn': 'Kannada', 'ml': 'Malayalam',
      'or': 'Odia', 'ur': 'Urdu', 'as': 'Assamese', 'bho': 'Bhojpuri', 'ne': 'Nepali',
    };
    const langName = language ? (LANG_NAMES[language] || language) : null;

    let effectivePrompt = SYSTEM_PROMPT_TEMPLATE;
    if (langName && langName !== 'English') {
      effectivePrompt += `\n\nCRITICAL LANGUAGE INSTRUCTION: The user's selected language is ${langName}. You MUST respond entirely in ${langName}. Write your full response in ${langName} script. Preserve official scheme names (PMEGP, MUDRA, CGTMSE etc.), ₹ amounts, percentages, and URLs in their original form. Understand questions written in ${langName} naturally.`;
    }

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
