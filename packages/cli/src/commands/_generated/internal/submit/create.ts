import operation from "../../_operations/internal/submit/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/internal.ts
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
			"$0 internal submit create\n\nInternal route for testing URL submissions."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Internal route for testing URL submissions",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "internal submit create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf internal submit create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/internal/submit`,
						pathParams: {},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Creating`, async () =>
					client.send(operation)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
