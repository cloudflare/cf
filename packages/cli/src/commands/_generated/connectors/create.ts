import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/connectors.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 connectors create\n\nCreates a Magic WAN Connector.")
		.option("device-id", { type: "string", description: "The device.id field" })
		.option("device-provision-license", {
			type: "boolean",
			description:
				"When true, create and provision a new licence key for the connector.",
		})
		.option("device-serial-number", {
			type: "string",
			description: "The device.serial_number field",
		})
		.option("activated", {
			type: "boolean",
			description: "The activated field",
		})
		.option("interrupt-window-days-of-week", {
			type: "string",
			array: true,
			description:
				"Allowed days of the week for upgrades. Default is all days.",
		})
		.option("interrupt-window-duration-hours", {
			type: "number",
			description: "The interrupt_window_duration_hours field",
		})
		.option("interrupt-window-embargo-dates", {
			type: "string",
			array: true,
			description: "List of dates (YYYY-MM-DD) when upgrades are blocked.",
		})
		.option("interrupt-window-hour-of-day", {
			type: "number",
			description: "The interrupt_window_hour_of_day field",
		})
		.option("notes", { type: "string", description: "The notes field" })
		.option("timezone", { type: "string", description: "The timezone field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"mconn-connectors-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Connector",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "connectors create",
				classification: {
					safeFlags: ["device-provision-license", "activated", "dry-run"],
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.connectors.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					interrupt_window_embargo_dates:
						argv["interrupt-window-embargo-dates"],
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
					client.connectors.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
