/**
 * purge command
 * @generated from apis/overlays/cache.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "purge",
	describe: "Purge Cached Content",
	usage:
		"$0 cache purge\n\nDeletes cached content in every Cloudflare data center and cache tier, including Cache Reserve. The next request for purged content is a cache `MISS`: Cloudflare fetches the full response from your origin and caches it again. Cloudflare does not serve purged content from cache again, even if your origin is unavailable. To keep content cached and have Cloudflare revalidate it with your origin instead, use `POST /zones/{zone_id}/invalidate_cache`. ### Choose what to purge Send one of these fields in the request body: - `files`: specific URLs. If your cache key includes request headers, send each URL with the header values it was cached with. - `tags`: all content whose `Cache-Tag` response header contains one of the tags. - `hosts`: all content cached for the hostnames. - `prefixes`: all content whose URL starts with one of the prefixes. - `purge_everything`: all cached content in the zone. ### Check the result A `200` response with `success: true` means Cloudflare accepted the request. It does not confirm that any content was cached or removed. To check, request a purged URL and confirm that the `CF-Cache-Status` response header is `MISS`. ### Availability and limits Rate limits and the number of items you can send in one request depend on your plan. See [Purge cache: availability and limits](https://developers.cloudflare.com/cache/how-to/purge-cache/#availability-and-limits).",
	...parameters,
	loader: () => import("./purge.handler.js"),
});

export default command;
