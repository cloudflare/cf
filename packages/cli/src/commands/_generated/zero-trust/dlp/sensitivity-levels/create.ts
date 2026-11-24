/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
			brief: "Attributes of the new sensitivity level.",
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
	command: "create <sensitivity-group-id>",
	describe: "Creates a new sensitivity level.",
	usage:
		"$0 zero-trust dlp sensitivity-levels create <sensitivity-group-id>\n\nCreates a sensitivity level in a group.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
