/**
 * validate command
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
		"asset-class": {
			kind: "parsed",
			brief:
				"Asset class this finding type applies to (PascalCase, e.g. GoogleWorkspaceFile)",
			optional: true,
			parse: String,
		},
		"asset-vendor": {
			kind: "parsed",
			brief: "Vendors whose assets a finding type can evaluate.",
			optional: true,
			choices: [
				"ANTHROPIC",
				"AWS",
				"BITBUCKET",
				"BOX",
				"CONFLUENCE",
				"DROPBOX",
				"GITHUB",
				"GOOGLE_CLOUD_PLATFORM",
				"GOOGLE_WORKSPACE",
				"JIRA",
				"MICROSOFT",
				"OPENAI",
				"SALESFORCE",
				"SERVICENOW",
				"SLACK",
				"ZOOM",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "asset-vendor", "text"),
		},
		description: {
			kind: "parsed",
			brief:
				"Human-readable description of the finding type. Cannot be empty. Maximum 4096 characters.",
			optional: true,
			parse: String,
		},
		expression: {
			kind: "parsed",
			brief:
				"Rego expression body for the policy. `package cloudflare.casb.custom` and `import rego.v1` are added automatically. Do not include package or import declarations. This field cannot be changed after creation. Maximum 4096 characters.",
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
				"Human-readable name for the finding type. Maximum 256 characters.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "validate",
	describe: "Validate a custom finding type",
	usage:
		"$0 zero-trust casb finding-types validate\n\nCheck a candidate custom finding type without creating it, so problems can be corrected before publishing. The request body is the same shape as `CreateFindingType`, and the candidate is checked against the same rules, so a valid result means the definition itself is sound. It is not a reservation: a create can still be rejected for a reason that does not belong to the definition, such as the account already holding the maximum number of custom finding types. A candidate that fails validation is still a **200** with `result.valid: false` and one entry in `result.errors` per problem — that is the answer this endpoint exists to give. `4xx` is reserved for a request that could not be processed at all, such as a body that will not parse.",
	...parameters,
	loader: () => import("./validate.handler.js"),
});

export default command;
