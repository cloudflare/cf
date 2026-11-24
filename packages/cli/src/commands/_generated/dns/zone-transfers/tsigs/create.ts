/**
 * create command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		algo: {
			kind: "parsed",
			brief: "TSIG algorithm.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "TSIG key name.",
			optional: true,
			parse: String,
		},
		secret: {
			kind: "parsed",
			brief: "TSIG secret.",
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
	describe: "Create TSIG",
	usage: "$0 dns zone-transfers tsigs create\n\nCreate TSIG.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
