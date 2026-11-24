/**
 * create command
 * @generated from apis/overlays/pages.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		branch: {
			kind: "parsed",
			brief:
				"Git branch to deploy. Uses the branch's `HEAD`; defaults to the project's production branch.",
			optional: true,
			parse: String,
		},
		"commit-dirty": {
			kind: "parsed",
			brief:
				"Whether the associated Git working tree has uncommitted changes. Provide `true` or `false`.",
			optional: true,
			parse: String,
		},
		"commit-hash": {
			kind: "parsed",
			brief: "Git commit SHA associated with the deployment.",
			optional: true,
			parse: String,
		},
		"commit-message": {
			kind: "parsed",
			brief: "Git commit message associated with the deployment.",
			optional: true,
			parse: String,
		},
		manifest: {
			kind: "parsed",
			brief:
				"JSON-encoded object mapping deployment file paths to their uploaded content hashes. Required for Direct Upload deployments. Maximum 20,000 entries. ",
			optional: true,
			parse: String,
		},
		"pages-build-output-dir": {
			kind: "parsed",
			brief: "The build output directory path.",
			optional: true,
			parse: String,
		},
		"wrangler-config-hash": {
			kind: "parsed",
			brief:
				"Hash of the Wrangler configuration file used for this deployment.",
			optional: true,
			parse: String,
		},
		redirects: {
			kind: "parsed",
			brief:
				"Literal content or @path/to/file for the `_redirects` form field. Redirects configuration file for the deployment.",
			optional: true,
			parse: String,
		},
		"routes-json": {
			kind: "parsed",
			brief:
				"Literal content or @path/to/file for the `_routes.json` form field. Routes configuration file defining routing rules.",
			optional: true,
			parse: String,
		},
		"worker-bundle": {
			kind: "parsed",
			brief:
				"Literal content or @path/to/file for the `_worker.bundle` form field. Worker bundle file in multipart/form-data format. Mutually exclusive with `_worker.js`.\nCannot specify both `_worker.js` and `_worker.bundle` in the same request.\nMaximum size: 25 MiB.\n",
			optional: true,
			parse: String,
		},
		"worker-js": {
			kind: "parsed",
			brief:
				"Literal content or @path/to/file for the `_worker.js` form field. Worker JavaScript file. Mutually exclusive with `_worker.bundle`.\nCannot specify both `_worker.js` and `_worker.bundle` in the same request.\n",
			optional: true,
			parse: String,
		},
		"functions-filepath-routing-config-json": {
			kind: "parsed",
			brief:
				"Literal content or @path/to/file for the `functions-filepath-routing-config.json` form field. Functions routing configuration file.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "project-name",
			brief:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create <project-name>",
	describe: "Create a Pages deployment",
	usage:
		"$0 pages deployments create <project-name>\n\nCreate a Cloudflare Pages deployment from a Git branch or Direct Upload manifest. Git repositories must already be authorized in Cloudflare Pages.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
