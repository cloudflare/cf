import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create-build.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "builds previews create-build",
			classification: {
				safeFlags: ["seed-repo-provider", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf builds previews create-build",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/previews/${argv["preview"] == null ? "<preview>" : encodeURIComponent(String(argv["preview"]))}/builds`,
					pathParams: {
						worker: String(argv["worker"] ?? ""),
						preview: String(argv["preview"] ?? ""),
					},
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
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/previews/${encodeURIComponent(String(argv["preview"]))}/builds`,
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
					`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/previews/${encodeURIComponent(String(argv["preview"]))}/builds`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
