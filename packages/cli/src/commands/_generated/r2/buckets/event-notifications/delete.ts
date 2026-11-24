/**
 * delete command
 * @generated from apis/overlays/r2.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <queue-id>",
	describe: "Delete Event Notification Rules",
	usage:
		"$0 r2 buckets event-notifications delete <queue-id>\n\nDeletes the specified event notification rules for an R2 bucket and Cloudflare Queue. Provide ruleIds in the request body to select rules. If no body is provided, all rules for that bucket and queue are deleted.",
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Name of the bucket.",
			parse: String,
		},
		"cf-r2-jurisdiction": {
			kind: "parsed",
			brief:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
			optional: true,
			parse: String,
		},
		"rule-ids": {
			kind: "parsed",
			brief: "Array of rule ids to delete.",
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
	operands: [
		{
			placeholder: "queue-id",
			brief:
				"ID of the Cloudflare Queue that receives notifications for matching R2 object events.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets event-notifications delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 buckets event-notifications delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/event_notifications/r2/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/configuration/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							"queue-id": String(argv["queue-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ruleIds: argv["rule-ids"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This deletes event notification rules for the selected R2 bucket and queue. Without a request body, all rules for that bucket and queue are deleted.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Deleting`, async () =>
						requestApi<unknown>(
							client,
							"DELETE",
							`/accounts/${accountId}/event_notifications/r2/${encodeURIComponent(String(argv["bucket-name"]))}/configuration/queues/${encodeURIComponent(String(argv["queue-id"]))}`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["rule-ids"] !== undefined)
					setNestedValue(bodyData, ["ruleIds"], argv["rule-ids"]);
				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"DELETE",
						`/accounts/${accountId}/event_notifications/r2/${encodeURIComponent(String(argv["bucket-name"]))}/configuration/queues/${encodeURIComponent(String(argv["queue-id"]))}`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
