import operation from "../../_operations/queues/consumers/get.js";
/**
 * get command
 * @generated from apis/overlays/queues.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <consumer-id>",
	describe: "Get Queue Consumer",
	usage:
		"$0 queues consumers get <consumer-id>\n\nReturns a Queue consumer by identifier.",
	flags: {
		"queue-id": {
			kind: "parsed",
			brief: "A Resource identifier.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "consumer-id",
			brief: "A Resource identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "queues consumers get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf queues consumers get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/queues/${argv["queue-id"] == null ? "<queue-id>" : encodeURIComponent(String(argv["queue-id"]))}/consumers/${argv["consumer-id"] == null ? "<consumer-id>" : encodeURIComponent(String(argv["consumer-id"]))}`,
						pathParams: {
							"queue-id": String(argv["queue-id"] ?? ""),
							"consumer-id": String(argv["consumer-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						queue_id: argv["queue-id"],
						consumer_id: argv["consumer-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
