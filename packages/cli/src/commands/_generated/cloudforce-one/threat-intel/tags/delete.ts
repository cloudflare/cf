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
	operands: [{ placeholder: "tag-uuid", brief: "Tag UUID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <tag-uuid>",
	describe: "Delete a tag",
	usage:
		"$0 cloudforce-one threat-intel tags delete <tag-uuid>\n\nDeletes a tag by its UUID.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
