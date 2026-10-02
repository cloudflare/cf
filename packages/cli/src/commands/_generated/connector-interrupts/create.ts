import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/connector-interrupts.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 connector-interrupts create <connector-id>\n\nCreates an interrupt for a Magic WAN Connector."
		)
		.positional("connector-id", {
			type: "string",
			description: "Connector ID",
			demandOption: true,
		})
		.option("reboot-purge", {
			type: "boolean",
			description: "Purge connector state.",
		})
		.option("restart-purge", {
			type: "boolean",
			description: "Purge connector state.",
		})
		.option("shutdown-purge", {
			type: "boolean",
			description: "Purge connector state.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Interrupt action for a connector.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"mconn-connector-interrupts-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <connector-id>",
	describe: "Create Interrupt",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "connector-interrupts create",
				classification: {
					safeFlags: [
						"reboot-purge",
						"restart-purge",
						"shutdown-purge",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf connector-interrupts create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/connectors/${argv["connector-id"] == null ? "<connector-id>" : encodeURIComponent(String(argv["connector-id"]))}/interrupts`,
						pathParams: { "connector-id": String(argv["connector-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										reboot: {
											purge: argv["reboot-purge"],
										},
										restart: {
											purge: argv["restart-purge"],
										},
										shutdown: {
											purge: argv["shutdown-purge"],
										},
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
						client.connectorInterrupts.create({
							...bodyData,
							account_id: accountId,
							connector_id: argv["connector-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					reboot: {
						purge: argv["reboot-purge"],
					},
					restart: {
						purge: argv["restart-purge"],
					},
					shutdown: {
						purge: argv["shutdown-purge"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.connectorInterrupts.create({
						...bodyData,
						account_id: accountId,
						connector_id: argv["connector-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
