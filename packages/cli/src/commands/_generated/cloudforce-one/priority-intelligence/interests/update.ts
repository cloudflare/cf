/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		value: {
			kind: "parsed",
			brief: "The value field",
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
		{ placeholder: "interest-id", brief: "Interest UUID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <interest-id>",
	describe: "Update an account interest for PIR Option 2",
	usage:
		"$0 cloudforce-one priority-intelligence interests update <interest-id>\n\nUpdates a structured account interest used by Priority Intelligence Option 2 evaluations. Changing the value re-resolves the interest against the current catalog.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
