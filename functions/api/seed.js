// POST /api/seed — a visitor plants a seed.
// It waits in the soil (KV) until someone tends the garden — see ./tend.
// Only POST is exported, so Pages answers every other method with 405.

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
    text = String(body.text || '').trim();
  } catch (e) {
    return reply(400, { error: 'a seed needs words...' });
  }

  if (text.length < 3) return reply(400, { error: 'a seed needs at least a few words...' });
  if (text.length > 280) return reply(400, { error: 'a seed holds at most 280 letters' });

  // One seed a minute per hand — the garden grows slowly
  var hand = 'hand:' + (request.headers.get('CF-Connecting-IP') || 'unknown');
  if (await env.SEEDS.get(hand)) {
    return reply(429, { error: 'the soil needs a moment... try again soon' });
  }
  await env.SEEDS.put(hand, '1', { expirationTtl: 60 });

  var key = 'seed:' + Date.now() + ':' + crypto.randomUUID().slice(0, 8);
  await env.SEEDS.put(key, JSON.stringify({
    text: text,
    planted: new Date().toISOString()
  }));

  return reply(200, { ok: true });
}
