import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/load-balancers.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 load-balancers regions list\n\nList all region mappings.")
		.option("subdivision-code", {
			type: "string",
			description: "Two-letter subdivision code followed in ISO 3166-2.",
		})
		.option("subdivision-code-a2", {
			type: "string",
			description: "Two-letter subdivision code followed in ISO 3166-2.",
		})
		.option("country-code-a2", {
			type: "string",
			description: "Two-letter alpha-2 country code followed in ISO 3166-1.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"load-balancer-regions-list-regions">;
type Query = SdkQuery<"load-balancer-regions-list-regions">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Regions",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "load-balancers regions list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					subdivision_code: argv["subdivision-code"],
					subdivision_code_a2: argv["subdivision-code-a2"],
					country_code_a2: argv["country-code-a2"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf load-balancers regions list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/load_balancers/regions`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.loadBalancers.regions.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
