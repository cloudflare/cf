import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "builds deploy-hooks update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["branch"] === undefined) {
					argv["branch"] = await promptForRequiredField(
						"branch",
						"Git branch name."
					);
				}
				if (argv["deploy-hook-name"] === undefined) {
					argv["deploy-hook-name"] = await promptForRequiredField(
						"deploy-hook-name",
						"Deploy hook name (1-58 characters)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf builds deploy-hooks update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/deploy_hooks/${argv["deploy-hook-uuid"] == null ? "<deploy-hook-uuid>" : encodeURIComponent(String(argv["deploy-hook-uuid"]))}`,
					pathParams: {
						worker: String(argv["worker"] ?? ""),
						"deploy-hook-uuid": String(argv["deploy-hook-uuid"] ?? ""),
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
									deploy_hook_name: resolveFileToken(
										argv["deploy-hook-name"] as string | undefined,
										"deploy-hook-name",
										"text"
									),
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
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/deploy_hooks/${encodeURIComponent(String(argv["deploy-hook-uuid"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}
			await resolveRequiredFields();

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
			if (argv["deploy-hook-name"] !== undefined)
				setNestedValue(
					bodyData,
					["deploy_hook_name"],
					resolveFileToken(
						argv["deploy-hook-name"] as string | undefined,
						"deploy-hook-name",
						"text"
					)
				);
			const result = await withProgress(`Updating`, async () =>
				requestApi<unknown>(
					client,
					"PUT",
					`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/deploy_hooks/${encodeURIComponent(String(argv["deploy-hook-uuid"]))}`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
