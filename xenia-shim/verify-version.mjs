#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";

const [versionId, expectedHash] = process.argv.slice(2);
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

if (!/^[a-f0-9]{32}$/.test(accountId || "")) {
  throw new Error("Set CLOUDFLARE_ACCOUNT_ID to the 32-character account ID from wrangler whoami");
}
if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(versionId || "")) {
  throw new Error("Usage: CLOUDFLARE_ACCOUNT_ID=<id> node verify-version.mjs <version-id> [expected-sha256]");
}
if (expectedHash !== undefined && !/^[a-f0-9]{64}$/.test(expectedHash)) {
  throw new Error("expected-sha256 must be 64 lowercase hexadecimal characters");
}

const config = await readFile(`${homedir()}/.wrangler/config/default.toml`, "utf8");
const tokenLine = config
  .split("\n")
  .find((line) => line.startsWith("oauth_token = "));
if (!tokenLine) throw new Error("Wrangler OAuth token not found");
const token = JSON.parse(tokenLine.slice(tokenLine.indexOf("=") + 1).trim());

const apiBase =
  `https://api.cloudflare.com/client/v4/accounts/${accountId}` +
  "/workers/scripts/ai-love-xenia";
const headers = { Authorization: `Bearer ${token}` };

const versionResponse = await fetch(`${apiBase}/versions/${versionId}`, {
  headers,
  signal: AbortSignal.timeout(10_000)
});
const versionBody = await versionResponse.json();
if (
  !versionResponse.ok ||
  versionBody.success !== true ||
  versionBody.result?.id !== versionId
) {
  throw new Error(`Cloudflare version lookup failed with HTTP ${versionResponse.status}`);
}
const versionEtag = versionBody.result?.resources?.script?.etag;
if (!/^[a-f0-9]{64}$/.test(versionEtag || "")) {
  throw new Error("Cloudflare version metadata omitted the script ETag");
}

const response = await fetch(`${apiBase}/content/v2?version=${versionId}`, {
  headers,
  signal: AbortSignal.timeout(10_000)
});
if (!response.ok) {
  throw new Error(`Cloudflare content read failed with HTTP ${response.status}`);
}
const contentEtag = (response.headers.get("ETag") || "")
  .replace(/^W\//, "")
  .replace(/^"|"$/g, "");
if (contentEtag !== versionEtag) {
  throw new Error(
    `Cloudflare content ETag ${contentEtag || "missing"} did not equal version ETag ${versionEtag}`
  );
}
if (!response.headers.get("Content-Type")?.startsWith("multipart/form-data")) {
  throw new Error("Cloudflare content response was not multipart/form-data");
}

const entrypoint = response.headers.get("cf-entrypoint");
if (!entrypoint) throw new Error("Cloudflare content response omitted cf-entrypoint");
const form = await response.formData();
const part = form.get(entrypoint);
if (!part || typeof part.arrayBuffer !== "function") {
  throw new Error(`Cloudflare content response omitted entrypoint part ${entrypoint}`);
}

const bytes = Buffer.from(await part.arrayBuffer());
const sha256 = createHash("sha256").update(bytes).digest("hex");
if (expectedHash !== undefined && sha256 !== expectedHash) {
  throw new Error(`entrypoint SHA-256 ${sha256} did not equal expected ${expectedHash}`);
}

console.log(JSON.stringify({
  version_id: versionId,
  script_etag: versionEtag,
  entrypoint,
  bytes: bytes.length,
  sha256,
  expected_hash_matched: expectedHash === undefined ? null : true
}, null, 2));
