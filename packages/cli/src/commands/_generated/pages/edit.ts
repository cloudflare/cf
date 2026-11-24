/**
 * edit command
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
		"build-config-build-caching": {
			kind: "boolean",
			brief: "Enable build caching for the project.",
			optional: true,
		},
		"build-config-build-command": {
			kind: "parsed",
			brief: "Command used to build project.",
			optional: true,
			parse: String,
		},
		"build-config-destination-dir": {
			kind: "parsed",
			brief: "Output directory of the build.",
			optional: true,
			parse: String,
		},
		"build-config-root-dir": {
			kind: "parsed",
			brief: "Directory to run the command.",
			optional: true,
			parse: String,
		},
		"build-config-web-analytics-tag": {
			kind: "parsed",
			brief: "The classifying tag for analytics.",
			optional: true,
			parse: String,
		},
		"build-config-web-analytics-token": {
			kind: "parsed",
			brief: "The auth token for analytics.",
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-ai-bindings": {
			kind: "parsed",
			brief:
				'Constellation bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-always-use-latest-compatibility-date": {
			kind: "boolean",
			brief:
				"Whether to always use the latest compatibility date for Pages Functions.",
			optional: true,
		},
		"deployment-configs-preview-analytics-engine-datasets": {
			kind: "parsed",
			brief:
				'Analytics Engine bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-browsers": {
			kind: "parsed",
			brief:
				'Browser bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-build-image-major-version": {
			kind: "parsed",
			brief:
				"The major version of the build image to use for Pages Functions. Version 1 is retired and its projects are moved to version 3. Once a project's builds have been moved, a request that sets version 1 is rejected.",
			optional: true,
			parse: Number,
		},
		"deployment-configs-preview-compatibility-date": {
			kind: "parsed",
			brief: "Compatibility date used for Pages Functions.",
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-compatibility-flags": {
			kind: "parsed",
			brief: "Compatibility flags used for Pages Functions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-d1-databases": {
			kind: "parsed",
			brief:
				'D1 databases used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-durable-object-namespaces": {
			kind: "parsed",
			brief:
				'Durable Object namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-env-vars": {
			kind: "parsed",
			brief:
				'Environment variables used for builds and Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-fail-open": {
			kind: "boolean",
			brief:
				"Whether to fail open when the deployment config cannot be applied.",
			optional: true,
		},
		"deployment-configs-preview-hyperdrive-bindings": {
			kind: "parsed",
			brief:
				'Hyperdrive bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-kv-namespaces": {
			kind: "parsed",
			brief:
				'KV namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-limits-cpu-ms": {
			kind: "parsed",
			brief: "CPU time limit in milliseconds.",
			optional: true,
			parse: Number,
		},
		"deployment-configs-preview-mtls-certificates": {
			kind: "parsed",
			brief:
				'mTLS bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-placement-mode": {
			kind: "parsed",
			brief: "Placement mode.",
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-queue-producers": {
			kind: "parsed",
			brief:
				'Queue Producer bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-r2-buckets": {
			kind: "parsed",
			brief:
				'R2 buckets used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-services": {
			kind: "parsed",
			brief:
				'Services used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-usage-model": {
			kind: "parsed",
			brief: "The usage model for Pages Functions.",
			optional: true,
			choices: ["standard", "bundled", "unbound"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"deployment-configs-preview-usage-model",
					"text"
				),
		},
		"deployment-configs-preview-vectorize-bindings": {
			kind: "parsed",
			brief:
				'Vectorize bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-preview-wrangler-config-hash": {
			kind: "parsed",
			brief: "Hash of the Wrangler configuration used for the deployment.",
			optional: true,
			parse: String,
		},
		"deployment-configs-production-ai-bindings": {
			kind: "parsed",
			brief:
				'Constellation bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-always-use-latest-compatibility-date": {
			kind: "boolean",
			brief:
				"Whether to always use the latest compatibility date for Pages Functions.",
			optional: true,
		},
		"deployment-configs-production-analytics-engine-datasets": {
			kind: "parsed",
			brief:
				'Analytics Engine bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-browsers": {
			kind: "parsed",
			brief:
				'Browser bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-build-image-major-version": {
			kind: "parsed",
			brief:
				"The major version of the build image to use for Pages Functions. Version 1 is retired and its projects are moved to version 3. Once a project's builds have been moved, a request that sets version 1 is rejected.",
			optional: true,
			parse: Number,
		},
		"deployment-configs-production-compatibility-date": {
			kind: "parsed",
			brief: "Compatibility date used for Pages Functions.",
			optional: true,
			parse: String,
		},
		"deployment-configs-production-compatibility-flags": {
			kind: "parsed",
			brief: "Compatibility flags used for Pages Functions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"deployment-configs-production-d1-databases": {
			kind: "parsed",
			brief:
				'D1 databases used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-durable-object-namespaces": {
			kind: "parsed",
			brief:
				'Durable Object namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-env-vars": {
			kind: "parsed",
			brief:
				'Environment variables used for builds and Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-fail-open": {
			kind: "boolean",
			brief:
				"Whether to fail open when the deployment config cannot be applied.",
			optional: true,
		},
		"deployment-configs-production-hyperdrive-bindings": {
			kind: "parsed",
			brief:
				'Hyperdrive bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-kv-namespaces": {
			kind: "parsed",
			brief:
				'KV namespaces used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-limits-cpu-ms": {
			kind: "parsed",
			brief: "CPU time limit in milliseconds.",
			optional: true,
			parse: Number,
		},
		"deployment-configs-production-mtls-certificates": {
			kind: "parsed",
			brief:
				'mTLS bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-placement-mode": {
			kind: "parsed",
			brief: "Placement mode.",
			optional: true,
			parse: String,
		},
		"deployment-configs-production-queue-producers": {
			kind: "parsed",
			brief:
				'Queue Producer bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-r2-buckets": {
			kind: "parsed",
			brief:
				'R2 buckets used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-services": {
			kind: "parsed",
			brief:
				'Services used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-usage-model": {
			kind: "parsed",
			brief: "The usage model for Pages Functions.",
			optional: true,
			choices: ["standard", "bundled", "unbound"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(
					value,
					"deployment-configs-production-usage-model",
					"text"
				),
		},
		"deployment-configs-production-vectorize-bindings": {
			kind: "parsed",
			brief:
				'Vectorize bindings used for Pages Functions. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": ({...} | null)}.',
			optional: true,
			parse: String,
		},
		"deployment-configs-production-wrangler-config-hash": {
			kind: "parsed",
			brief: "Hash of the Wrangler configuration used for the deployment.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"Name for the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			optional: true,
			parse: String,
		},
		"production-branch": {
			kind: "parsed",
			brief:
				"Production branch of the project. Used to identify production deployments.",
			optional: true,
			parse: String,
		},
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
		"source-type": {
			kind: "parsed",
			brief: "The source control management provider.",
			optional: true,
			choices: ["github", "gitlab"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "source-type", "text"),
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
	operands: [
		{
			placeholder: "project-name",
			brief:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			parse: String,
		},
	],
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"source-config-deployments-enabled",
				"source-config-owner",
				"source-config-owner-id",
				"source-config-path-excludes",
				"source-config-path-includes",
				"source-config-pr-comments-enabled",
				"source-config-preview-branch-excludes",
				"source-config-preview-branch-includes",
				"source-config-preview-deployment-setting",
				"source-config-production-branch",
				"source-config-production-deployments-enabled",
				"source-config-repo-id",
				"source-config-repo-name",
				"source-type",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["source-type"].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --source-* flag is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "edit <project-name>",
	describe: "Update a Cloudflare Pages project",
	usage:
		"$0 pages edit <project-name>\n\nUpdate the build, deployment, source, or environment settings for a Cloudflare Pages project. To delete an environment variable, set its key to `null`.",
	...parameters,
	loader: () => import("./edit.handler.js"),
});

export default command;
