/**
 * delete command
 * @generated from apis/overlays/dns.ts
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
	operands: [{ placeholder: "tsig-id", brief: "Tsig ID", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <tsig-id>",
	describe: "Delete TSIG",
	usage: "$0 dns zone-transfers tsigs delete <tsig-id>\n\nDelete TSIG.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
