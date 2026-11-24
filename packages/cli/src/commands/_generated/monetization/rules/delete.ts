/**
 * delete command
 * @generated from apis/overlays/monetization.ts
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
	},
	operands: [
		{
			placeholder: "rule-id",
			brief: "The unique ID of the payment rule.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <rule-id>",
	describe: "Delete a payment rule",
	usage:
		"$0 monetization rules delete <rule-id>\n\nRemoves a single Payment Required rule identified by its ID. Every other rule is preserved. Returns the resulting rule collection.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
