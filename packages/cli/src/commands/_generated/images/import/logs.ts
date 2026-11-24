/**
 * logs command
 * @generated from apis/overlays/images.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		offset: {
			kind: "parsed",
			brief: "Number of items to skip before returning results.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of items to return.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "migration-id",
			brief: "Sourcing kit resource identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "logs <migration-id>",
	describe: "List migration logs",
	usage:
		"$0 images import logs <migration-id>\n\nList log entries for a CF Images import.",
	...parameters,
	loader: () => import("./logs.handler.js"),
});

export default command;
