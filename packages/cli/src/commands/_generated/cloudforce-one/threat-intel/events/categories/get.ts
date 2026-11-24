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
		{ placeholder: "category-id", brief: "Category UUID.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <category-id>",
	describe: "Get an event category",
	usage:
		"$0 cloudforce-one threat-intel events categories get <category-id>\n\nReturns an event category by its ID.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
