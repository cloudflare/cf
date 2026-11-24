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
		{ placeholder: "interest-id", brief: "Interest UUID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <interest-id>",
	describe: "Delete an account interest for PIR Option 2",
	usage:
		"$0 cloudforce-one priority-intelligence interests delete <interest-id>\n\nDeletes a structured account interest so later Priority Intelligence Option 2 evaluations no longer include it.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
