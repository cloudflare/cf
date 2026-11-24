/**
 * list command
 * @generated from apis/overlays/web-assets.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		host: {
			kind: "parsed",
			brief: "Filter results to only include the specified hosts.",
			variadic: true,
			optional: true,
			parse: String,
		},
		method: {
			kind: "parsed",
			brief: "Filter results to only include the specified HTTP methods.",
			variadic: true,
			optional: true,
			parse: String,
		},
		endpoint: {
			kind: "parsed",
			brief:
				"Filter results to only include endpoints containing this pattern.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Field to order by",
			values: [
				"host",
				"method",
				"endpoint",
				"traffic_stats.requests",
				"traffic_stats.last_updated",
			],
			optional: true,
		},
		diff: {
			kind: "boolean",
			brief:
				"When `true`, only return API Discovery results that are not saved into API Shield Endpoint Management",
			optional: true,
		},
		origin: {
			kind: "enum",
			brief:
				"Filter results to only include discovery results sourced from a particular discovery engine\n  * `ML` - Discovered operations that were sourced using ML API Discovery\n  * `SessionIdentifier` - Discovered operations that were sourced using Session Identifier API Discovery",
			values: ["ML", "SessionIdentifier", "LabelDiscovery"],
			optional: true,
		},
		state: {
			kind: "enum",
			brief:
				"Filter results to only include discovery results in a particular state. States are as follows\n  * `review` - Discovered operations that are not saved into API Shield Endpoint Management\n  * `saved` - Discovered operations that are already saved into API Shield Endpoint Management\n  * `ignored` - Discovered operations that have been marked as ignored",
			values: ["review", "saved", "ignored"],
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
	command: "list",
	describe: "List discovered web and API operations",
	usage:
		"$0 web-assets discovery operations list\n\nReturns the latest web and API operations discovered from zone traffic.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
