/**
 * update command
 * @generated from apis/overlays/cloudforce-one.ts
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
		schema: {
			kind: "parsed",
			brief:
				'Optional array of FieldDefinition objects. When provided, replaces the existing field schema. When omitted, the existing schema is preserved. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"key": string, "kind": "string" | "number" | "enum" | ...more, "allowedValues"?: [string], "annotations"?: {...}, "deprecated"?: boolean, ...more}]. ? marks optional keys.',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
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
	command: "update <category-uuid>",
	describe: "Update a tag category",
	usage:
		"$0 cloudforce-one threat-intel tags categories update <category-uuid>\n\nUpdates the given fields of a tag category and leaves the other fields unchanged.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
