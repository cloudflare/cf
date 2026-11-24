/**
 * create command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"git-repository-branch": {
			kind: "parsed",
			brief: "Git branch to watch for builds",
			optional: true,
			parse: String,
		},
		"git-repository-provider-account-id": {
			kind: "parsed",
			brief:
				"Provider-specific identifier of the account or namespace that owns the repository.",
			optional: true,
			parse: String,
		},
		"git-repository-provider-account-name": {
			kind: "parsed",
			brief:
				"Human-readable name of the account or namespace that owns the repository.",
			optional: true,
			parse: String,
		},
		"git-repository-provider-type": {
			kind: "parsed",
			brief: "The git_repository.provider_type field",
			optional: true,
			choices: ["github", "gitlab", "gitlab_internal", "origin"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "git-repository-provider-type", "text"),
		},
		"git-repository-repo-id": {
			kind: "parsed",
			brief: "Provider-specific repository identifier.",
			optional: true,
			parse: String,
		},
		"git-repository-repo-name": {
			kind: "parsed",
			brief: "Human-readable repository name.",
			optional: true,
			parse: String,
		},
		"git-repository-grant-id": {
			kind: "parsed",
			brief: "Grant ID required for grant-backed providers",
			optional: true,
			parse: String,
		},
		"previews-base-config-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			default: true,
		},
		"previews-base-config-build-command": {
			kind: "parsed",
			brief: "Command to build the Worker.",
			optional: true,
			parse: String,
		},
		"previews-base-config-build-token-uuid": {
			kind: "parsed",
			brief: "UUID of the build token used when deploying the Worker.",
			optional: true,
			parse: String,
		},
		"previews-base-config-deploy-command": {
			kind: "parsed",
			brief: "Command to deploy the Worker.",
			optional: true,
			parse: String,
		},
		"previews-base-config-environment-variables": {
			kind: "parsed",
			brief:
				'Map of environment-variable names to build-time values. Names must begin with a letter or underscore and contain only letters, numbers, and underscores. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"previews-base-config-path-excludes": {
			kind: "parsed",
			brief: "Path patterns that must not start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"previews-base-config-path-includes": {
			kind: "parsed",
			brief: "Path patterns that can start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"previews-base-config-root-directory": {
			kind: "parsed",
			brief: "Repository directory in which build and deploy commands run.",
			default: "/",
			parse: String,
		},
		"previews-enabled": {
			kind: "boolean",
			brief: "Whether Previews are enabled for this Worker",
			optional: true,
		},
		"production-settings-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			default: true,
		},
		"production-settings-build-command": {
			kind: "parsed",
			brief: "Command to build the Worker.",
			optional: true,
			parse: String,
		},
		"production-settings-build-token-uuid": {
			kind: "parsed",
			brief: "UUID of the build token used when deploying the Worker.",
			optional: true,
			parse: String,
		},
		"production-settings-deploy-command": {
			kind: "parsed",
			brief: "Command to deploy the Worker.",
			optional: true,
			parse: String,
		},
		"production-settings-environment-variables": {
			kind: "parsed",
			brief:
				'Map of environment-variable names to build-time values. Names must begin with a letter or underscore and contain only letters, numbers, and underscores. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": {...}}.',
			optional: true,
			parse: String,
		},
		"production-settings-path-excludes": {
			kind: "parsed",
			brief: "Path patterns that must not start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"production-settings-path-includes": {
			kind: "parsed",
			brief: "Path patterns that can start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"production-settings-root-directory": {
			kind: "parsed",
			brief: "Repository directory in which build and deploy commands run.",
			default: "/",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Request body for creating a Worker build configuration.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "script-tag",
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <script-tag>",
	describe: "Create Worker build configuration",
	usage:
		"$0 builds workers create <script-tag>\n\nConnect a Worker tag to a repository and production build settings.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
