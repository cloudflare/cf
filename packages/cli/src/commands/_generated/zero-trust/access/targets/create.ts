/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		hostname: {
			kind: "parsed",
			brief:
				"A non-unique field that refers to a target. Case insensitive, maximum\nlength of 255 characters, supports the use of special characters dash\nand period, does not support spaces, and must start and end with an\nalphanumeric character.",
			optional: true,
			parse: String,
		},
		"ip-ipv4-ip-addr": {
			kind: "parsed",
			brief: "IP address of the target",
			optional: true,
			parse: String,
		},
		"ip-ipv4-virtual-network-id": {
			kind: "parsed",
			brief:
				"(optional) Private virtual network identifier for the target. If omitted, the default virtual network ID will be used.",
			optional: true,
			parse: String,
		},
		"ip-ipv6-ip-addr": {
			kind: "parsed",
			brief: "IP address of the target",
			optional: true,
			parse: String,
		},
		"ip-ipv6-virtual-network-id": {
			kind: "parsed",
			brief:
				"(optional) Private virtual network identifier for the target. If omitted, the default virtual network ID will be used.",
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Optional tags to associate with the target. Keys and values are\nuser-defined strings. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create new target",
	usage:
		"$0 zero-trust access targets create\n\nCreates a new infrastructure access target in the account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
