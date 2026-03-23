export async function onRequestPost(context) {
  try {
    const { contentType, prompt } = await context.request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ success: false, error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`Generating preview for ${contentType}: "${prompt}"`);

    // In a real app, you'd call Gemini API here.
    // Cloudflare Workers use fetch API.
    // For now, we return a mock response with a placeholder or simulated result.
    let previewUrl = '';
    
    if (contentType === 'image') {
      previewUrl = `https://via.placeholder.com/800x600/667eea/ffffff?text=AI+Generated+Image+for:+${encodeURIComponent(prompt.substring(0, 20))}...`;
    } else if (contentType === 'video') {
      previewUrl = 'video-placeholder';
    } else {
      previewUrl = 'model-placeholder';
    }

    return new Response(JSON.stringify({
      success: true,
      contentType,
      prompt,
      previewUrl,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'AI generation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
