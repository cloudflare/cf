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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/connectors.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 connectors edit <connector-id>\n\nEdits properties of a Magic WAN Connector. May be used to re-provision a license key."
		)
		.positional("connector-id", {
			type: "string",
			description: "Connector ID",
			demandOption: true,
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
		.option("provision-license", {
			type: "boolean",
			description: "When true, regenerate license key for the connector.",
		})
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

type Request = SdkRequest<"mconn-connectors-edit">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <connector-id>",
	describe: "Edit Connector",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "connectors edit",
				classification: {
					safeFlags: ["activated", "provision-license", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf connectors edit",
						method: "PATCH",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.connectors.edit({
							...bodyData,
							account_id: accountId,
							connector_id: argv["connector-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					provision_license: argv["provision-license"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.connectors.edit({
						...bodyData,
						account_id: accountId,
						connector_id: argv["connector-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
