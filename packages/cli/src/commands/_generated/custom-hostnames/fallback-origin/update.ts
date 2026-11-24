/**
 * update command
 * @generated from apis/overlays/custom-hostnames.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		origin: {
			kind: "parsed",
			brief:
				"Your origin hostname that requests to your custom hostnames will be sent to.",
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
	command: "update",
	describe: "Update Fallback Origin for Custom Hostnames",
	usage:
		"$0 custom-hostnames fallback-origin update\n\nUpdates the fallback origin configuration for custom hostnames on a zone. Sets the default origin server for custom hostname traffic.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
