/**
 * update command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Script tag of the Worker.",
			parse: String,
		},
		"auto-build": {
			kind: "boolean",
			brief:
				"Whether pushes to the git branch build this Preview. Deploy hooks, manual builds, and retries run regardless of this setting.",
			optional: true,
		},
		"auto-delete": {
			kind: "boolean",
			brief: "Whether deleting the git branch also deletes this Preview.",
			optional: true,
		},
		branch: {
			kind: "parsed",
			brief: "Git branch this Preview tracks",
			optional: true,
			parse: String,
		},
		"settings-build-caching-enabled": {
			kind: "boolean",
			brief: "Whether builds reuse cached dependencies and build artifacts.",
			optional: true,
		},
		"settings-build-command": {
			kind: "parsed",
			brief: "Command to build the Worker.",
			optional: true,
			parse: String,
		},
		"settings-build-token-uuid": {
			kind: "parsed",
			brief: "UUID of the build token used when deploying the Worker.",
			optional: true,
			parse: String,
		},
		"settings-deploy-command": {
			kind: "parsed",
			brief: "Command to deploy the Worker.",
			optional: true,
			parse: String,
		},
		"settings-environment-variables": {
			kind: "parsed",
			brief:
				'Environment variable updates. Set the variable entry to null to delete it. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"settings-path-excludes": {
			kind: "parsed",
			brief: "Path patterns that must not start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"settings-path-includes": {
			kind: "parsed",
			brief: "Path patterns that can start builds.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"settings-root-directory": {
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
				"Request body for updating a Preview. At least one field must be provided, and omitted fields are left unchanged.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "preview", brief: "ID of the Preview.", parse: String },
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <preview>",
	describe: "Update preview",
	usage:
		"$0 builds previews update <preview>\n\nUpdate a single Preview of a Worker. Supports partial updates to the tracked branch, the automation flags, and the build settings.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
