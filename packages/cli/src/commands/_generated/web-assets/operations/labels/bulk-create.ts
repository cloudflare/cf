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
		"managed-labels": {
			kind: "parsed",
			brief: "List of managed label names.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"user-labels": {
			kind: "parsed",
			brief: "List of user label names.",
			variadic: true,
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
	command: "bulk-create",
	describe: "Attach labels to web or API operations",
	usage:
		"$0 web-assets operations labels bulk-create\n\nAttaches labels to multiple web or API operations in one request.",
	...parameters,
	loader: () => import("./bulk-create.handler.js"),
});

export default command;
