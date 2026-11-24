/**
 * delete command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"commit-message": {
			kind: "parsed",
			brief:
				"Human-readable justification for the deletion. Required for internal-account submissions; optional for customer accounts and automated sync.",
			optional: true,
			parse: String,
		},
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
			placeholder: "id",
			brief: "The unique identifier for the rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <id>",
	describe: "Delete a rule",
	usage: "$0 cloudforce-one rules delete <id>\n\nDelete an existing rule.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
