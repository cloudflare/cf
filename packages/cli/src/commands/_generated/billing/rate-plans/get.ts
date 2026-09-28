import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/billing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 billing rate-plans get <public-key>\n\nGets a rate plan's details by its public key (e.g., 'teams_free', 'cf_pro_20_20'). This is a public catalog endpoint, so authentication is not enforced and credentials are accepted but not required."
		)
		.positional("public-key", {
			type: "string",
			description: "The public key identifier for the rate plan.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"billing-get-rate-plan">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <public-key>",
	describe: "Get Rate Plan by Public Key",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing rate-plans get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf billing rate-plans get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/billing/rate_plans/${argv["public-key"] == null ? "<public-key>" : encodeURIComponent(String(argv["public-key"]))}`,
						pathParams: { "public-key": String(argv["public-key"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.billing.ratePlans.get({
						public_key: argv["public-key"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
