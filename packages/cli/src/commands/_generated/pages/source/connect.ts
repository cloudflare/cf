/**
 * connect command
 * @generated from apis/overlays/pages.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"source-config-deployments-enabled": {
			kind: "boolean",
			brief:
				"Whether to enable automatic deployments when pushing to the source repository.\nWhen disabled, no deployments (production or preview) will be triggered automatically.\n",
			optional: true,
		},
		"source-config-owner": {
			kind: "parsed",
			brief: "The owner of the repository.",
			optional: true,
			parse: String,
		},
		"source-config-owner-id": {
			kind: "parsed",
			brief: "The owner ID of the repository.",
			optional: true,
			parse: String,
		},
		"source-config-path-excludes": {
			kind: "parsed",
			brief:
				"A list of paths that should be excluded from triggering a preview deployment. Wildcard syntax (`*`) is supported.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-config-path-includes": {
			kind: "parsed",
			brief:
				"A list of paths that should be watched to trigger a preview deployment. Wildcard syntax (`*`) is supported.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-config-pr-comments-enabled": {
			kind: "boolean",
			brief: "Whether to enable PR comments.",
			optional: true,
		},
		"source-config-preview-branch-excludes": {
			kind: "parsed",
			brief:
				"A list of branches that should not trigger a preview deployment. Wildcard syntax (`*`) is supported. Must be used with `preview_deployment_setting` set to `custom`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-config-preview-branch-includes": {
			kind: "parsed",
			brief:
				"A list of branches that should trigger a preview deployment. Wildcard syntax (`*`) is supported. Must be used with `preview_deployment_setting` set to `custom`.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-config-preview-deployment-setting": {
			kind: "parsed",
			brief:
				"Controls whether commits to preview branches trigger a preview deployment.",
			optional: true,
			choices: ["all", "none", "custom"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"source-config-preview-deployment-setting",
					"text"
				),
		},
		"source-config-production-branch": {
			kind: "parsed",
			brief: "The production branch of the repository.",
			optional: true,
			parse: String,
		},
		"source-config-production-deployments-enabled": {
			kind: "boolean",
			brief:
				"Whether to trigger a production deployment on commits to the production branch.",
			optional: true,
		},
		"source-config-repo-id": {
			kind: "parsed",
			brief: "The ID of the repository.",
			optional: true,
			parse: String,
		},
		"source-config-repo-name": {
			kind: "parsed",
			brief: "The name of the repository.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The source control management provider.",
			optional: true,
			choices: ["github", "gitlab"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Repository and deployment settings for connecting a Git repository to a Pages project.",
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
	command: "connect <project-name>",
	describe: "Connect a Git repository",
	usage:
		"$0 pages source connect <project-name>\n\nConnect a GitHub or GitLab repository to a Cloudflare Pages project to enable Git-based deployments.",
	...parameters,
	loader: () => import("./connect.handler.js"),
});

export default command;
