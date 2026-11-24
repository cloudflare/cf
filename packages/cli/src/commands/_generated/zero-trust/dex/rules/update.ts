/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		match: {
			kind: "parsed",
			brief: "The wirefilter expression to match.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the Rule.",
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
	operands: [
		{
			placeholder: "rule-id",
			brief: "Unique identifier of the rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <rule-id>",
	describe: "Update a DEX Rule",
	usage: "$0 zero-trust dex rules update <rule-id>\n\nUpdate a DEX Rule.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
