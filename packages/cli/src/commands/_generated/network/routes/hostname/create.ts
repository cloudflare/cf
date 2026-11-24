/**
 * create command
 * @generated from apis/overlays/network.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		comment: {
			kind: "parsed",
			brief: "An optional description of the hostname route.",
			default: "",
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief: "The hostname of the route.",
			optional: true,
			parse: String,
		},
		"tunnel-id": {
			kind: "parsed",
			brief: "UUID of the tunnel.",
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
	describe: "Create hostname route",
	usage: "$0 network routes hostname create\n\nCreate a hostname route.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
