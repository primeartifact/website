/**
 * ═══════════════════════════════════════════════════════════════════
 * CLOUDFLARE PAGES FUNCTION: /api/ai
 * PrimeArtifact — Secure AI Bridge (Groq Only)
 * ═══════════════════════════════════════════════════════════════════
 * 
 * This function securely routes chat messages using Groq's high-speed
 * inference servers. This ensures 100% free usage via a single key.
 * 
 * ─── SETUP STEPS ───────────────────────────────────────────────────
 * 
 * 1. Go to https://console.groq.com/keys → Create API Key
 *    Save it as: GROQ_API_KEY
 * 
 * 2. In Cloudflare Dashboard:
 *    Workers & Pages → [Your Project] → Settings → Environment Variables
 *    Add GROQ_API_KEY (mark as "Encrypted").
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // Add CORS headers for safety
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const { model, messages } = await request.json();

    // ─── ROUTING: All models use Groq ─────────
    switch (model) {

      // ✅ Meta Llama 4
      case 'llama_4':
        return await callGroq(messages, 'meta-llama/llama-4-scout-17b-16e-instruct', env.GROQ_API_KEY, corsHeaders);

      // ✅ Meta Llama 3.3 (70B)
      case 'llama_3_3':
        return await callGroq(messages, 'llama-3.3-70b-versatile', env.GROQ_API_KEY, corsHeaders);

      // ✅ Google Gemma 2 (9B)
      case 'gemma_2':
        return await callGroq(messages, 'gemma2-9b-it', env.GROQ_API_KEY, corsHeaders);

      default:
        return new Response(JSON.stringify({ error: 'Model not supported' }), {
          status: 400, headers: corsHeaders
        });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders
    });
  }
}

/**
 * ─── GROQ INFERENCE ────────────────────────────────────────────────
 * Groq uses custom LPU chips for extremely fast responses.
 * Docs: https://console.groq.com/docs/quickstart
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
