import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/values.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 values list\n\nLists all distinct values for a given tag key, optionally filtered by resource type."
		)
		.option("tag-key", {
			type: "string",
			description: "The tag key to retrieve values for.",
			demandOption: true,
		})
		.option("type", {
			type: "string",
			description: "Filter by resource type.",
			choices: [
				"access_application",
				"access_application_policy",
				"access_group",
				"account",
				"account_ruleset",
				"ai_gateway",
				"alerting_policy",
				"alerting_webhook",
				"api_gateway_operation",
				"cloudflared_tunnel",
				"custom_certificate",
				"custom_hostname",
				"cws_deployment",
				"cws_policy",
				"cws_policy_set",
				"cws_workload",
				"d1_database",
				"dns_record",
				"durable_object_namespace",
				"gateway_list",
				"gateway_rule",
				"healthcheck",
				"image",
				"infrastructure_target",
				"kv_namespace",
				"load_balancer",
				"load_balancer_monitor",
				"load_balancer_pool",
				"managed_client_certificate",
				"pages_project",
				"queue",
				"r2_bucket",
				"resource_share",
				"stream_live_input",
				"stream_video",
				"vectorize_index",
				"worker",
				"worker_route",
				"worker_version",
				"zone",
				"zone_ruleset",
			],
		})
		.option("cursor", { type: "string", description: "Cursor for pagination." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"tags-list-values">;
type Query = SdkQuery<"tags-list-values">;

const typedBuilder = withArgTypes<
	{
		type: Query["type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List tag values",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "values list",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					type: argv["type"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf values list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/tags/values/${argv["tag-key"] == null ? "<tag-key>" : encodeURIComponent(String(argv["tag-key"]))}`,
						pathParams: { "tag-key": String(argv["tag-key"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.values.list({
						account_id: accountId,
						tag_key: argv["tag-key"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
