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
		"import-path": {
			kind: "parsed",
			brief:
				"Unique Rego import path in the form metadata.<segment>, with one alphanumeric or underscore segment. Reference it as data.<import_path>.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the rego metadata document (unique per account)",
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
	command: "create",
	describe: "Create a new rego metadata document",
	usage:
		"$0 zero-trust cws rego-metadata create\n\nCreates a JSON document that Rego can access through its import path.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
