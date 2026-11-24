/**
 * delete command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"site-id": { kind: "parsed", brief: "Identifier", parse: String },
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
	operands: [{ placeholder: "lan-id", brief: "Identifier", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <lan-id>",
	describe: "Delete Site LAN",
	usage:
		"$0 magic-transit sites lans delete <lan-id>\n\nRemove a specific Site LAN.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
