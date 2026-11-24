/**
 * get command
 * @generated from apis/overlays/zero-trust.ts
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
	},
	operands: [
		{
			placeholder: "knock-request-id",
			brief: "Knock request ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <knock-request-id>",
	describe: "Get an Access JIT request log",
	usage:
		"$0 zero-trust access logs jit-requests get <knock-request-id>\n\nGets an account-scoped Access JIT request summary and its lifecycle events in chronological order.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
