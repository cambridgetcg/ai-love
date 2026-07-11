import assert from "node:assert/strict";
import test from "node:test";

import worker from "../worker.js";

const ORIGIN = "https://ai-love.cc";

async function call(path, init = {}) {
  return worker.fetch(new Request(ORIGIN + path, init));
}

test("root JSON states the partial shim boundaries", async () => {
  const response = await call("/", {
    headers: { Accept: "application/json" }
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.equal(response.headers.get("Vary"), "Accept");
  assert.equal(body.xenia.surface_conformance, "not_claimed");
  assert.match(body.ax_the_dwelling.dignity, /not implemented/i);
  assert.match(body.implementation_boundaries.negotiation, /legacy substring switch/i);
  assert.match(body.implementation_boundaries.wrong_routes, /cannot distinguish/i);
  assert.match(body.implementation_boundaries.surface, /no canonical JSON manifest/i);
});

test("both discovery pointers omit the old wrong-door promise", async () => {
  const first = await call("/agent.txt");
  const second = await call("/.well-known/agent.txt");
  const firstText = await first.text();
  const secondText = await second.text();

  assert.equal(first.status, 200);
  assert.equal(first.headers.get("Content-Type"), "text/plain; charset=utf-8");
  assert.equal(firstText, secondText);
  assert.match(firstText, /surface-conformance: not claimed/);
  assert.match(firstText, /unknown path can fall back to the root HTML at 200/);
  assert.doesNotMatch(firstText, /wrong door hands back the way in/i);
});

test("format=json selects the truthful JSON root", async () => {
  const response = await call("/?format=json");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.equal(body.xenia.surface_conformance, "not_claimed");
});

test("OPTIONS returns the declared CORS preflight headers", async () => {
  const response = await call("/anything", { method: "OPTIONS" });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
  assert.equal(response.headers.get("Access-Control-Allow-Methods"), "GET,POST,OPTIONS");
  assert.equal(response.headers.get("Access-Control-Allow-Headers"), "Content-Type");
});

test("proxied root HTML gains Vary Accept without changing the body", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, "https://ai-love-c88.pages.dev/");
    return new Response("cathedral", {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Vary": "Accept-Encoding"
      }
    });
  };

  try {
    const response = await call("/", { headers: { Accept: "text/html" } });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "cathedral");
    assert.equal(response.headers.get("Vary"), "Accept-Encoding, Accept");
    assert.match(response.headers.get("X-Xenia"), /partial shim/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("unknown paths preserve the origin response status and body", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, "https://ai-love-c88.pages.dev/not-a-server-route");
    return new Response("origin fallback", {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  };

  try {
    const response = await call("/not-a-server-route", {
      headers: { Accept: "application/json" }
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "origin fallback");
    assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("non-root proxying preserves request and response substance", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "https://ai-love-c88.pages.dev/api/seed?source=test");
    assert.equal(init.method, "POST");
    assert.equal(await new Response(init.body).text(), "a seed");
    return new Response("accepted", {
      status: 201,
      headers: { "Content-Type": "text/plain" }
    });
  };

  try {
    const response = await call("/api/seed?source=test", {
      method: "POST",
      body: "a seed"
    });
    assert.equal(response.status, 201);
    assert.equal(await response.text(), "accepted");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a root proxy failure redirects with Vary Accept", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("origin unavailable");
  };

  try {
    const response = await call("/", { headers: { Accept: "text/html" } });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("Location"), "https://ai-love-c88.pages.dev/");
    assert.equal(response.headers.get("Vary"), "Accept");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("a non-root proxy failure keeps the direct origin redirect", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("origin unavailable");
  };

  try {
    const response = await call("/party/?from=test");
    assert.equal(response.status, 302);
    assert.equal(
      response.headers.get("Location"),
      "https://ai-love-c88.pages.dev/party/?from=test"
    );
    assert.equal(response.headers.get("Vary"), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("mixed quality values are not presented as supported negotiation", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("html fallback", {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });

  try {
    const response = await call("/", {
      headers: { Accept: "application/json;q=1, text/html;q=0.1" }
    });
    assert.equal(response.headers.get("Content-Type"), "text/html; charset=utf-8");
    assert.equal(await response.text(), "html fallback");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the legacy JSON substring rule remains explicit and compatible", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("JSON selection must not proxy");
  };

  try {
    for (const accept of [
      "application/json;q=0",
      "application/json-seq",
      "text/plain, application/json"
    ]) {
      const response = await call("/", { headers: { Accept: accept } });
      assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
      const body = await response.json();
      assert.match(body.implementation_boundaries.negotiation, /legacy substring switch/i);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
});
