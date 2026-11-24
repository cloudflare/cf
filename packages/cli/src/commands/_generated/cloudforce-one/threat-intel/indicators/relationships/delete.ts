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
		"indicator-id": { kind: "parsed", brief: "Indicator UUID.", parse: String },
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
		{ placeholder: "rel-uuid", brief: "Relationship UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <rel-uuid>",
	describe: "Delete an indicator relationship",
	usage:
		"$0 cloudforce-one threat-intel indicators relationships delete <rel-uuid>\n\nDeletes an indicator relationship by its UUID. Returns `deleted: false` if the relationship doesn't exist.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
