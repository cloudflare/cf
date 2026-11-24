/**
 * list command
 * @generated from apis/overlays/magic-transit.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "The page number for pagination. Defaults to 1.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"The number of items per page. Must be between 10 and 1000. Defaults to 25.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "parsed",
			brief: "The field to order by. Defaults to 'prefix'.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "parsed",
			brief: "The direction of ordering (ASC or DESC). Defaults to 'ASC'.",
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
	describe: "List all TCP Flow Protection rules.",
	usage:
		"$0 magic-transit advanced-tcp-protection configs tcp flow protection rules list\n\nList all TCP Flow Protection rules for an account.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
