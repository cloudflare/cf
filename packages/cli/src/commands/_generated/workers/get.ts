import operation from "../_operations/workers/get.js";
/**
 * get command
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
	command: "get [worker]",
	describe: "Get Worker",
	usage: "$0 workers get [worker]\n\nGet details about a specific Worker.",
	flags: {
		worker: {
			kind: "parsed",
			brief: "Identifier for the Worker, which can be ID or name.",
			optional: true,
			alias: ["script-name", "worker-id"],
			grouped: true,
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
			placeholder: "worker",
			brief: "Identifier for the Worker, which can be ID or name.",
			parse: String,
			optional: true,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers get",
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
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workers get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/workers/${encodeURIComponent(scriptName)}`,
						pathParams: { worker: String(argv["worker"] ?? "") },
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
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
