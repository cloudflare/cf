/**
 * create command
 * @generated from apis/overlays/scim.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create SCIM User",
	usage:
		"$0 scim users create\n\nProvisions a new account member via SCIM. The `userName` field must be a valid email address and must match the primary email in `emails`. The account must be an Enterprise account with SCIM entitlements enabled.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
