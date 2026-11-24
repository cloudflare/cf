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
		{
			placeholder: "category-uuid",
			brief: "Tag Category UUID.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <category-uuid>",
	describe: "Get a tag category",
	usage:
		"$0 cloudforce-one threat-intel tags categories get <category-uuid>\n\nReturns a tag category by its UUID, including the custom fields defined in its `schema`.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
