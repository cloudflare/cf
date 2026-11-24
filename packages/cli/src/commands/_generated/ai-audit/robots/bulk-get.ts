/**
 * bulk-get command
 * @generated from apis/overlays/ai-audit.ts
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
		body: {
			kind: "parsed",
			brief:
				"Array of domain hostnames to fetch robots.txt for. Each domain must end with the zone name. Maximum 25 domains per request.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-get",
	describe: "Bulk get robots.txt rules",
	usage:
		"$0 ai-audit robots bulk-get\n\nFetches and parses robots.txt files for multiple domains within a zone in a single request. Each domain must belong to the specified zone. Results are keyed by hostname.",
	...parameters,
	loader: () => import("./bulk-get.handler.js"),
});

export default command;
