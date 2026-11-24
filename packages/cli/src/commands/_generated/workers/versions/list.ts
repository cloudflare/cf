import operation from "../../_operations/workers/versions/list.js";
/**
 * list command
 * @generated from apis/overlays/workers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	getWorkerName,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List Worker Versions",
	usage: "$0 workers versions list\n\nList all versions for a Worker.",
	flags: {
		worker: {
			kind: "parsed",
			brief: "Identifier for the Worker, which can be ID or name.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Current page.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Items per-page.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers versions list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const scriptName = await getWorkerName({
					scriptName: argv["worker"],
					quiet: argv["quiet"] as boolean | undefined,
				});
				argv["worker"] = scriptName;

				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers versions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/workers/${encodeURIComponent(scriptName)}/versions`,
						pathParams: { worker: String(argv["worker"] ?? "") },
						query: queryParams,
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
						worker_id: scriptName,
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
