/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"policy-test-id": {
			kind: "parsed",
			brief: "The UUID of the policy test.",
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Per page",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief: "Filter users by their policy evaluation status.",
			values: ["success", "fail", "error"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "Get an Access policy test users page",
	usage:
		"$0 zero-trust access applications policy-tests users list\n\nFetches a single page of user results from an Access policy test.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
