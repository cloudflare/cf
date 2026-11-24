/**
 * update command
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
		"applies-to-all-integrations": {
			kind: "boolean",
			brief:
				"When true, this finding type applies to every current and future integration of the vendor.",
			optional: true,
		},
		description: {
			kind: "parsed",
			brief:
				"Optional description of the finding type. Cannot be empty if provided. Maximum 4096 characters.",
			optional: true,
			parse: String,
		},
		"integration-ids": {
			kind: "parsed",
			brief:
				"Required and non-empty when applies_to_all_integrations is false; omit when it is true.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"Human-readable name for the finding type. Cannot be empty if provided. Maximum 256 characters.",
			optional: true,
			parse: String,
		},
		severity: {
			kind: "parsed",
			brief: "The severity level of a finding.",
			optional: true,
			choices: ["Critical", "High", "Medium", "Low"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "severity", "text"),
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
			placeholder: "finding-type-id",
			brief: "A UUID string identifying the finding type.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <finding-type-id>",
	describe: "Update a custom finding type",
	usage:
		"$0 zero-trust casb finding-types update <finding-type-id>\n\nUpdate an existing custom finding type. **Immutable fields**: asset_vendor, asset_class, expression, and category cannot be changed after creation. **Security**: Only custom finding types (not system-managed) can be updated.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
