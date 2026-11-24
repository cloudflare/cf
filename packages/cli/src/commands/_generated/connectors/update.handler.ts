import operation from "../_operations/connectors/update.js";
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
			command: "connectors update",
			classification: {
				safeFlags: ["activated", "provision-license", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf connectors update",
					method: "PUT",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/connectors/${argv["connector-id"] == null ? "<connector-id>" : encodeURIComponent(String(argv["connector-id"]))}`,
					pathParams: { "connector-id": String(argv["connector-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									activated: argv["activated"],
									interrupt_window_days_of_week:
										argv["interrupt-window-days-of-week"],
									interrupt_window_duration_hours:
										argv["interrupt-window-duration-hours"],
									interrupt_window_embargo_dates:
										argv["interrupt-window-embargo-dates"],
									interrupt_window_hour_of_day:
										argv["interrupt-window-hour-of-day"],
									notes: resolveFileToken(
										argv["notes"] as string | undefined,
										"notes",
										"text"
									),
									timezone: resolveFileToken(
										argv["timezone"] as string | undefined,
										"timezone",
										"text"
									),
									provision_license: argv["provision-license"],
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
						connector_id: argv["connector-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				activated: argv["activated"],
				interrupt_window_days_of_week: argv["interrupt-window-days-of-week"],
				interrupt_window_duration_hours:
					argv["interrupt-window-duration-hours"],
				interrupt_window_embargo_dates: argv["interrupt-window-embargo-dates"],
				interrupt_window_hour_of_day: argv["interrupt-window-hour-of-day"],
				notes: resolveFileToken(
					argv["notes"] as string | undefined,
					"notes",
					"text"
				),
				timezone: resolveFileToken(
					argv["timezone"] as string | undefined,
					"timezone",
					"text"
				),
				provision_license: argv["provision-license"],
			});
			const result = await withProgress(`Updating`, async () =>
				client.send(operation, {
					body: bodyData,
					account_id: accountId,
					connector_id: argv["connector-id"],
				})
			);
			formatOutput(result, { successLabel: `Updated` });
		}
	);
}
