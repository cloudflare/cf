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
		"actions-remediation-types": {
			kind: "parsed",
			brief:
				'Remediation actions to execute (at most one). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"remediation_type_id": string}].',
			optional: true,
			parse: String,
		},
		"actions-webhook-configs": {
			kind: "parsed",
			brief:
				'Webhook actions to execute. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"webhook_config_id": string}].',
			optional: true,
			parse: String,
		},
		"applies-to-all-integrations": {
			kind: "boolean",
			brief:
				"When true, the policy applies to all integrations for the account. When false, integration_ids must be provided.",
			optional: true,
		},
		description: {
			kind: "parsed",
			brief: "Optional description of what this policy does.",
			optional: true,
			parse: String,
		},
		"display-name": {
			kind: "parsed",
			brief: "Display name for the policy configuration.",
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Boolean specifying if the policy is enabled or disabled.",
			optional: true,
		},
		"integration-ids": {
			kind: "parsed",
			brief:
				"The integrations this policy applies to. Required when applies_to_all_integrations is false.",
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
			brief: "Request body for updating an existing policy configuration.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "policy-id",
			brief: "Policy configuration ID",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <policy-id>",
	describe: "Update a policy configuration",
	usage:
		"$0 zero-trust casb policies update <policy-id>\n\nUpdates an existing policy configuration and replaces its actions.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
