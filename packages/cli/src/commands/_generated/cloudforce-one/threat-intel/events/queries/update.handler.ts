import operation from "../../../../_operations/cloudforce-one/threat-intel/events/queries/update.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one threat-intel events queries update",
			classification: {
				safeFlags: [
					"alert-enabled",
					"alert-rollup-enabled",
					"rule-enabled",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel events queries update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/queries/${argv["query-id"] == null ? "<query-id>" : encodeURIComponent(String(argv["query-id"]))}`,
					pathParams: { "query-id": String(argv["query-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									alert_enabled: argv["alert-enabled"],
									alert_rollup_enabled: argv["alert-rollup-enabled"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									query_json: resolveFileToken(
										argv["query-json"] as string | undefined,
										"query-json",
										"text"
									),
									rule_enabled: argv["rule-enabled"],
									rule_scope: resolveFileToken(
										argv["rule-scope"] as string | undefined,
										"rule-scope",
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						query_id: argv["query-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				alert_enabled: argv["alert-enabled"],
				alert_rollup_enabled: argv["alert-rollup-enabled"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				query_json: resolveFileToken(
					argv["query-json"] as string | undefined,
					"query-json",
					"text"
				),
				rule_enabled: argv["rule-enabled"],
				rule_scope: resolveFileToken(
					argv["rule-scope"] as string | undefined,
					"rule-scope",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					query_id: argv["query-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
