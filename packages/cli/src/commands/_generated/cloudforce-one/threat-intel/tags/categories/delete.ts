/**
 * delete command
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
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
	command: "delete <category-uuid>",
	describe: "Delete a tag category",
	usage:
		"$0 cloudforce-one threat-intel tags categories delete <category-uuid>\n\nDeletes a tag category by its UUID.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
