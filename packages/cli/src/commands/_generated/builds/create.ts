import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds create <worker>\n\nStart a production build for a branch or commit."
		)
		.positional("worker", {
			type: "string",
			description: "Script tag of the Worker.",
			demandOption: true,
		})
		.option("branch", {
			type: "string",
			description: "Git branch name (required if commit_hash not provided)",
		})
		.option("commit-hash", {
			type: "string",
			description: "Git commit hash (required if branch not provided)",
		})
		.option("seed-repo-branch", {
			type: "string",
			description: "Repository branch to seed.",
		})
		.option("seed-repo-files", {
			type: "string",
			description:
				'Files to add or replace for this build. Maximum 2. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content": string, "filename": string, "isBase64"?: boolean, "replace"?: string}]. ? marks optional keys.',
		})
		.option("seed-repo-owner", {
			type: "string",
			description: "Repository owner or namespace.",
		})
		.option("seed-repo-path", {
			type: "string",
			description: "Path within the repository to seed.",
		})
		.option("seed-repo-provider", {
			type: "string",
			description: "Source control provider for the seed repository.",
			choices: ["github", "gitlab"],
		})
		.coerce("seed-repo-provider", (value) =>
			resolveFileToken(value, "seed-repo-provider", "text")
		)
		.option("seed-repo-repository", {
			type: "string",
			description: "Repository name.",
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
		.check((argv) => {
			const groupSet = [
				"seed-repo-branch",
				"seed-repo-files",
				"seed-repo-owner",
				"seed-repo-path",
				"seed-repo-provider",
				"seed-repo-repository",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"seed-repo-owner",
					"seed-repo-provider",
					"seed-repo-repository",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --seed-repo-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <worker>",
	describe: "Start a Worker build",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds create",
				classification: {
					safeFlags: ["seed-repo-provider", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf builds create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/builds`,
						pathParams: { worker: String(argv["worker"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										branch: resolveFileToken(
											argv["branch"] as string | undefined,
											"branch",
											"text"
										),
										commit_hash: resolveFileToken(
											argv["commit-hash"] as string | undefined,
											"commit-hash",
											"text"
										),
										seed_repo: {
											branch: resolveFileToken(
												argv["seed-repo-branch"] as string | undefined,
												"seed-repo-branch",
												"text"
											),
											files: parseObjectArray(
												argv["seed-repo-files"],
												"seed-repo-files"
											),
											owner: resolveFileToken(
												argv["seed-repo-owner"] as string | undefined,
												"seed-repo-owner",
												"text"
											),
											path: resolveFileToken(
												argv["seed-repo-path"] as string | undefined,
												"seed-repo-path",
												"text"
											),
											provider: argv["seed-repo-provider"],
											repository: resolveFileToken(
												argv["seed-repo-repository"] as string | undefined,
												"seed-repo-repository",
												"text"
											),
										},
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/builds`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["branch"] !== undefined)
					setNestedValue(
						bodyData,
						["branch"],
						resolveFileToken(
							argv["branch"] as string | undefined,
							"branch",
							"text"
						)
					);
				if (argv["commit-hash"] !== undefined)
					setNestedValue(
						bodyData,
						["commit_hash"],
						resolveFileToken(
							argv["commit-hash"] as string | undefined,
							"commit-hash",
							"text"
						)
					);
				if (argv["seed-repo-branch"] !== undefined)
					setNestedValue(
						bodyData,
						["seed_repo", "branch"],
						resolveFileToken(
							argv["seed-repo-branch"] as string | undefined,
							"seed-repo-branch",
							"text"
						)
					);
				if (argv["seed-repo-files"] !== undefined)
					setNestedValue(
						bodyData,
						["seed_repo", "files"],
						parseObjectArray(argv["seed-repo-files"], "seed-repo-files")
					);
				if (argv["seed-repo-owner"] !== undefined)
					setNestedValue(
						bodyData,
						["seed_repo", "owner"],
						resolveFileToken(
							argv["seed-repo-owner"] as string | undefined,
							"seed-repo-owner",
							"text"
						)
					);
				if (argv["seed-repo-path"] !== undefined)
					setNestedValue(
						bodyData,
						["seed_repo", "path"],
						resolveFileToken(
							argv["seed-repo-path"] as string | undefined,
							"seed-repo-path",
							"text"
						)
					);
				if (argv["seed-repo-provider"] !== undefined)
					setNestedValue(
						bodyData,
						["seed_repo", "provider"],
						argv["seed-repo-provider"]
					);
				if (argv["seed-repo-repository"] !== undefined)
					setNestedValue(
						bodyData,
						["seed_repo", "repository"],
						resolveFileToken(
							argv["seed-repo-repository"] as string | undefined,
							"seed-repo-repository",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/builds`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
