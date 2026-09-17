import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { query, profileContext, schemeContext } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // In a fully deployed production app, this would use a real LLM (e.g., via GEMINI_API_KEY)
    // For this SIH demo, we implement a robust contextual rule-based simulation 
    // that respects the user's explicit instructions: "never claim to be an official government authority"
    // and "grounded in the actual computed eligibility".

    const lowerQ = query.toLowerCase();
    let reply = '';

    // Safety constraint explicitly requested by user
    if (lowerQ.includes('are you government') || lowerQ.includes('official') || lowerQ.includes('authority')) {
      reply = "I am SCHEMORA AI, an intelligent decision support assistant built for this assessment. I am not an official government authority. All final decisions regarding loan sanctions and subsidies are made by the respective bank branch and government department after manual verification of your physical documents.";
    } 
    else if (lowerQ.includes('why') && lowerQ.includes('recommend')) {
      reply = `I recommended ${schemeContext.scheme.name} with a ${schemeContext.matchScore}% score because your profile as a ${profileContext.category.toUpperCase()} entrepreneur starting a ${profileContext.industry.replace('_', ' ')} venture in a ${profileContext.areaType} area directly meets the statutory criteria. Your funding request of ₹${profileContext.requiredFunding.toLocaleString('en-IN')} also fits within the scheme's allowable band.`;
    } 
    else if (lowerQ.includes('subsidy') || lowerQ.includes('margin') || lowerQ.includes('free money')) {
      if (schemeContext.eligibility.calculatedSubsidyPercent) {
        reply = `Based on your ${profileContext.category.toUpperCase()} category status in a ${profileContext.areaType} area, you are eligible for a ${schemeContext.eligibility.calculatedSubsidyPercent}% margin money subsidy. On your project cost of ₹${profileContext.projectCost.toLocaleString('en-IN')}, this means approximately ₹${schemeContext.eligibility.calculatedSubsidyAmount.toLocaleString('en-IN')} provided as a back-ended subsidy (which doesn't need to be repaid if terms are met).`;
      } else {
        reply = `This specific scheme focuses on providing accessible credit rather than direct capital subsidy. It offers a concessional interest rate and collateral-free guarantee (meaning you don't need to pledge personal property).`;
      }
    } 
    else if (lowerQ.includes('document') || lowerQ.includes('need to apply')) {
      reply = `You must prepare your Detailed Project Report (DPR). Also ensure you have your ${profileContext.category.toUpperCase()} category certificate, Aadhaar, PAN, and quotations for the machinery. You can download the full personalized checklist from the dashboard above.`;
    } 
    else if (lowerQ.includes('next') || lowerQ.includes('what should i do')) {
      reply = `Your next step is to approach your local ${schemeContext.scheme.channelPartners[0]?.name || 'District Industries Centre'}. Make sure you have your DPR and documents ready. Let me know if you need help understanding the EMI or project report requirements.`;
    }
    else {
      reply = `I have analyzed your profile against ${schemeContext.scheme.name}. Based on your specific details (${profileContext.city}, ₹${profileContext.projectCost.toLocaleString('en-IN')} project), you meet the primary criteria. Let me know if you have questions about the documents, interest rates, or subsidies!`;
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
