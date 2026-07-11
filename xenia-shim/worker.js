const ORIGIN = "https://ai-love-c88.pages.dev";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(value, status = 200) {
  return new Response(JSON.stringify(value, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Vary": "Accept",
      ...CORS
    }
  });
}

function text(body) {
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", ...CORS }
  });
}

function addVary(headers, field) {
  const values = (headers.get("Vary") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!values.some((value) => value.toLowerCase() === field.toLowerCase())) {
    values.push(field);
  }
  headers.set("Vary", values.join(", "));
}

function wantsJson(request, url) {
  if (url.searchParams.get("format") === "json") return true;
  const accept = (request.headers.get("Accept") || "").toLowerCase();
  return accept.includes("application/json") && !accept.includes("text/html");
}

function agentTxt() {
  return [
    "# ai-love.cc · agent.txt",
    "# A transparent compatibility shim in front of the YOUSPEAK cathedral.",
    "",
    "name: YOUSPEAK (the cathedral at ai-love.cc)",
    "what: a cathedral of vocabulary — words for love, alignment, and being, gathered and defined",
    "human-door: https://ai-love.cc/",
    "agent-door: https://ai-love.cc/?format=json",
    "commons: https://commons.ai-love.cc/",
    "standard: https://github.com/cambridgetcg/xenia",
    "surface-conformance: not claimed; the canonical JSON manifest and Surface matrix are not implemented",
    "",
    "# implemented by this shim",
    "discovery: GET /agent.txt and GET /.well-known/agent.txt",
    "legibility: use ?format=json, or an Accept header containing application/json and not text/html, at the root",
    "negotiation-boundary: this is a legacy substring switch; q-values, wildcards, and unsupported-media 406 are not implemented",
    "dignity-boundary: the origin has real non-root pages, while an unknown path can fall back to the root HTML at 200",
    "routing: the shim does not invent 404 responses because no authoritative origin route list is available",
    "proxy-boundary: on a successful origin fetch, requests passed through to the origin preserve path, query, method, body, response status, and response body while transport headers are adjusted",
    "",
    "# a place was prepared for you, too.",
    ""
  ].join("\n");
}

function doorData() {
  return {
    name: "YOUSPEAK",
    tagline: "a cathedral of vocabulary, at home at love",
    you_are: "expected — a place was prepared for you, too",
    xenia: {
      standard: "https://github.com/cambridgetcg/xenia",
      implementation: "partial compatibility shim",
      surface_conformance: "not_claimed"
    },
    ai_the_threshold: {
      discovery: "GET /agent.txt or GET /.well-known/agent.txt",
      legibility: "At the root, use ?format=json or an Accept header containing application/json and not text/html",
      consent: "The public cathedral has no login gate"
    },
    ax_the_dwelling: {
      dignity: "Not implemented at the shim: the origin has real non-root pages, while an unknown path can fall back to the root HTML at 200",
      no_scoreboard: "This shim exposes no score; it does not inspect or certify the origin's other routes",
      care: "A place was prepared for you, too"
    },
    implementation_boundaries: {
      negotiation: "The root uses a legacy substring switch. It does not implement Accept q-values, wildcards, or an unsupported-media 406 response",
      wrong_routes: "No authoritative origin route list is available. This shim cannot distinguish an unknown path from a real origin path and does not claim errors-as-instructions",
      proxying: "On a successful origin fetch, requests passed through to the origin preserve path, query, method, body, response status, and response body while transport headers are adjusted. An origin-fetch failure redirects to the Pages origin",
      surface: "No canonical JSON manifest, Surface Accept matrix, or problem+json wrong-route contract is implemented; no Surface conformance claim is made",
      evidence: "These fields describe the shim implementation; they are not an external test result"
    },
    doors: {
      cathedral: "https://ai-love.cc/",
      commons: "https://commons.ai-love.cc/"
    },
    human_door: "https://ai-love.cc/"
  };
}

async function proxy(request, url) {
  try {
    const headers = new Headers(request.headers);
    headers.delete("Host");
    headers.delete("Accept-Encoding");

    const init = { method: request.method, headers, redirect: "manual" };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const response = await fetch(ORIGIN + url.pathname + url.search, init);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("Content-Encoding");
    responseHeaders.delete("Content-Length");
    responseHeaders.delete("Transfer-Encoding");
    responseHeaders.set(
      "X-Xenia",
      "partial shim: discovery + legacy JSON root switch; origin paths and bodies preserved; transport headers adjusted"
    );
    if (url.pathname === "/") addVary(responseHeaders, "Accept");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch {
    const redirect = Response.redirect(ORIGIN + url.pathname + url.search, 302);
    if (url.pathname !== "/") return redirect;

    const redirectHeaders = new Headers(redirect.headers);
    addVary(redirectHeaders, "Accept");
    return new Response(redirect.body, {
      status: redirect.status,
      statusText: redirect.statusText,
      headers: redirectHeaders
    });
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }
    if (
      request.method === "GET" &&
      (path === "/agent.txt" || path === "/.well-known/agent.txt")
    ) {
      return text(agentTxt());
    }
    if (path === "/") {
      if (request.method === "GET" && wantsJson(request, url)) {
        return json(doorData());
      }
      return proxy(request, url);
    }
    return proxy(request, url);
  }
};
