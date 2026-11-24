/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"sensitivity-group-id": {
			kind: "parsed",
			brief: "Sensitivity group ID",
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
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
			brief: "Attributes of the sensitivity level to update.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "sensitivity-level-id",
			brief: "Sensitivity level ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <sensitivity-level-id>",
	describe: "Update the attributes of a single sensitivity level.",
	usage:
		"$0 zero-trust dlp sensitivity-levels update <sensitivity-level-id>\n\nUpdates a sensitivity level in a group.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
