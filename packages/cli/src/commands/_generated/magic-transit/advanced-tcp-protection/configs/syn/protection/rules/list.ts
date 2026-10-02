import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit advanced-tcp-protection configs syn protection rules list\n\nList all SYN Protection rules for an account."
		)
		.option("page", {
			type: "number",
			description: "The page number for pagination. Defaults to 1.",
		})
		.option("per-page", {
			type: "number",
			description:
				"The number of items per page. Must be between 10 and 1000. Defaults to 25.",
		})
		.option("order", {
			type: "string",
			description: "The field to order by. Defaults to 'prefix'.",
		})
		.option("direction", {
			type: "string",
			description:
				"The direction of ordering (ASC or DESC). Defaults to 'ASC'.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"listSynProtectionRulesForAccount">;
type Query = SdkQuery<"listSynProtectionRulesForAccount">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List all SYN Protection rules.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs syn protection rules list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-tcp-protection configs syn protection rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/syn_protection/rules`,
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
					client.magicTransit.advancedTcpProtection.configs.syn.protection.rules.list(
						{ account_id: accountId, ...queryParams } satisfies Request
					)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
