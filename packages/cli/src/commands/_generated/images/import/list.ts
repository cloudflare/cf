/**
 * list command
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List sourcing kit migrations",
	usage: "$0 images import list\n\nList CF Images imports.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
