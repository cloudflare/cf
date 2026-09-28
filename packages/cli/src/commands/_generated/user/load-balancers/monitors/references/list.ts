import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 user load-balancers monitors references list\n\nGet the list of resources that reference the provided monitor."
		)
		.option("monitor-id", {
			type: "string",
			description: "Monitor ID",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"load-balancer-monitors-list-monitor-references">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Monitor References",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancers monitors references list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers monitors references list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/monitors/${argv["monitor-id"] == null ? "<monitor-id>" : encodeURIComponent(String(argv["monitor-id"]))}/references`,
						pathParams: { "monitor-id": String(argv["monitor-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.user.loadBalancers.monitors.references.list({
						monitor_id: argv["monitor-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
