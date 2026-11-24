/**
 * delete command
 * @generated from apis/overlays/brand-protection.ts
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
		{ placeholder: "query-id", brief: "ID of the logo query.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <query-id>",
	describe: "Delete logo query",
	usage:
		"$0 brand-protection logos delete <query-id>\n\nPermanently deletes a saved logo query and all of its matches. If the query does not exist in this account, the request fails with error code 404.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
