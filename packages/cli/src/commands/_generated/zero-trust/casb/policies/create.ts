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
		"finding-type-id": {
			kind: "parsed",
			brief:
				"The finding type this policy is associated with. All remediation actions must match this finding type.",
			optional: true,
			parse: String,
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
			brief: "Request body for creating a new policy configuration.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create a new policy configuration",
	usage:
		"$0 zero-trust casb policies create\n\nCreates a new policy configuration that defines automated actions to be executed when security findings are detected. A policy can include multiple remediation and/or webhook actions that will be triggered automatically.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
