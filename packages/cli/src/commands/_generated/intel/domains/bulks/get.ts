/**
 * get command
 * @generated from apis/overlays/intel.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		domain: {
			kind: "parsed",
			brief:
				"Accepts multiple values like `?domain=cloudflare.com&domain=example.com`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"include-ranking": {
			kind: "boolean",
			brief:
				"Whether to include domain ranking data in the response. Defaults to\n`false` — ranking lookups are expensive at bulk scale and most\ncallers do not need them. Set to `true` to opt in. This parameter\nreplaces the deprecated `skip_ranking` (see below).",
			optional: true,
		},
		"skip-dns": {
			kind: "boolean",
			brief:
				"Skip the DNS resolution-history lookup for faster responses. Defaults\nto `false`. Set to `true` if you only need categorization data; no\nDNS resolution history is returned for any domain. Matches the\n`skip_dns` parameter on `/intel/domain`.",
			optional: true,
		},
		"skip-ranking": {
			kind: "boolean",
			brief:
				"**Deprecated.** Previously controlled whether the ranking lookup\nwas skipped (defaulted to `false`, meaning ranking ran). The\nendpoint's default behavior is being flipped — ranking is now\nopt-in via `include_ranking=true` — and this parameter will be\nsilently ignored. Remove it from your callers and use\n`include_ranking` instead.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get",
	describe: "Get Multiple Domain Details",
	usage:
		"$0 intel domains bulks get\n\nReturns security details and statistics about multiple domains in a single request. **Behavior change — domain ranking is becoming opt-in.** This endpoint previously included domain ranking data in every response and accepted a `skip_ranking=true` query parameter to opt out. That parameter is being deprecated and ranking will no longer be returned by default. Callers that want ranking data must pass `include_ranking=true`. The `skip_ranking` parameter will be silently ignored once the change ships.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
