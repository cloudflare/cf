import operation from "../../../_operations/workflows/instances/events/send.js";
/**
 * send command
 * @generated from apis/overlays/workflows.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "send <event-type>",
	describe: "Send event to instance",
	usage:
		"$0 workflows instances events send <event-type>\n\nSends an event to a running workflow instance to trigger state transitions.",
	flags: {
		"workflow-name": { kind: "parsed", brief: "Workflow name", parse: String },
		"instance-id": {
			kind: "parsed",
			brief:
				"Instance identifier. User-created instances match `^[a-zA-Z0-9_][a-zA-Z0-9-_]*$` (max 100 characters); cron-triggered instances can use a longer, system-generated id derived from the cron expression.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "event-type", brief: "Event type", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances events send",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances events send",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/events/${argv["event-type"] == null ? "<event-type>" : encodeURIComponent(String(argv["event-type"]))}`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
							"event-type": String(argv["event-type"] ?? ""),
						},
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
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
							workflow_name: argv["workflow-name"],
							instance_id: argv["instance-id"],
							event_type: argv["event-type"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/workflows/${encodeURIComponent(String(argv["workflow-name"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/events/${encodeURIComponent(String(argv["event-type"]))}`
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
