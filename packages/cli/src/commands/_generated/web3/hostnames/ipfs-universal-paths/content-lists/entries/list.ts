/**
 * list command
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List IPFS Universal Path Gateway Content List Entries",
	usage:
		"$0 web3 hostnames ipfs-universal-paths content-lists entries list\n\nLists entries in an IPFS Universal Path Gateway content list.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
