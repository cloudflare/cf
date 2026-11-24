/**
 * delete command
 * @generated from apis/overlays/url-normalization.ts
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete",
	describe: "Delete URL Normalization settings",
	usage:
		"$0 url-normalization delete\n\nDeletes the URL Normalization settings.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
