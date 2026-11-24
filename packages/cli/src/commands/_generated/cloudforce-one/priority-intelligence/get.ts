/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
		{ placeholder: "priority-id", brief: "Priority ID", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <priority-id>",
	describe: "Get a priority intelligence requirement by ID",
	usage:
		"$0 cloudforce-one priority-intelligence get <priority-id>\n\nReturns a single Priority Intelligence Requirement for the authenticated account. For a structured PIR, `resolved` has its current generated requirement and event query, which follow later topic and profile changes.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
