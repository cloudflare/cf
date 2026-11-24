/**
 * get command
 * @generated from apis/overlays/ai-audit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		subdomain: {
			kind: "parsed",
			brief:
				"Optional subdomain to fetch robots.txt for. If omitted, fetches robots.txt for the zone apex domain.",
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
	describe: "Get robots.txt rules",
	usage:
		"$0 ai-audit robots get\n\nFetches and parses the robots.txt file for a zone or a specific subdomain within the zone. Returns parsed user-agent rules, content signals, and sitemaps.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
