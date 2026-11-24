import operation from "../../../../../../../_operations/magic-transit/advanced-tcp-protection/configs/tcp/flow/protection/rules/update.js";
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
			command:
				"magic-transit advanced-tcp-protection configs tcp flow protection rules update",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command:
						"cf magic-transit advanced-tcp-protection configs tcp flow protection rules update",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/tcp_flow_protection/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
					pathParams: { "rule-id": String(argv["rule-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									burst_sensitivity: resolveFileToken(
										argv["burst-sensitivity"] as string | undefined,
										"burst-sensitivity",
										"text"
									),
									mode: resolveFileToken(
										argv["protection-mode"] as string | undefined,
										"protection-mode",
										"text"
									),
									rate_sensitivity: resolveFileToken(
										argv["rate-sensitivity"] as string | undefined,
										"rate-sensitivity",
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
						rule_id: argv["rule-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				burst_sensitivity: resolveFileToken(
					argv["burst-sensitivity"] as string | undefined,
					"burst-sensitivity",
					"text"
				),
				mode: resolveFileToken(
					argv["protection-mode"] as string | undefined,
					"protection-mode",
					"text"
				),
				rate_sensitivity: resolveFileToken(
					argv["rate-sensitivity"] as string | undefined,
					"rate-sensitivity",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					rule_id: argv["rule-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
