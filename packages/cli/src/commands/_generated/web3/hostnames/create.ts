/**
 * create command
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
		description: {
			kind: "parsed",
			brief: "Specify an optional description of the hostname.",
			optional: true,
			parse: String,
		},
		dnslink: {
			kind: "parsed",
			brief: "Specify the DNSLink value used if the target is ipfs.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"Specify the hostname that points to the target gateway via CNAME.",
			optional: true,
			parse: String,
		},
		target: {
			kind: "parsed",
			brief: "Specify the target gateway of the hostname.",
			optional: true,
			choices: ["ethereum", "ipfs", "ipfs_universal_path"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "target", "text"),
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Web3 Hostname",
	usage:
		"$0 web3 hostnames create\n\nCreates a new Web3 hostname for serving decentralized web content.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
