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
		"dataset-id": { kind: "parsed", brief: "Dataset UUID.", parse: String },
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
	operands: [{ placeholder: "grant-id", brief: "Grant ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <grant-id>",
	describe: "Revoke access to a dataset",
	usage:
		"$0 cloudforce-one threat-intel datasets access permissions delete <grant-id>\n\nRemoves an access grant from a dataset.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
