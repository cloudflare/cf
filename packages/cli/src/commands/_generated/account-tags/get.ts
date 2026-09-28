import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/account-tags.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 account-tags get\n\nRetrieves tags for a specific account or zone-level resource."
		)
		.option("resource-id", {
			type: "string",
			description: "The ID of the resource to retrieve tags for.",
			demandOption: true,
		})
		.option("resource-type", {
			type: "string",
			description: "The type of the resource.",
			choices: [
				"access_application",
				"access_group",
				"account",
				"account_ruleset",
				"ai_gateway",
				"alerting_policy",
				"alerting_webhook",
				"cloudflared_tunnel",
				"cws_deployment",
				"cws_policy",
				"cws_policy_set",
				"cws_workload",
				"d1_database",
				"durable_object_namespace",
				"gateway_list",
				"gateway_rule",
				"image",
				"infrastructure_target",
				"kv_namespace",
				"load_balancer_monitor",
				"load_balancer_pool",
				"pages_project",
				"queue",
				"r2_bucket",
				"resource_share",
				"stream_live_input",
				"stream_video",
				"vectorize_index",
				"worker",
				"worker_version",
			],
			demandOption: true,
		})
		.option("worker-id", {
			type: "string",
			description: "Worker identifier. Required for worker_version resources.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"generated:get:/{account_or_zone}/{account_or_zone_id}/tags">;
type Query =
	SdkQuery<"generated:get:/{account_or_zone}/{account_or_zone_id}/tags">;

const typedBuilder = withArgTypes<
	{
		"resource-type": Query["resource_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get",
	describe: "Get tags for an account or zone-level resource",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "account-tags get",
				classification: {
					safeFlags: ["resource-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					resource_id: argv["resource-id"],
					resource_type: argv["resource-type"],
					worker_id: argv["worker-id"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf account-tags get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/tags`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				const result = await withProgress(`Loading`, async () =>
					client.accountTags.get({
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
