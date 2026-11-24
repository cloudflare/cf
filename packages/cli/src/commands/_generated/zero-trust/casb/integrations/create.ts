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
		application: {
			kind: "parsed",
			brief:
				"Vendor/application slug (e.g., GOOGLE_WORKSPACE).\n\n* `ANTHROPIC` - ANTHROPIC\n* `AWS` - AWS\n* `BITBUCKET` - BITBUCKET\n* `BOX` - BOX\n* `CONFLUENCE` - CONFLUENCE\n* `DROPBOX` - DROPBOX\n* `GITHUB` - GITHUB\n* `GOOGLE_CLOUD_PLATFORM` - GOOGLE_CLOUD_PLATFORM\n* `GOOGLE_WORKSPACE` - GOOGLE_WORKSPACE\n* `JIRA` - JIRA\n* `MICROSOFT_INTERNAL` - MICROSOFT_INTERNAL\n* `OPENAI` - OPENAI\n* `SALESFORCE` - SALESFORCE\n* `SERVICENOW` - SERVICENOW\n* `SLACK` - SLACK\n* `ZOOM` - ZOOM",
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
				"MICROSOFT_INTERNAL",
				"OPENAI",
				"SALESFORCE",
				"SERVICENOW",
				"SLACK",
				"ZOOM",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "application", "text"),
		},
		"auth-method": {
			kind: "parsed",
			brief: "Authentication method slug (uses default if omitted).",
			optional: true,
			parse: String,
		},
		credentials: {
			kind: "parsed",
			brief:
				'Credentials for the integration. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"dlp-profiles": {
			kind: "parsed",
			brief: "List of DLP profile IDs to associate.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the integration.",
			optional: true,
			parse: String,
		},
		permissions: {
			kind: "parsed",
			brief: "List of permission scopes (uses policy defaults if empty).",
			variadic: true,
			optional: true,
			parse: String,
		},
		"use-cases": {
			kind: "parsed",
			brief:
				"List of use case or feature slugs to enroll. At least one use case (casb, ces) is required; auto_remediation may be added alongside casb (e.g., ['casb', 'ces', 'auto_remediation']).",
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
			brief: "Serializer for v2 integration create requests.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create integration",
	usage:
		"$0 zero-trust casb integrations create\n\nCreates a new integration for the specified application. For other auth methods, use `GET /v2/applications/{application_id}/credential-guide` to see the required credential structure and example payloads for each vendor.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
