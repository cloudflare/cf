import operation from "../../_operations/accounts/subscriptions/create-cancel-reason.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create-cancel-reason.js";
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
			command: "accounts subscriptions create-cancel-reason",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf accounts subscriptions create-cancel-reason",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/subscriptions/${argv["subscription-identifier"] == null ? "<subscription-identifier>" : encodeURIComponent(String(argv["subscription-identifier"]))}/cancel-reason`,
					pathParams: {
						"subscription-identifier": String(
							argv["subscription-identifier"] ?? ""
						),
					},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									other: resolveFileToken(
										argv["other"] as string | undefined,
										"other",
										"text"
									),
									reason_code: argv["reason-code"],
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
						subscription_identifier: argv["subscription-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				other: resolveFileToken(
					argv["other"] as string | undefined,
					"other",
					"text"
				),
				reason_code: argv["reason-code"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					subscription_identifier: argv["subscription-identifier"],
				})
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
