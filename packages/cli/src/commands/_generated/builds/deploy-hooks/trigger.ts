import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * trigger command
 * @generated from apis/overlays/builds.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 builds deploy-hooks trigger <deploy-hook-uuid>\n\nTrigger a build using a deploy hook. This endpoint does not require authentication - the deploy_hook_uuid acts as a secret token."
		)
		.positional("deploy-hook-uuid", {
			type: "string",
			description: "Deploy hook UUID",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"triggerDeployHook">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "trigger <deploy-hook-uuid>",
	describe: "Trigger deploy hook",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "builds deploy-hooks trigger",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf builds deploy-hooks trigger",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/workers/builds/deploy_hooks/${argv["deploy-hook-uuid"] == null ? "<deploy-hook-uuid>" : encodeURIComponent(String(argv["deploy-hook-uuid"]))}`,
						pathParams: {
							"deploy-hook-uuid": String(argv["deploy-hook-uuid"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Creating`, async () =>
					client.builds.deployHooks.trigger({
						deploy_hook_uuid: argv["deploy-hook-uuid"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
