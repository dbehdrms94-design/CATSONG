export async function onRequestGet(context) {
  return new Response(JSON.stringify({ 
    status: 'Server is running', 
    mode: 'Cloudflare Pages' 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
