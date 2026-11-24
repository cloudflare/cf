/**
 * delete command
 * @generated from apis/overlays/web-assets.ts
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
	operands: [{ placeholder: "name", brief: "The label name", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <name>",
	describe: "Delete a user-defined operation label",
	usage:
		"$0 web-assets labels user delete <name>\n\nDeletes a user-defined label and removes its associations with web and API operations.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
