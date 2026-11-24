import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./migrate-to-previews.js";
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "builds workers migrate-to-previews",
			classification: {
				safeFlags: ["dry-run", "force"],
				shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf builds workers migrate-to-previews",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/builds/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/migrate_to_previews`,
					pathParams: { worker: String(argv["worker"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									deploy_command: resolveFileToken(
										argv["deploy-command"] as string | undefined,
										"deploy-command",
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

			if (
				!(await confirmDelete({
					force: Boolean(argv.force),
					message: `This operation switches the Worker to Previews and removes its legacy non-production trigger. It cannot be reversed.`,
				}))
			) {
				return;
			}

			if (argv.body !== undefined) {
				const bodyData = parsedBody;
				const result = await withProgress(`Processing`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/migrate_to_previews`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Done` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData: Record<string, unknown> = {};
			if (argv["deploy-command"] !== undefined)
				setNestedValue(
					bodyData,
					["deploy_command"],
					resolveFileToken(
						argv["deploy-command"] as string | undefined,
						"deploy-command",
						"text"
					)
				);
			const result = await withProgress(`Processing`, async () =>
				requestApi<unknown>(
					client,
					"POST",
					`/accounts/${accountId}/builds/workers/${encodeURIComponent(String(argv["worker"]))}/migrate_to_previews`,
					{ body: bodyData }
				)
			);
			formatOutput(result, { successLabel: `Done` });
		}
	);
}
