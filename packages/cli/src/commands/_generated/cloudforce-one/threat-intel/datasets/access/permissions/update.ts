/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"dataset-id": { kind: "parsed", brief: "Dataset UUID.", parse: String },
		role: {
			kind: "parsed",
			brief: "The role field",
			optional: true,
			choices: ["read", "write"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "role", "text"),
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
	operands: [{ placeholder: "grant-id", brief: "Grant ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <grant-id>",
	describe: "Change a dataset permission",
	usage:
		"$0 cloudforce-one threat-intel datasets access permissions update <grant-id>\n\nChanges the `role` of an access grant to `read` or `write`.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
