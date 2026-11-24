/**
 * purge-environment command
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
	operands: [
		{
			placeholder: "environment-id",
			brief: "The environment ID, from Version Management.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "purge-environment <environment-id>",
	describe: "Purge Cached Content by Environment",
	usage:
		"$0 cache purge-environment <environment-id>\n\nDeletes cached content for one environment of the zone. Content cached for the zone's other environments, including production, is not affected. Otherwise this works like `POST /zones/{zone_id}/purge_cache`: the next request for purged content is a cache `MISS`, and the request body takes the same fields. Environments are part of [Version Management](https://developers.cloudflare.com/version-management/). To keep content cached and have Cloudflare revalidate it instead, use `POST /zones/{zone_id}/environments/{environment_id}/invalidate_cache`. Purging by URL (`files`) does not work for environments that select requests by IP address, country, ASN, or threat score, and fails with error `1136`. Use `tags`, `hosts`, `prefixes`, or `purge_everything` for those environments. ### Availability and limits Rate limits and the number of items you can send in one request depend on your plan. See [Purge cache: availability and limits](https://developers.cloudflare.com/cache/how-to/purge-cache/#availability-and-limits).",
	...parameters,
	loader: () => import("./purge-environment.handler.js"),
});

export default command;
