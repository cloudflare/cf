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
		"integration-config-gitlab-group-ids": {
			kind: "parsed",
			brief:
				"Selected top-level GitLab group IDs as string-encoded positive integers.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"integration-config-gitlab-project-ids": {
			kind: "parsed",
			brief: "Selected GitLab project IDs as string-encoded positive integers.",
			variadic: true,
			optional: true,
			parse: String,
		},
		credentials: {
			kind: "parsed",
			brief:
				'Partial credential fields to merge with existing. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"dlp-profiles": {
			kind: "parsed",
			brief: "List of DLP profile IDs to associate with the integration.",
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
			brief: "List of permission scopes granted to the integration.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"use-cases": {
			kind: "parsed",
			brief:
				"List of use case or feature slugs to enroll (e.g., ['casb', 'ces', 'auto_remediation']).",
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
			brief: "Serializer for v2 integration PATCH requests.",
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
	operands: [{ placeholder: "id", brief: "Integration ID.", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <id>",
	describe: "Update integration",
	usage:
		"$0 zero-trust casb integrations update <id>\n\nUpdates an integration's name, permissions, DLP profiles, use cases, credentials, or GitLab resources.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
