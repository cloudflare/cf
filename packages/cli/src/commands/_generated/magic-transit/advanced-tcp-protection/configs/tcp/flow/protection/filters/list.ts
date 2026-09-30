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
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit advanced-tcp-protection configs tcp flow protection filters list\n\nList all TCP Flow Protection filters for an account."
		)
		.option("filter-mode", {
			type: "string",
			description:
				"The mode of the filters to get. Optional. Valid values: 'enabled', 'disabled', 'monitoring'.",
		})
		.option("page", {
			type: "number",
			description: "The page number for pagination. Defaults to 1.",
		})
		.option("per-page", {
			type: "number",
			description:
				"The number of items per page. Must be between 10 and 1000. Defaults to 25.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
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

type Request = SdkRequest<"listTcpFlowProtectionFiltersForAccount">;
type Query = SdkQuery<"listTcpFlowProtectionFiltersForAccount">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List all TCP Flow Protection filters.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"magic-transit advanced-tcp-protection configs tcp flow protection filters list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					mode: argv["filter-mode"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf magic-transit advanced-tcp-protection configs tcp flow protection filters list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/advanced_tcp_protection/configs/tcp_flow_protection/filters`,
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
					client.magicTransit.advancedTcpProtection.configs.tcp.flow.protection.filters.list(
						{ account_id: accountId, ...queryParams } satisfies Request
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
