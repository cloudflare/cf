import operation from "../_operations/feedback/diagnose.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * diagnose command
 * @generated from apis/overlays/feedback.ts
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
			"$0 feedback diagnose\n\nReturns the Cloudflare team's whole-project feedback prompt. An agent follows `instructions` to review how the user's project uses Cloudflare and write a report on what got in the way, shows the user the full report, and sends it with `POST /feedback/send` once the user approves."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "diagnose",
	describe: "Get the project feedback prompt",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "feedback diagnose",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf feedback diagnose",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/feedback/diagnosis`,
						pathParams: {},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
