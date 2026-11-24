/**
 * update command
 * @generated from apis/overlays/monetization.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		rules: {
			kind: "parsed",
			brief:
				'Full desired Payment Required ruleset. An empty array clears all payment rules. The ruleset may contain at most 40 unique wallet addresses; address comparison is case-insensitive. Every address must pass wallet screening before deployment. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"address": string, "expression": string, "price": string, "scheme": "exact" | "upto", "description"?: string, ...more} | ...more)]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
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
	command: "update",
	describe: "Deploy payment ruleset",
	usage:
		"$0 monetization rules update\n\nReplaces the zone's Payment Required ruleset with the submitted desired state. Submit an empty rules array to clear all payment rules.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
