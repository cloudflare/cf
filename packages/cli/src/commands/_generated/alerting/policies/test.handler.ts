import operation from "../../_operations/alerting/policies/test.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./test.js";
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
			command: "alerting policies test",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf alerting policies test",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/alerting/v3/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}/test`,
					pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									severity: argv["severity"],
									source: resolveFileToken(
										argv["source"] as string | undefined,
										"source",
										"text"
									),
									state_correlation_id: resolveFileToken(
										argv["state-correlation-id"] as string | undefined,
										"state-correlation-id",
										"text"
									),
									state_event: argv["state-event"],
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						policy_id: argv["policy-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				severity: argv["severity"],
				source: resolveFileToken(
					argv["source"] as string | undefined,
					"source",
					"text"
				),
				state_correlation_id: resolveFileToken(
					argv["state-correlation-id"] as string | undefined,
					"state-correlation-id",
					"text"
				),
				state_event: argv["state-event"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					policy_id: argv["policy-id"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
