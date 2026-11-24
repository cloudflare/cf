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
		cursor: {
			kind: "parsed",
			brief:
				"Cursor for pagination. Obtained from the `result_info.cursor` field of a previous response.",
			optional: true,
			parse: String,
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
	describe: "List policy configurations",
	usage:
		"$0 zero-trust casb policies list\n\nReturns a list of integration-scoped policy configurations for the given account. This endpoint supports cursor based pagination. By default, results are returned in sorted order based on created_at.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
