import operation from "../../_operations/pages/deployments/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/pages.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pages deployments create <project-name>\n\nCreate a Cloudflare Pages deployment from a Git branch or Direct Upload manifest. Git repositories must already be authorized in Cloudflare Pages."
		)
		.positional("project-name", {
			type: "string",
			description:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		})
		.option("branch", {
			type: "string",
			description:
				"Git branch to deploy. Uses the branch's \`HEAD\`; defaults to the project's production branch.",
		})
		.option("commit-dirty", {
			type: "string",
			description:
				"Whether the associated Git working tree has uncommitted changes. Provide \`true\` or \`false\`.",
		})
		.option("commit-hash", {
			type: "string",
			description: "Git commit SHA associated with the deployment.",
		})
		.option("commit-message", {
			type: "string",
			description: "Git commit message associated with the deployment.",
		})
		.option("manifest", {
			type: "string",
			description:
				"JSON-encoded object mapping deployment file paths to their uploaded content hashes. Required for Direct Upload deployments. Maximum 20,000 entries. ",
		})
		.option("pages-build-output-dir", {
			type: "string",
			description: "The build output directory path.",
		})
		.option("wrangler-config-hash", {
			type: "string",
			description:
				"Hash of the Wrangler configuration file used for this deployment.",
		})
		.option("redirects", {
			type: "string",
			description:
				"Literal content or @path/to/file for the `_redirects` form field. Redirects configuration file for the deployment.",
		})
		.option("routes-json", {
			type: "string",
			description:
				"Literal content or @path/to/file for the `_routes.json` form field. Routes configuration file defining routing rules.",
		})
		.option("worker-bundle", {
			type: "string",
			description:
				"Literal content or @path/to/file for the `_worker.bundle` form field. Worker bundle file in multipart/form-data format. Mutually exclusive with `_worker.js`.\nCannot specify both `_worker.js` and `_worker.bundle` in the same request.\nMaximum size: 25 MiB.\n",
		})
		.option("worker-js", {
			type: "string",
			description:
				"Literal content or @path/to/file for the `_worker.js` form field. Worker JavaScript file. Mutually exclusive with `_worker.bundle`.\nCannot specify both `_worker.js` and `_worker.bundle` in the same request.\n",
		})
		.option("functions-filepath-routing-config-json", {
			type: "string",
			description:
				"Literal content or @path/to/file for the `functions-filepath-routing-config.json` form field. Functions routing configuration file.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <project-name>",
	describe: "Create a Pages deployment",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pages deployments create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pages deployments create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects/${argv["project-name"] == null ? "<project-name>" : encodeURIComponent(String(argv["project-name"]))}/deployments`,
						pathParams: { "project-name": String(argv["project-name"] ?? "") },
						bodyKind: "multipart",
						body: {
							body: argv["body"],
							file: argv["file"],
							branch: argv["branch"],
							"commit-dirty": argv["commit-dirty"],
							"commit-hash": argv["commit-hash"],
							"commit-message": argv["commit-message"],
							manifest: argv["manifest"],
							"pages-build-output-dir": argv["pages-build-output-dir"],
							"wrangler-config-hash": argv["wrangler-config-hash"],
							redirects: argv["redirects"],
							"routes-json": argv["routes-json"],
							"worker-bundle": argv["worker-bundle"],
							"worker-js": argv["worker-js"],
							"functions-filepath-routing-config-json":
								argv["functions-filepath-routing-config-json"],
						},
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					argv.file !== undefined ||
					argv.body !== undefined ||
					argv["branch"] !== undefined ||
					argv["commit-dirty"] !== undefined ||
					argv["commit-hash"] !== undefined ||
					argv["commit-message"] !== undefined ||
					argv["manifest"] !== undefined ||
					argv["pages-build-output-dir"] !== undefined ||
					argv["wrangler-config-hash"] !== undefined ||
					argv["redirects"] !== undefined ||
					argv["routes-json"] !== undefined ||
					argv["worker-bundle"] !== undefined ||
					argv["worker-js"] !== undefined ||
					argv["functions-filepath-routing-config-json"] !== undefined
				) {
					const formData = new FormData();
					if (argv.file) {
						const fileContent = readFileForFlag(argv.file);
						formData.append(
							"_headers",
							new Blob([fileContent]),
							argv.file.split(/[\\/]/).filter(Boolean).pop()
						);
					} else if (argv.body !== undefined) {
						formData.append("_headers", argv.body);
					}
					if (argv["branch"] !== undefined)
						formData.append(
							"branch",
							String(
								resolveFileToken(
									argv["branch"] as string | undefined,
									"branch",
									"text"
								) ?? ""
							)
						);
					if (argv["commit-dirty"] !== undefined)
						formData.append(
							"commit_dirty",
							String(
								resolveFileToken(
									argv["commit-dirty"] as string | undefined,
									"commit-dirty",
									"text"
								) ?? ""
							)
						);
					if (argv["commit-hash"] !== undefined)
						formData.append(
							"commit_hash",
							String(
								resolveFileToken(
									argv["commit-hash"] as string | undefined,
									"commit-hash",
									"text"
								) ?? ""
							)
						);
					if (argv["commit-message"] !== undefined)
						formData.append(
							"commit_message",
							String(
								resolveFileToken(
									argv["commit-message"] as string | undefined,
									"commit-message",
									"text"
								) ?? ""
							)
						);
					if (argv["manifest"] !== undefined)
						formData.append(
							"manifest",
							String(
								resolveFileToken(
									argv["manifest"] as string | undefined,
									"manifest",
									"text"
								) ?? ""
							)
						);
					if (argv["pages-build-output-dir"] !== undefined)
						formData.append(
							"pages_build_output_dir",
							String(
								resolveFileToken(
									argv["pages-build-output-dir"] as string | undefined,
									"pages-build-output-dir",
									"text"
								) ?? ""
							)
						);
					if (argv["wrangler-config-hash"] !== undefined)
						formData.append(
							"wrangler_config_hash",
							String(
								resolveFileToken(
									argv["wrangler-config-hash"] as string | undefined,
									"wrangler-config-hash",
									"text"
								) ?? ""
							)
						);
					if (argv["redirects"] !== undefined) {
						const value = String(argv["redirects"]);
						if (value.startsWith("@")) {
							const filePath = value.slice(1);
							const fileContent = resolveFileToken(
								value,
								"redirects",
								"binary"
							) as Buffer<ArrayBuffer>;
							formData.append(
								"_redirects",
								new Blob([fileContent]),
								filePath.split(/[\\/]/).filter(Boolean).pop()
							);
						} else {
							formData.append("_redirects", new Blob([value]), "_redirects");
						}
					}
					if (argv["routes-json"] !== undefined) {
						const value = String(argv["routes-json"]);
						if (value.startsWith("@")) {
							const filePath = value.slice(1);
							const fileContent = resolveFileToken(
								value,
								"routes-json",
								"binary"
							) as Buffer<ArrayBuffer>;
							formData.append(
								"_routes.json",
								new Blob([fileContent]),
								filePath.split(/[\\/]/).filter(Boolean).pop()
							);
						} else {
							formData.append(
								"_routes.json",
								new Blob([value]),
								"_routes.json"
							);
						}
					}
					if (argv["worker-bundle"] !== undefined) {
						const value = String(argv["worker-bundle"]);
						if (value.startsWith("@")) {
							const filePath = value.slice(1);
							const fileContent = resolveFileToken(
								value,
								"worker-bundle",
								"binary"
							) as Buffer<ArrayBuffer>;
							formData.append(
								"_worker.bundle",
								new Blob([fileContent]),
								filePath.split(/[\\/]/).filter(Boolean).pop()
							);
						} else {
							formData.append(
								"_worker.bundle",
								new Blob([value]),
								"_worker.bundle"
							);
						}
					}
					if (argv["worker-js"] !== undefined) {
						const value = String(argv["worker-js"]);
						if (value.startsWith("@")) {
							const filePath = value.slice(1);
							const fileContent = resolveFileToken(
								value,
								"worker-js",
								"binary"
							) as Buffer<ArrayBuffer>;
							formData.append(
								"_worker.js",
								new Blob([fileContent]),
								filePath.split(/[\\/]/).filter(Boolean).pop()
							);
						} else {
							formData.append("_worker.js", new Blob([value]), "_worker.js");
						}
					}
					if (argv["functions-filepath-routing-config-json"] !== undefined) {
						const value = String(
							argv["functions-filepath-routing-config-json"]
						);
						if (value.startsWith("@")) {
							const filePath = value.slice(1);
							const fileContent = resolveFileToken(
								value,
								"functions-filepath-routing-config-json",
								"binary"
							) as Buffer<ArrayBuffer>;
							formData.append(
								"functions-filepath-routing-config.json",
								new Blob([fileContent]),
								filePath.split(/[\\/]/).filter(Boolean).pop()
							);
						} else {
							formData.append(
								"functions-filepath-routing-config.json",
								new Blob([value]),
								"functions-filepath-routing-config.json"
							);
						}
					}
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/pages/projects/${encodeURIComponent(String(argv["project-name"]))}/deployments`,
							{ body: formData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/pages/projects/${encodeURIComponent(String(argv["project-name"]))}/deployments`,
							{
								body: bodyData,
								headers: { "Content-Type": "multipart/form-data" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						account_id: accountId,
						project_name: argv["project-name"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
