export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, contact, serviceType, message } = data;

    // Log the inquiry (Cloudflare Workers logs are available in the dashboard)
    console.log('--- New Creative Inquiry ---');
    console.log('Name:', name);
    console.log('Contact:', contact);
    console.log('Service Type:', serviceType);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());

    return new Response(JSON.stringify({
      success: true,
      message: '문의가 성공적으로 접수되었습니다.'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
