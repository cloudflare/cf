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
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		levels: {
			kind: "parsed",
			brief:
				'The desired final state of levels.\n- `None` (omitted): no level changes.\n- `Some([])`: delete all levels.\n- `Some([...])`: desired final set + order. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [({"description"?: (string | null), "name"?: (string | null)} & {"id"?: (string | null)})]. ? marks optional keys.',
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
			brief: "Attributes of the sensitivity group to update.",
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
	command: "update <sensitivity-group-id>",
	describe: "Update the attributes of a single sensitivity group.",
	usage:
		"$0 zero-trust dlp sensitivity-groups update <sensitivity-group-id>\n\nUpdates a sensitivity group and its levels.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
