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
		"user-population-id": { kind: "parsed", brief: "UUID.", parse: String },
		operations: {
			kind: "parsed",
			brief:
				'The Operations field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"op": "add" | "remove" | "replace", "path"?: string, "value"?: (string | number | boolean | ...more)}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		schemas: {
			kind: "parsed",
			brief: "The schemas field",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "user-id",
			brief: "The SCIM user identifier.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <user-id>",
	describe: "Update a user population user",
	usage:
		"$0 zero-trust access user-populations users update <user-id>\n\nUpdates a SCIM user in a user population.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
