import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
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
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"pages-deployment-create-deployment">;

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
					argv["wrangler-config-hash"] !== undefined
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
					client.pages.deployments.create({
						account_id: accountId,
						project_name: argv["project-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
