import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
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
			command: "builds previews update",
			classification: {
				safeFlags: [
					"auto-build",
					"auto-delete",
					"settings-build-caching-enabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf builds previews update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/previews/${argv["preview"] == null ? "<preview>" : encodeURIComponent(String(argv["preview"]))}`,
					pathParams: {
						worker: String(argv["worker"] ?? ""),
						preview: String(argv["preview"] ?? ""),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										auto_build: argv["auto-build"],
										auto_delete: argv["auto-delete"],
										branch: resolveFileToken(
											argv["branch"] as string | undefined,
											"branch",
											"text"
										),
										settings: {
											build_caching_enabled:
												argv["settings-build-caching-enabled"],
											build_command: resolveFileToken(
												argv["settings-build-command"] as string | undefined,
												"settings-build-command",
												"text"
											),
											build_token_uuid: resolveFileToken(
												argv["settings-build-token-uuid"] as string | undefined,
												"settings-build-token-uuid",
												"text"
											),
											deploy_command: resolveFileToken(
												argv["settings-deploy-command"] as string | undefined,
												"settings-deploy-command",
												"text"
											),
											environment_variables: parseJsonMap(
												argv["settings-environment-variables"],
												"settings-environment-variables"
											),
											path_excludes: argv["settings-path-excludes"],
											path_includes: argv["settings-path-includes"],
											root_directory: resolveFileToken(
												argv["settings-root-directory"] as string | undefined,
												"settings-root-directory",
												"text"
											),
										},
									},
									[["settings", "environment_variables"]]
								),
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
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/previews/${encodeURIComponent(String(argv["preview"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["auto-build"] !== undefined)
				setNestedValue(bodyData, ["auto_build"], argv["auto-build"]);
			if (argv["auto-delete"] !== undefined)
				setNestedValue(bodyData, ["auto_delete"], argv["auto-delete"]);
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
			if (argv["settings-build-caching-enabled"] !== undefined)
				setNestedValue(
					bodyData,
					["settings", "build_caching_enabled"],
					argv["settings-build-caching-enabled"]
				);
			if (argv["settings-build-command"] !== undefined)
				setNestedValue(
					bodyData,
					["settings", "build_command"],
					resolveFileToken(
						argv["settings-build-command"] as string | undefined,
						"settings-build-command",
						"text"
					)
				);
			if (argv["settings-build-token-uuid"] !== undefined)
				setNestedValue(
					bodyData,
					["settings", "build_token_uuid"],
					resolveFileToken(
						argv["settings-build-token-uuid"] as string | undefined,
						"settings-build-token-uuid",
						"text"
					)
				);
			if (argv["settings-deploy-command"] !== undefined)
				setNestedValue(
					bodyData,
					["settings", "deploy_command"],
					resolveFileToken(
						argv["settings-deploy-command"] as string | undefined,
						"settings-deploy-command",
						"text"
					)
				);
			if (argv["settings-environment-variables"] !== undefined)
				setNestedValue(
					bodyData,
					["settings", "environment_variables"],
					parseJsonMap(
						argv["settings-environment-variables"],
						"settings-environment-variables"
					)
				);
			if (argv["settings-path-excludes"] !== undefined)
				setNestedValue(
					bodyData,
					["settings", "path_excludes"],
					argv["settings-path-excludes"]
				);
			if (argv["settings-path-includes"] !== undefined)
				setNestedValue(
					bodyData,
					["settings", "path_includes"],
					argv["settings-path-includes"]
				);
			if (argv["settings-root-directory"] !== undefined)
				setNestedValue(
					bodyData,
					["settings", "root_directory"],
					resolveFileToken(
						argv["settings-root-directory"] as string | undefined,
						"settings-root-directory",
						"text"
					)
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PATCH",
					`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/previews/${encodeURIComponent(String(argv["preview"]))}`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
