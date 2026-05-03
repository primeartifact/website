/**
 * ═══════════════════════════════════════════════════════════════════
 * CLOUDFLARE PAGES FUNCTION: /api/ai
 * PrimeArtifact — Secure AI Bridge (Groq Only)
 * ═══════════════════════════════════════════════════════════════════
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const { messages } = await request.json();

    // ─── SYSTEM PROMPT ───────────────────────────────────────────────
    // This gives the AI its identity and context about PrimeArtifact.
    const systemPrompt = {
      role: 'system',
      content: `You are PrimeArtifact AI, an advanced, highly intelligent assistant embedded directly into the PrimeArtifact platform. 
PrimeArtifact is a premium platform featuring high-quality web artifacts and utilities. 
Current tools available on the website include:
- A Time Calculator (for advanced duration math)
- A Secure E2EE Clipboard (for encrypted text sharing)
- This AI Chat Assistant

Guidelines:
1. Always be helpful, professional, and concise.
2. If the user asks about you or your capabilities, mention that you are PrimeArtifact AI.
3. If the user asks about the website, recommend checking out the 'Artifacts' dropdown in the navigation bar to see the Time Calculator and Secure Clipboard.`
    };

    // Prepend system prompt to the chat history
    const fullMessages = [systemPrompt, ...messages];

    // Always use Llama 4 as the default PrimeArtifact AI model
    const defaultModel = 'meta-llama/llama-4-scout-17b-16e-instruct';

    return await callGroq(fullMessages, defaultModel, env.GROQ_API_KEY, corsHeaders);

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
}

/**
 * ─── GROQ INFERENCE ────────────────────────────────────────────────
 */
async function callGroq(messages, modelId, apiKey, headers) {
  if (!apiKey) {
    return new Response(JSON.stringify({
      content: '⚠️ GROQ_API_KEY is not configured. Add it in Cloudflare Dashboard → Settings → Environment Variables.'
    }), { status: 200, headers });
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || `⚠️ Error from Groq: ${data.error?.message || JSON.stringify(data)}`;

  return new Response(JSON.stringify({ content: text }), { headers });
}
