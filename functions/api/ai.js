/**
 * ═══════════════════════════════════════════════════════════════════
 * CLOUDFLARE PAGES FUNCTION: /api/ai
 * PrimeArtifact — Secure AI Bridge
 * ═══════════════════════════════════════════════════════════════════
 * 
 * This function securely routes chat messages to their REAL AI providers.
 * Every model listed in the UI is genuinely served by its original creator.
 * 
 * ─── SETUP STEPS ───────────────────────────────────────────────────
 * 
 * 1. Go to https://aistudio.google.com/apikey → Create API Key
 *    Save it as: GEMINI_API_KEY
 * 
 * 2. Go to https://console.groq.com/keys → Create API Key
 *    Save it as: GROQ_API_KEY
 *    (Groq hosts Meta Llama & Mistral models for free — these ARE
 *     the real models from Meta and Mistral, just run on Groq's
 *     ultra-fast LPU hardware.)
 * 
 * 3. Go to https://platform.deepseek.com/api_keys → Create API Key
 *    Save it as: DEEPSEEK_API_KEY
 *    (New accounts get 5 million free tokens — no credit card needed.)
 * 
 * 4. In Cloudflare Dashboard:
 *    Workers & Pages → [Your Project] → Settings → Environment Variables
 *    Add all three keys above (mark them as "Encrypted").
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

    // ─── ROUTING: Each model goes to its REAL provider ─────────
    switch (model) {

      // ✅ Google Gemini → Google's own API (direct)
      case 'google_gemini':
        return await callGemini(messages, env.GEMINI_API_KEY, corsHeaders);

      // ✅ Meta Llama 4 → Real Meta model, hosted on Groq
      case 'meta_llama':
        return await callGroq(messages, 'meta-llama/llama-4-scout-17b-16e-instruct', env.GROQ_API_KEY, corsHeaders);

      // ✅ Mistral AI → Real Mistral model, hosted on Groq
      case 'mistral_ai':
        return await callGroq(messages, 'mistral-saba-24b', env.GROQ_API_KEY, corsHeaders);

      // ✅ DeepSeek → DeepSeek's own API (direct)
      case 'deepseek':
        return await callDeepSeek(messages, env.DEEPSEEK_API_KEY, corsHeaders);

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
 * ─── GOOGLE GEMINI ─────────────────────────────────────────────────
 * Direct call to Google's Generative Language API.
 * Free tier: 60 requests per minute.
 * Docs: https://ai.google.dev/docs
 */
async function callGemini(messages, apiKey, headers) {
  if (!apiKey) {
    return new Response(JSON.stringify({
      content: '⚠️ GEMINI_API_KEY is not configured. Add it in Cloudflare Dashboard → Settings → Environment Variables.'
    }), { status: 200, headers });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Gemini uses "user" and "model" roles (not "assistant")
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || `⚠️ Error from Google Gemini: ${data.error?.message || JSON.stringify(data)}`;

  return new Response(JSON.stringify({ content: text }), { headers });
}


/**
 * ─── GROQ (Hosts Meta Llama & Mistral) ─────────────────────────────
 * Groq is an INFERENCE PROVIDER, not a model creator.
 * They host the REAL open-source models from Meta and Mistral
 * on their custom LPU chips for extremely fast responses.
 * 
 * Free tier: Very generous (thousands of requests/day).
 * Docs: https://console.groq.com/docs/quickstart
 */
async function callGroq(messages, modelId, apiKey, headers) {
  if (!apiKey) {
    return new Response(JSON.stringify({
      content: '⚠️ GROQ_API_KEY is not configured. Add it in Cloudflare Dashboard → Settings → Environment Variables.'
    }), { status: 200, headers });
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  // Groq uses the standard OpenAI-compatible format
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


/**
 * ─── DEEPSEEK ──────────────────────────────────────────────────────
 * Direct call to DeepSeek's own API.
 * Uses OpenAI-compatible format.
 * Free tier: 5 million tokens on signup (no credit card).
 * Docs: https://platform.deepseek.com/api-docs
 */
async function callDeepSeek(messages, apiKey, headers) {
  if (!apiKey) {
    return new Response(JSON.stringify({
      content: '⚠️ DEEPSEEK_API_KEY is not configured. Add it in Cloudflare Dashboard → Settings → Environment Variables.'
    }), { status: 200, headers });
  }

  const url = 'https://api.deepseek.com/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages
    })
  });

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || `⚠️ Error from DeepSeek: ${data.error?.message || JSON.stringify(data)}`;

  return new Response(JSON.stringify({ content: text }), { headers });
}
