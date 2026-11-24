/**
 * bulk-create command
 * @generated from apis/overlays/rum.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"ruleset-id": {
			kind: "parsed",
			brief: "The Web Analytics ruleset identifier.",
			parse: String,
		},
		"delete-rules": {
			kind: "parsed",
			brief: "A list of rule identifiers to delete.",
			variadic: true,
			optional: true,
			parse: String,
		},
		rules: {
			kind: "parsed",
			brief:
				'A list of rules to create or update. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"host"?: string, "id"?: string, "inclusive"?: boolean, "is_paused"?: boolean, "paths"?: [string]}]. ? marks optional keys.',
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-create",
	describe: "Update Web Analytics rules",
	usage:
		"$0 rum rules bulk-create\n\nModifies one or more rules in a Web Analytics ruleset with a single request.",
	...parameters,
	loader: () => import("./bulk-create.handler.js"),
});

export default command;
