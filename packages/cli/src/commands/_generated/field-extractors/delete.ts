/**
 * delete command
 * @generated from apis/overlays/field-extractors.ts
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
		{ placeholder: "extractor", brief: "Extractor type.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <extractor>",
	describe: "Delete Field Extractor",
	usage:
		"$0 field-extractors delete <extractor>\n\nDeletes all custom extraction rules for an extractor type.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
