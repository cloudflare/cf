/**
 * list command
 * @generated from apis/overlays/ai.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		limit: {
			kind: "parsed",
			brief: "Pagination Limit.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief: "Pagination Offset.",
			optional: true,
			parse: Number,
		},
		"order-by": {
			kind: "parsed",
			brief: "Order By Column Name.",
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
	describe: "List Public Finetunes",
	usage:
		"$0 ai finetunes public list\n\nLists publicly available fine-tuned models that can be used with Workers AI.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
