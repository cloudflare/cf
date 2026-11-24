/**
 * edit command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"patch-existing-previews": {
			kind: "enum",
			brief:
				"Apply a previews_base_config patch to every existing Preview of the Worker as well as to the base config.",
			values: ["true", "false"],
			optional: true,
		},
		"git-repository-branch": {
			kind: "parsed",
			brief: "New git branch to watch for builds",
			optional: true,
			parse: String,
		},
		"previews-base-config-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			optional: true,
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
				'Environment variable updates. Set the variable entry to null to delete it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
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
			optional: true,
			parse: String,
		},
		"previews-enabled": {
			kind: "boolean",
			brief:
				"Enable or disable Previews for this Worker. Enabling requires previews_base_config to already exist or to be sent in the same request.",
			optional: true,
		},
		"production-settings-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			optional: true,
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
				'Environment variable updates. Set the variable entry to null to delete it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
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
			brief:
				"Request body for updating a Worker build configuration. At least one field must be provided.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "worker",
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <worker>",
	describe: "Update Worker build configuration",
	usage:
		"$0 builds workers edit <worker>\n\nUpdate the build configuration for a Worker script. Supports partial updates to git repository settings, production build settings, and Preview settings.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
