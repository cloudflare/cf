import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./bulk-edit.js";
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
import { readFileForFlag } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command:
				"workers-for-platforms dispatch-namespaces scripts secrets bulk-edit",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (
				argv.body === undefined &&
				argv.file === undefined &&
				argv["secrets"] === undefined &&
				argv["version-tags"] === undefined
			) {
				throw new Error(
					"--body is required unless at least one JSON map flag is provided (--secrets, --version-tags)."
				);
			}
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command:
						"cf workers-for-platforms dispatch-namespaces scripts secrets bulk-edit",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/secrets-bulk`,
					pathParams: {
						"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
						"script-name": String(argv["script-name"] ?? ""),
					},
					bodyKind: argv.file !== undefined ? "octet-stream" : "json",
					body:
						argv.file !== undefined
							? { file: argv.file }
							: argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											secrets: parseJsonMap(argv["secrets"], "secrets"),
											version_tags: parseJsonMap(
												argv["version-tags"],
												"version-tags"
											),
										},
										[["secrets"], ["version_tags"]]
									),
				});
				return;
			}
			const parsedBody =
				argv.file !== undefined
					? undefined
					: argv.body !== undefined
						? parseBody(argv.body)
						: undefined;
			const client = await createCommandClient(argv);
			const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
			argv.accountId = accountId;

			if (argv.file !== undefined) {
				const fileContent = readFileForFlag(argv.file);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}/secrets-bulk`,
						{
							body: fileContent,
							headers: { "Content-Type": "application/merge-patch+json" },
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}/secrets-bulk`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["secrets"] !== undefined)
				setNestedValue(
					bodyData,
					["secrets"],
					parseJsonMap(argv["secrets"], "secrets")
				);
			if (argv["version-tags"] !== undefined)
				setNestedValue(
					bodyData,
					["version_tags"],
					parseJsonMap(argv["version-tags"], "version-tags")
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PATCH",
					`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}/secrets-bulk`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
