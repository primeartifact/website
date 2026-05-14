/**
 * ═══════════════════════════════════════════════════════════════════
 * CLOUDFLARE PAGES FUNCTION: /api/yt-captions
 * PrimeArtifact — YouTube Captions Scraper
 * ═══════════════════════════════════════════════════════════════════
 */

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const videoUrl = url.searchParams.get('url');

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (!videoUrl) {
    return new Response(JSON.stringify({ error: 'Missing YouTube URL' }), { status: 400, headers: corsHeaders });
  }

  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), { status: 400, headers: corsHeaders });
  }

  // ─────────────────────────────────────────────────────────────────
  // 100% FREE PROXY FALLBACK CHAIN
  // ─────────────────────────────────────────────────────────────────
  // Since YouTube blocks Cloudflare, we rotate through public CORS proxies
  // until one of them successfully fetches the data.
  const fetchWithProxies = async (targetUrl) => {
    const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`
    ];

    let lastErrorStatus = null;

    // Try direct fetch first just in case
    try {
        const directRes = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        if (directRes.ok) return directRes;
        lastErrorStatus = directRes.status;
    } catch (e) {
        lastErrorStatus = 'Network Error';
    }

    // Try Proxies
    for (const proxy of proxies) {
        try {
            console.warn(`Attempting proxy: ${proxy}`);
            const res = await fetch(proxy);
            if (res.ok) return res;
            lastErrorStatus = res.status;
        } catch (e) {
            lastErrorStatus = 'Proxy Network Error';
        }
    }
    
    throw new Error(`All extraction methods failed. (Last Status: ${lastErrorStatus})`);
  };

  try {
    const ytResponse = await fetchWithProxies(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await ytResponse.text();

    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+meta|<\/script|\n)/);
    if (!playerResponseMatch) {
       return new Response(JSON.stringify({ error: 'Could not extract player response. Captions might be disabled or video is private.' }), { status: 404, headers: corsHeaders });
    }

    let playerResponse;
    try {
        playerResponse = JSON.parse(playerResponseMatch[1]);
    } catch(e) {
        return new Response(JSON.stringify({ error: 'Failed to parse player response JSON' }), { status: 500, headers: corsHeaders });
    }

    const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
       return new Response(JSON.stringify({ error: 'No captions found for this video.' }), { status: 404, headers: corsHeaders });
    }

    const trackUrl = captionTracks[0].baseUrl;
    const xmlResponse = await fetchWithProxies(trackUrl);
    const xmlText = await xmlResponse.text();

    const textMatches = [...xmlText.matchAll(/<text[^>]*>([^<]+)<\/text>/g)];
    
    const decodeHTMLEntities = (text) => {
        return text.replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#39;/g, "'");
    };

    const transcriptText = textMatches.map(m => decodeHTMLEntities(m[1])).join(' ');

    return new Response(JSON.stringify({ text: transcriptText }), {
        status: 200,
        headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}

/**
 * Replicates the Python extract_video_id logic
 */
function extractVideoId(urlStr) {
  try {
    const url = new URL(urlStr);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1).split('?')[0]; 
    }
    return url.searchParams.get('v');
  } catch (e) {
    // Robust regex fallback
    const match = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\n]+)/);
    return match ? match[1] : null;
  }
}
