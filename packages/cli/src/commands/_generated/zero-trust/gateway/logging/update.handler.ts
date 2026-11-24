import operation from "../../../_operations/zero-trust/gateway/logging/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "zero-trust gateway logging update",
			classification: {
				safeFlags: [
					"redact-pii",
					"settings-by-rule-type-dns-log-all",
					"settings-by-rule-type-dns-log-blocks",
					"settings-by-rule-type-http-log-all",
					"settings-by-rule-type-http-log-blocks",
					"settings-by-rule-type-l4-log-all",
					"settings-by-rule-type-l4-log-blocks",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf zero-trust gateway logging update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/logging`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									redact_pii: argv["redact-pii"],
									settings_by_rule_type: {
										dns: {
											log_all: argv["settings-by-rule-type-dns-log-all"],
											log_blocks: argv["settings-by-rule-type-dns-log-blocks"],
										},
										http: {
											log_all: argv["settings-by-rule-type-http-log-all"],
											log_blocks: argv["settings-by-rule-type-http-log-blocks"],
										},
										l4: {
											log_all: argv["settings-by-rule-type-l4-log-all"],
											log_blocks: argv["settings-by-rule-type-l4-log-blocks"],
										},
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
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				redact_pii: argv["redact-pii"],
				settings_by_rule_type: {
					dns: {
						log_all: argv["settings-by-rule-type-dns-log-all"],
						log_blocks: argv["settings-by-rule-type-dns-log-blocks"],
					},
					http: {
						log_all: argv["settings-by-rule-type-http-log-all"],
						log_blocks: argv["settings-by-rule-type-http-log-blocks"],
					},
					l4: {
						log_all: argv["settings-by-rule-type-l4-log-all"],
						log_blocks: argv["settings-by-rule-type-l4-log-blocks"],
					},
				},
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
