import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * count-zones-enabled-for-user command
 * @generated from apis/overlays/argo.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 argo smart-routing count-zones-enabled-for-user\n\nReturns the number of zones that have Argo Smart Routing enabled for the authenticated user."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "count-zones-enabled-for-user",
	describe: "Get count of zones with Argo Smart Routing enabled for user",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "argo smart-routing count-zones-enabled-for-user",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf argo smart-routing count-zones-enabled-for-user",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/argo/count_zones_enabled`,
						pathParams: {},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.argo.smartRouting.countZonesEnabledForUser()
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
