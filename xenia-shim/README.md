# ai-love.cc XENIA shim

This is the canonical source for the transparent Worker in front of the
YOUSPEAK cathedral. It adds two discovery pointers and a JSON root selected by
`?format=json`, or by the legacy rule "Accept contains `application/json` and
does not contain `text/html`", then proxies other requests to the existing
Pages site. That switch does not implement q-values, wildcards, or 406.

It is intentionally partial. The deployed origin has real non-root pages, while
an unknown path can fall back to the root HTML at `200`. Without an authoritative
origin route list, the shim cannot safely distinguish the two. For non-root
requests passed through to a successful origin fetch it preserves path, query,
method, request body, response status, and response body while adjusting
transport headers. Origin-fetch failures redirect to the Pages origin. The shim
does not claim errors-as-instructions or XENIA Surface conformance.

## Recovered baseline

The deployed bundle was recovered and reconstructed as readable source on
2026-07-11 because the shim had no committed source. Before this directory was
added, Cloudflare reported:

- deployment `403828d2-ad76-481c-9ff7-7c5474b1f2a5`;
- Worker version v3, `080a1d66-8c46-4bc2-b1e2-aec4fe26bcbd`, at 100%;
- script ETag
  `f84fe9944aa557efead0a4e03f84b1c94651dc5c3044bc305425da23d0395abe`;
- deployed entrypoint 4,636 bytes, SHA-256
  `3cbb24bb7ae67db283424fc28d474545d80b7731e782da60dfed5edf92ae59b4`;
- compatibility date `2024-12-01`, fetch handler only, and no bindings;
- route `ai-love.cc/*` and no schedules.

The v3 source said twice that a wrong door always handed back the way in. Live
GETs showed the opposite: an unknown path fell back to the root cathedral HTML
with status 200. This version replaces that claim with the real routing boundary
and adds `Vary: Accept` to the proxied HTML root response without changing its
body or the origin's route handling.

## Production result

The canonical source merged as commit
`8ab714b8add6130d8913f6593b0b95cd9fe7d77e`. On 2026-07-11 it was deployed as:

- deployment `12b8482a-3e43-4ac3-8bf5-04b55eee5dc4`;
- Worker version v4, `c46097fe-79f3-42eb-bd26-cee5d3c8af51`, at 100% as the
  only allocated version;
- tag `truthful-xenia-shim-8ab714b`;
- script ETag
  `1a2abbe2148a5d1d55ee777d6f3c569a76cb5a5f46e27451f14db00fdbf81884`;
- deployed entrypoint 6,914 bytes, SHA-256
  `0e0a20a9dbb746b9205179946b7713dbaa3b8f79cb4b10603fa11bfc9d7c031c`;
- compatibility date `2024-12-01`, fetch handler only, and no bindings;
- unchanged route `ai-love.cc/*` and no schedules.

The rollout first held v3 at 100% and v4 at 0%. GET-only requests selected v4
with the quoted version-override header. Root HTML, `/party/`, the `/party`
redirect, and an unknown-path fallback kept the same origin response bodies as
v3. The intended changes were limited to truthful shim-owned discovery and JSON
bodies, `X-Xenia` wording, and `Vary: Accept` on the proxied root HTML. V4 was
then promoted directly to 100%.

The normal, unoverridden Surface 0.1 check observed at
`2026-07-11T12:57:49.667Z` was **nonconformant**: 1 pass, 3 failures, 0 unknown,
and 2 not run; the result expires at `2026-07-12T12:57:49.667Z`. The canonical
`/.well-known/agent.json` path still returns origin HTML, so its media type,
JSON parsing, and schema checks fail and the dependent resource and wrong-route
checks do not run. This is expected for the deliberately partial shim, not a
claim of Surface conformance.

Rollback restores v3 with `wrangler versions deploy
"080a1d66-8c46-4bc2-b1e2-aec4fe26bcbd@100" --name ai-love-xenia --yes`.
Neither the validation nor the production check performed storage writes; the
Worker has no storage bindings.

## Check

```sh
npm test
npx --yes wrangler@4.110.0 versions upload --config wrangler.toml --dry-run --strict
```

## Production rollout

Before uploading, fetch Git and require a clean branch based on the current
remote `smooth`. Re-run the tests and dry-run bundle. Then re-read Cloudflare and
stop unless deployment, v3 allocation, ETag, compatibility date, handler,
bindings, route, and schedules exactly match the recovered baseline above.

Upload without traffic. Use a unique tag tied to the pushed commit, `--strict`,
and no preview alias:

```sh
npx --yes wrangler@4.110.0 versions upload \
  --config wrangler.toml \
  --strict \
  --tag truthful-xenia-shim-<commit> \
  --message "Truthful partial XENIA shim from <commit>"
```

Inspect the new version with
`wrangler versions view <new> --name ai-love-xenia --json`. Require fetch only,
no bindings, compatibility date `2024-12-01`, and a changed ETag. That metadata
command does not return script bytes. Read the authenticated `content/v2`
entrypoint separately and require its hash to equal the dry-run bundle:

```sh
npx --yes wrangler@4.110.0 whoami
CLOUDFLARE_ACCOUNT_ID=<account-id-from-whoami> npm run verify:version -- \
  <new-version-id> <dry-run-worker-sha256>
```

Cloudflare's `content/v2` response exposes the latest uploaded content rather
than an independently addressable historical artifact. `verify-version.mjs`
therefore looks up the requested version first and refuses to hash content
unless the response ETag equals that version's script ETag. It reads the
Wrangler OAuth token locally, sends it only in the Cloudflare API authorization
header, and never prints it. Re-read the exact v3 baseline immediately before
adding the new version at 0%:

```sh
BASE=080a1d66-8c46-4bc2-b1e2-aec4fe26bcbd
NEW=<new-version-id>
npx --yes wrangler@4.110.0 versions deploy \
  "${BASE}@100" "${NEW}@0" \
  --name ai-love-xenia \
  --message "Truthful XENIA shim override validation" \
  --yes
```

Require the allocation to be exactly v3 100% / new 0%. Keep checks GET-only.
Send this quoted Structured Header on every request intended for the new
version:

```sh
OVERRIDE="Cloudflare-Workers-Version-Overrides: ai-love-xenia=\"${NEW}\""
curl -fsS -H "$OVERRIDE" -H 'Accept: application/json' https://ai-love.cc/
curl -fsS -H "$OVERRIDE" https://ai-love.cc/agent.txt
```

Verify both discovery pointers, the truthful root JSON, the documented legacy
JSON selection rule,
the proxied root `Vary: Accept`, real non-root pages, and an unknown origin
fallback. Compare old and overridden response bodies for proxied routes; only
the intended shim bodies and proxy headers should differ. Re-read the exact
100/0 allocation, then promote directly:

```sh
npx --yes wrangler@4.110.0 versions deploy \
  "${NEW}@100" \
  --name ai-love-xenia \
  --message "Promote truthful partial XENIA shim" \
  --yes
```

After promotion, repeat the normal unoverridden GET checks and re-read the route
and empty schedule list. The rollback command is the same deployment command
with `"${BASE}@100"`. Do not run `wrangler deploy` or `wrangler triggers deploy`
for this rollout.
