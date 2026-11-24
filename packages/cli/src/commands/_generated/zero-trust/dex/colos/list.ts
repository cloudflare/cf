/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		from: {
			kind: "parsed",
			brief:
				"Start time for connection period in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
		},
		to: {
			kind: "parsed",
			brief:
				"End time for connection period in ISO (RFC3339 - ISO 8601) format.",
			parse: String,
		},
		"sort-by": {
			kind: "enum",
			brief:
				"Type of usage that colos should be sorted by. If unspecified, returns all Cloudflare colos sorted alphabetically.",
			values: ["fleet-status-usage", "application-tests-usage"],
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
	describe: "List Cloudflare colos",
	usage:
		"$0 zero-trust dex colos list\n\nList Cloudflare colos that account's devices were connected to during a time period, sorted by usage starting from the most used colo. Colos without traffic are also returned and sorted alphabetically.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
