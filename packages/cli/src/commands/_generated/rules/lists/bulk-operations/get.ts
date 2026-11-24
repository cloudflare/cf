/**
 * get command
 * @generated from apis/overlays/rules.ts
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
			placeholder: "operation-id",
			brief: "The unique operation ID of the asynchronous action.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <operation-id>",
	describe: "Get bulk operation status",
	usage:
		"$0 rules lists bulk-operations get <operation-id>\n\nGets the current status of an asynchronous operation on a list. The `status` property can have one of the following values: `pending`, `running`, `completed`, or `failed`. If the status is `failed`, the `error` property will contain a message describing the error.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
