/**
 * edit command
 * @generated from apis/overlays/dns.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "The name of the view.",
			optional: true,
			parse: String,
		},
		zones: {
			kind: "parsed",
			brief: "The list of zones linked to this view.",
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
	operands: [{ placeholder: "view-id", brief: "Identifier.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <view-id>",
	describe: "Update Internal DNS View",
	usage: "$0 dns views edit <view-id>\n\nUpdate an existing Internal DNS View",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
