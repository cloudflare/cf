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
		"finding-instance-ids": {
			kind: "parsed",
			brief: "UUIDs identifying Finding Instances.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"remediation-type-id": {
			kind: "parsed",
			brief: "A UUID identifying this Remediation Type.",
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
			brief: "Request body for creating remediation jobs.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Creates remediation jobs",
	usage:
		"$0 zero-trust casb remediations jobs create\n\nCreate one or more remediation jobs tied to a specific Cloudflare Account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
