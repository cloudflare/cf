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
		action: {
			kind: "parsed",
			brief: "Behavior of the content list.",
			optional: true,
			choices: ["block"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		entries: {
			kind: "parsed",
			brief:
				'Provides content list entries. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content"?: string, "description"?: string, "type"?: "cid" | "content_path"}]. ? marks optional keys.',
			optional: true,
			parse: String,
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
			placeholder: "identifier",
			brief: "Specify the identifier of the hostname.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <identifier>",
	describe: "Update IPFS Universal Path Gateway Content List",
	usage:
		"$0 web3 hostnames ipfs-universal-paths content-lists update <identifier>\n\nUpdates the IPFS Universal Path Gateway content list for a Web3 hostname.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
