import operation from "../../../../../_operations/cloudforce-one/threat-intel/events/legacy/references/delete.js";
/**
 * delete command
 * @generated from apis/overlays/cloudforce-one.ts
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <event-id>",
	describe: "Remove event references (legacy)",
	usage:
		"$0 cloudforce-one threat-intel events legacy references delete <event-id>\n\nLegacy. Removes references created with `threat-intel events legacy references create`. Use `threat-intel events relationships` for new event links.",
	flags: {
		events: {
			kind: "parsed",
			brief: "The events field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "event-id", brief: "Event UUID.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel events legacy references delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["events"] === undefined) {
						throw new Error(
							"--events is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one threat-intel events legacy references delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/relate/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}`,
						pathParams: { "event-id": String(argv["event-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										events: argv["events"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Deleting`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							event_id: argv["event-id"],
						})
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					events: argv["events"],
				});
				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						event_id: argv["event-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
