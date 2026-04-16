export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    const { dbId, encryptedData } = body;
    
    if (!dbId || !encryptedData) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Hard limit on payload size (approx 100kb string)
    if (encryptedData.length > 150000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), { 
        status: 413,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Save to KV namespace (bound as 'CLIPBOARD' in Cloudflare Dashboard)
    // Automatically expires exactly 24 hours (86400 seconds) from now.
    await env.CLIPBOARD.put(dbId, encryptedData, { expirationTtl: 86400 });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const dbId = url.searchParams.get('id');

    if (!dbId) {
      return new Response(JSON.stringify({ error: "No Database ID provided" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const encryptedData = await env.CLIPBOARD.get(dbId);

    if (!encryptedData) {
      return new Response(JSON.stringify({ error: "Artifact not found, expired, or invalid sync code." }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true, encryptedData }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
