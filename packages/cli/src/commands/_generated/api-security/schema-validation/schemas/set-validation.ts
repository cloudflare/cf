/**
 * set-validation command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"validation-enabled": {
			kind: "boolean",
			brief: "Flag whether schema is enabled for validation.",
			optional: true,
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
			placeholder: "schema-id",
			brief: "The unique identifier of the schema",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "set-validation <schema-id>",
	describe: "Set schema validation state",
	usage:
		"$0 api-security schema-validation schemas set-validation <schema-id>\n\nEnables or disables validation for an uploaded OpenAPI schema without changing the schema document.",
	...parameters,
	loader: () => import("./set-validation.handler.js"),
});

export default command;
