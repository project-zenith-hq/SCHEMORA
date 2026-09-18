import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { targetLanguage, source } = await req.json();

    if (!targetLanguage || !source) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    const baseUrl = process.env.GROQ_API_BASE_URL || 'https://api.groq.com/openai/v1';

    if (!apiKey) {
      return NextResponse.json({ error: 'API key missing' }, { status: 500 });
    }

    const prompt = `You are a professional localization expert. Translate the following JSON object's values into ${targetLanguage}. Maintain the exact same JSON structure and keys. Only translate the values. Do not translate official names like SCHEMORA or scheme names like PMEGP.

Source JSON:
${JSON.stringify(source)}

Respond ONLY with valid JSON. Do not include markdown code blocks or explanations.`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.statusText}`);
    }

    const data = await response.json();
    let translations;
    try {
      translations = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      translations = source; // fallback
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
