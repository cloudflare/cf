/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		description: {
			kind: "parsed",
			brief: "Provide the list description.",
			optional: true,
			parse: String,
		},
		items: {
			kind: "parsed",
			brief:
				'Add items to the list. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"description"?: string, "value"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Specify the list name.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Specify the list type.",
			optional: true,
			choices: [
				"SERIAL",
				"URL",
				"DOMAIN",
				"EMAIL",
				"IP",
				"CATEGORY",
				"LOCATION",
				"DEVICE",
				"AAGUID",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Zero Trust list",
	usage: "$0 zero-trust gateway lists create\n\nCreates a new Zero Trust list.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
