import operation from "../_operations/workers/get.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/workers.ts
 */
import type { Argv, CommandModule } from "yargs";
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
import { theme } from "#lib/ui/theme.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 workers get [worker]\n\nGet details about a specific Worker.")
		.positional("worker", {
			type: "string",
			description: "Identifier for the Worker, which can be ID or name.",
		})
		.option("worker", {
			type: "string",
			alias: ["script-name", "worker-id"],
			description: "Identifier for the Worker, which can be ID or name.",
		})
		.group("worker", theme.brand("Options"))
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get [worker]",
	describe: "Get Worker",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const scriptName = getWorkerName({ scriptName: argv["worker"] });
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
};

export default command;
