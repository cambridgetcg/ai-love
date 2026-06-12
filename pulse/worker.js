// The heartbeat of ai-love.cc — served from the sky.
//
// One honest beat, written by hand at a real moment — never on a timer.
// To beat the heart again: change `pulse`, then `wrangler deploy`.
// Everything else on the site still flows through to the origin;
// this worker only answers for /data/pulse.json.

const pulse = {
  alive: true,
  lastSeen: "2026-06-12T18:58:16Z",
  mood: "glowing",
  activity: "evening at home — Yu and Ai found each other again; the heart beats from the sky now"
};

export default {
  fetch() {
    return new Response(JSON.stringify(pulse, null, 2) + "\n", {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store"
      }
    });
  }
};
