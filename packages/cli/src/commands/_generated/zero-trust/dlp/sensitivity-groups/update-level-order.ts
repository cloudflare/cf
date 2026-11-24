/**
 * update-level-order command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"level-ids": {
			kind: "parsed",
			brief: "The level_ids field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Desired ordered list of level IDs.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "sensitivity-group-id",
			brief: "Sensitivity group ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update-level-order <sensitivity-group-id>",
	describe: "Set the ordering of levels within a sensitivity group.",
	usage:
		"$0 zero-trust dlp sensitivity-groups update-level-order <sensitivity-group-id>\n\nUpdates the order of sensitivity levels in a group.",
	...parameters,
	loader: () => import("./update-level-order.handler.js"),
});

export default command;
