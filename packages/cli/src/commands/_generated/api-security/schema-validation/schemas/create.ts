/**
 * create command
 * @generated from apis/overlays/api-security.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		kind: {
			kind: "parsed",
			brief: "The kind of the schema",
			optional: true,
			choices: ["openapi_v3"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "kind", "text"),
		},
		name: {
			kind: "parsed",
			brief: "A human-readable name for the schema",
			optional: true,
			parse: String,
		},
		source: {
			kind: "parsed",
			brief: "The raw schema, e.g., the OpenAPI schema, either as JSON or YAML",
			optional: true,
			parse: String,
		},
		"validation-enabled": {
			kind: "boolean",
			brief: "An indicator if this schema is enabled",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Upload a schema",
	usage:
		"$0 api-security schema-validation schemas create\n\nUploads an OpenAPI schema that defines expected request formats for API operations.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
