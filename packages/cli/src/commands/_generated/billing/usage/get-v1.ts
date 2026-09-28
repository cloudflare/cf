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
 * get-v1 command
 * @generated from apis/overlays/billing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 billing usage get-v1\n\nReturns billable usage data for the account. When no query parameters are provided, returns usage for the current billing period."
		)
		.option("from", {
			type: "string",
			description:
				"Start date for the usage query (ISO 8601). The provided time range must include the subscription billing cycle anchor day, otherwise no usage data is returned. Use the info endpoint to retrieve the subscription anchor day.",
		})
		.option("to", {
			type: "string",
			description: "End date for the usage query (ISO 8601).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"billable-usage-get-v1-account-usage">;
type Query = SdkQuery<"billable-usage-get-v1-account-usage">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get-v1",
	describe: "Get Account Billable Usage (Version 1, Alpha)",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "billing usage get-v1",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					from: argv["from"],
					to: argv["to"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf billing usage get-v1",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/billable-usage`,
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
					client.billing.usage.getV1({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
