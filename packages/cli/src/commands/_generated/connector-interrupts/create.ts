import operation from "../_operations/connector-interrupts/create.js";
/**
 * create command
 * @generated from apis/overlays/connector-interrupts.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create <connector-id>",
	describe: "Create Interrupt",
	usage:
		"$0 connector-interrupts create <connector-id>\n\nCreates an interrupt for a Magic WAN Connector.",
	flags: {
		"reboot-purge": {
			kind: "boolean",
			brief: "Purge connector state.",
			optional: true,
		},
		"restart-purge": {
			kind: "boolean",
			brief: "Purge connector state.",
			optional: true,
		},
		"shutdown-purge": {
			kind: "boolean",
			brief: "Purge connector state.",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Interrupt action for a connector.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "connector-id", brief: "Connector ID", parse: String },
	],
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
				} satisfies ArgClassification<typeof argv>,
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
							connector_id: argv["connector-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						connector_id: argv["connector-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
