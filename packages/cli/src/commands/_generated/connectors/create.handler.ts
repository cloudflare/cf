import operation from "../_operations/connectors/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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
			command: "connectors create",
			classification: {
				safeFlags: ["device-provision-license", "activated", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			if (argv.dryRun) {
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf connectors create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/connectors`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									device: {
										id: resolveFileToken(
											argv["device-id"] as string | undefined,
											"device-id",
											"text"
										),
										provision_license: argv["device-provision-license"],
										serial_number: resolveFileToken(
											argv["device-serial-number"] as string | undefined,
											"device-serial-number",
											"text"
										),
									},
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
				return;
			}

			// Assemble request body from individual flags
			const bodyData = compactBody({
				device: {
					id: resolveFileToken(
						argv["device-id"] as string | undefined,
						"device-id",
						"text"
					),
					provision_license: argv["device-provision-license"],
					serial_number: resolveFileToken(
						argv["device-serial-number"] as string | undefined,
						"device-serial-number",
						"text"
					),
				},
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
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
