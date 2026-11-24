/**
 * bulk-create command
 * @generated from apis/overlays/web-assets.ts
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
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-create",
	describe: "Create user-defined operation labels",
	usage:
		"$0 web-assets labels user bulk-create\n\nCreates one or more user-defined labels for classifying web and API operations.",
	...parameters,
	loader: () => import("./bulk-create.handler.js"),
});

export default command;
