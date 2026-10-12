import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/user.ts
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
			"$0 user load-balancers regions list\n\nList all region mappings in the user context."
		)
		.option("subdivision-code", {
			type: "string",
			description: "Two-letter subdivision code followed in ISO 3166-2.",
		})
		.option("country-code", {
			type: "string",
			description: "Two-letter alpha-2 country code as defined in ISO 3166-1.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Query = SdkQuery<"user-load-balancer-regions-list-regions">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Regions",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancers regions list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					subdivision_code: argv["subdivision-code"],
					country_code: argv["country-code"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers regions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/regions`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.user.loadBalancers.regions.list(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
