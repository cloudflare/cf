/**
 * update command
 * @generated from apis/overlays/web3.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		identifier: {
			kind: "parsed",
			brief: "Specify the identifier of the hostname.",
			parse: String,
		},
		content: {
			kind: "parsed",
			brief: "Specify the CID or content path of content to block.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Specify an optional description of the content list entry.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Specify the type of content list entry to block.",
			optional: true,
			choices: ["cid", "content_path"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
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
	command: "update <content-list-entry-identifier>",
	describe: "Edit IPFS Universal Path Gateway Content List Entry",
	usage:
		"$0 web3 hostnames ipfs-universal-paths content-lists entries update <content-list-entry-identifier>\n\nUpdates an IPFS Universal Path Gateway content list entry.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
