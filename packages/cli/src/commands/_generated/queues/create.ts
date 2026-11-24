/**
 * create command
 * @generated from apis/overlays/queues.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		jurisdiction: {
			kind: "parsed",
			brief: "The jurisdiction field",
			optional: true,
			choices: ["eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		"queue-name": {
			kind: "parsed",
			brief: "The queue_name field",
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
	describe: "Create Queue",
	usage: "$0 queues create\n\nCreates a Queue in the account.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
