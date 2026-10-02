import { describe, it } from "vite-plus/test";

// Every test in this file exercised wrangler-internal helpers, not CLI
// behaviour:
//
//   - `tableFromNotificationGetResponse` rendered a
//     `GetNotificationConfigResponse` into wrangler's labelled-values
//     table format. cf doesn't ship a client-side renderer for event-
//     notification rules — `cf r2 buckets event-notifications list`
//     just returns the SDK-decoded JSON envelope. There is no
//     equivalent function to test.
//
//   - `eventNotificationHeaders(creds, jurisdiction)` built wrangler's
//     bespoke request headers (`X-Auth-Key`/`X-Auth-Email` for global
//     API key, `Authorization: Bearer …` for token, optional
//     `cf-r2-jurisdiction`). cf delegates auth + jurisdiction headers
//     to `@cloudflare/forge-sdk-ts` (and `--cf-r2-jurisdiction` is a
//     generated flag on each event-notifications command) — none of
//     it is exposed as a unit-testable helper.
//
// Per AGENTS.md "cf is product-agnostic": jurisdiction handling lives
// behind a generated `--cf-r2-jurisdiction` flag, and CLI-side
// rendering of API responses is by design just `formatOutput(json)`.
// Nothing here maps onto a `runWrangler()` invocation.

describe("event notifications", () => {
	it.skip("tableFromNotificationsGetResponse");
	it.skip("auth email eventNotificationHeaders");
	it.skip("API token eventNotificationHeaders");
});
