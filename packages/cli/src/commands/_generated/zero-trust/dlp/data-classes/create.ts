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
		"data-tags": {
			kind: "parsed",
			brief: "The data_tags field",
			variadic: true,
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		expression: {
			kind: "parsed",
			brief: "The expression field",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
			optional: true,
			parse: String,
		},
		"sensitivity-levels": {
			kind: "parsed",
			brief:
				'The sensitivity_levels field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"group_id": string, "level_id": string}].',
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
			brief: "Attributes of the new data class.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Creates a new data class",
	usage:
		"$0 zero-trust dlp data-classes create\n\nCreates a data class for use in DLP profiles.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
