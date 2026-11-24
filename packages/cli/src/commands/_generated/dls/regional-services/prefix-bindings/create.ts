/**
 * create command
 * @generated from apis/overlays/dls.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cidr: {
			kind: "parsed",
			brief: "IP prefix in CIDR notation to bind.",
			optional: true,
			parse: String,
		},
		"prefix-id": {
			kind: "parsed",
			brief: "The ID of the parent IP prefix that contains the CIDR.",
			optional: true,
			parse: String,
		},
		"region-key": {
			kind: "parsed",
			brief: 'Region key from managed regions (e.g., "us", "eu").',
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
	describe: "Create a DLS prefix binding",
	usage:
		"$0 dls regional-services prefix-bindings create\n\nBind a CIDR from a BYOIP prefix to a region. This requires the **IP Prefixes Write** permission in addition to **DLS Write**, because the binding is created against a BYOIP prefix in Addressing.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
