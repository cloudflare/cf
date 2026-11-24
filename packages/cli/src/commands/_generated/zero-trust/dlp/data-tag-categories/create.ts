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
		tags: {
			kind: "parsed",
			brief:
				'Tags to create with the category. Mutually exclusive with `template_id`. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "description"?: (string | null)}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"template-id": {
			kind: "parsed",
			brief: "The template_id field",
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
			brief: "Attributes of the new data tag category.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Creates a new data tag category.",
	usage:
		"$0 zero-trust dlp data-tag-categories create\n\nCreates a data tag category, optionally from a template.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
