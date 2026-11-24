import operation from "../../_operations/billing/profiles/update-email.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./update-email.js";
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
			command: "billing profiles update-email",
			classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
				typeof argv
			>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf billing profiles update-email",
					method: "PATCH",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billing/profile`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									billing_email: resolveFileToken(
										argv["billing-email"] as string | undefined,
										"billing-email",
										"text"
									),
									preferred_locale: resolveFileToken(
										argv["preferred-locale"] as string | undefined,
										"preferred-locale",
										"text"
									),
									secondary_billing_email: resolveFileToken(
										argv["secondary-billing-email"] as string | undefined,
										"secondary-billing-email",
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				billing_email: resolveFileToken(
					argv["billing-email"] as string | undefined,
					"billing-email",
					"text"
				),
				preferred_locale: resolveFileToken(
					argv["preferred-locale"] as string | undefined,
					"preferred-locale",
					"text"
				),
				secondary_billing_email: resolveFileToken(
					argv["secondary-billing-email"] as string | undefined,
					"secondary-billing-email",
					"text"
				),
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
