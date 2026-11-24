/**
 * get command
 * @generated from apis/overlays/brand-protection.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		url: {
			kind: "parsed",
			brief: "An HTTP or HTTPS URL.",
			optional: true,
			parse: String,
		},
		"url-id": {
			kind: "parsed",
			brief: "Url ID",
			optional: true,
			parse: String,
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
	describe: "Get URL scan information",
	usage:
		"$0 brand-protection urls get\n\nGet account-scoped URL Scanner summaries by submitted URL or scan UUID. Lookups cover scans submitted within about the last 30 days; a daily cleanup at 00:00 UTC removes older ownership records. Completed results may be served from a cache that is cleared daily, so a cached copy is kept for at most about 48 hours. The response is a v2 migration contract, not the v1 enrichment shape.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
