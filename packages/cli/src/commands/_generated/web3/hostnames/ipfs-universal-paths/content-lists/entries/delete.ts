/**
 * delete command
 * @generated from apis/overlays/web3.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		identifier: {
			kind: "parsed",
			brief: "Specify the identifier of the hostname.",
			parse: String,
		},
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
		{
			placeholder: "content-list-entry-identifier",
			brief: "Specify the identifier of the hostname.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <content-list-entry-identifier>",
	describe: "Delete IPFS Universal Path Gateway Content List Entry",
	usage:
		"$0 web3 hostnames ipfs-universal-paths content-lists entries delete <content-list-entry-identifier>\n\nDeletes an entry from an IPFS Universal Path Gateway content list.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
