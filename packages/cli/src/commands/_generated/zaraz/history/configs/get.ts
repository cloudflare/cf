/**
 * get command
 * @generated from apis/overlays/zaraz.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		ids: {
			kind: "parsed",
			brief: "Comma separated list of Zaraz configuration IDs.",
			variadic: true,
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
	command: "get",
	describe: "Get Zaraz historical configurations by ID(s)",
	usage:
		"$0 zaraz history configs get\n\nGets a history of published Zaraz configurations by ID(s) for a zone.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
