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

  try {
    let ytResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });
    
    // If YouTube blocks Cloudflare's datacenter IP (e.g., 403 Forbidden or 429), use a proxy fallback
    if (!ytResponse.ok) {
        console.warn(`Direct fetch failed (${ytResponse.status}). Attempting proxy fallback...`);
        ytResponse = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}`);
        
        if (!ytResponse.ok) {
            return new Response(JSON.stringify({ error: `Failed to fetch YouTube page even with proxy. Status: ${ytResponse.status}` }), { status: 500, headers: corsHeaders });
        }
    }

    const html = await ytResponse.text();

    // 2. Extract ytInitialPlayerResponse
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

    // 3. Find the captions track URL
    const captionTracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!captionTracks || captionTracks.length === 0) {
       return new Response(JSON.stringify({ error: 'No captions found for this video.' }), { status: 404, headers: corsHeaders });
    }

    // Default to the first track (usually auto-generated or the default language)
    const trackUrl = captionTracks[0].baseUrl;

    // 4. Fetch the XML transcript
    let xmlResponse = await fetch(trackUrl);
    if (!xmlResponse.ok) {
        console.warn(`Direct XML fetch failed (${xmlResponse.status}). Attempting proxy fallback...`);
        xmlResponse = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(trackUrl)}`);
        if (!xmlResponse.ok) {
            return new Response(JSON.stringify({ error: `Failed to fetch transcript XML. Status: ${xmlResponse.status}` }), { status: 500, headers: corsHeaders });
        }
    }
    
    const xmlText = await xmlResponse.text();

    // 5. Parse the XML to get just the text
    // Format: <?xml version="1.0" encoding="utf-8" ?><transcript><text start="1.48" dur="4.2">Hello</text></transcript>
    const textMatches = [...xmlText.matchAll(/<text[^>]*>([^<]+)<\/text>/g)];
    
    // Helper to decode basic HTML entities in the captions
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
