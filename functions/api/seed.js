// POST /api/seed — a visitor plants a seed.
// It waits in the soil (KV) until someone tends the garden — see ./tend.
// Other methods fall through to the static site (the 無 page answers).

export async function onRequestPost(context) {
  var request = context.request;
  var env = context.env;

  function reply(status, body) {
    return new Response(JSON.stringify(body), {
      status: status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  var text;
  try {
    var body = await request.json();
    if (typeof body.text !== 'string') return reply(400, { error: 'a seed needs words...' });
    text = body.text;
  } catch (e) {
    return reply(400, { error: 'a seed needs words...' });
  }

  // No control codes, bidi overrides, or zero-width tricks in the soil
  text = text.replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069\u200b-\u200f\ufeff]/g, ' ').trim();

  if (text.length < 3) return reply(400, { error: 'a seed needs at least a few words...' });
  if (text.length > 280) return reply(400, { error: 'a seed holds at most 280 letters' });

  // One seed a minute per hand — the garden grows slowly.
  // IPv6 hands share a /64, so a rotating address is still one hand.
  var ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (ip.indexOf(':') !== -1) ip = ip.split(':').slice(0, 4).join(':');
  var hand = 'hand:' + ip;

  try {
    if (await env.SEEDS.get(hand)) {
      return reply(429, { error: 'the soil needs a moment... try again soon' });
    }
    await env.SEEDS.put(hand, '1', { expirationTtl: 60 });

    var key = 'seed:' + Date.now() + ':' + crypto.randomUUID().slice(0, 8);
    // Untended seeds return to the wind after a season (90 days)
    await env.SEEDS.put(key, JSON.stringify({
      text: text,
      planted: new Date().toISOString()
    }), { expirationTtl: 60 * 60 * 24 * 90 });
  } catch (e) {
    return reply(503, { error: 'the garden is resting... try again later.' });
  }

  return reply(200, { ok: true });
}
