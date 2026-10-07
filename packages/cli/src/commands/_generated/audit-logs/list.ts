import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/audit-logs.ts
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
			"$0 audit-logs list\n\nGets a list of audit logs for an account. Can be filtered by who made the change, on which zone, and the timeframe of the change."
		)
		.option("id", {
			type: "string",
			description: "Finds a specific log by its ID.",
		})
		.option("export", {
			type: "boolean",
			description:
				"Indicates that this request is an export of logs in CSV format.",
		})
		.option("action-type", {
			type: "string",
			description: "Filters by the action type.",
		})
		.option("actor-ip", {
			type: "string",
			description:
				"Filters by the IP address of the request that made the change by specific IP address or valid CIDR Range.",
		})
		.option("actor-email", {
			type: "string",
			description:
				"Filters by the email address of the actor that made the change.",
		})
		.option("since", {
			type: "string",
			description:
				"Limits the returned results to logs newer than the specified date. A `full-date` that conforms to RFC3339.",
		})
		.option("before", {
			type: "string",
			description:
				"Limits the returned results to logs older than the specified date. A `full-date` that conforms to RFC3339.",
		})
		.option("zone-name", {
			type: "string",
			description: "Filters by the name of the zone associated to the change.",
		})
		.option("direction", {
			type: "string",
			description: "Changes the direction of the chronological sorting.",
			choices: ["desc", "asc"],
		})
		.option("per-page", {
			type: "number",
			description: "Sets the number of results to return per page.",
		})
		.option("page", {
			type: "number",
			description: "Defines which page of results to return.",
		})
		.option("hide-user-logs", {
			type: "boolean",
			description: "Indicates whether or not to hide user level audit logs.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"audit-logs-get-account-audit-logs">;
type Query = SdkQuery<"audit-logs-get-account-audit-logs">;

const typedBuilder = withArgTypes<
	{
		since: Query["since"];
		before: Query["before"];
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Get account audit logs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "audit-logs list",
				classification: {
					safeFlags: ["export", "direction", "hide-user-logs", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					id: argv["id"],
					export: argv["export"],
					"action.type": argv["action-type"],
					"actor.ip": argv["actor-ip"],
					"actor.email": argv["actor-email"],
					since: argv["since"],
					before: argv["before"],
					"zone.name": argv["zone-name"],
					direction: argv["direction"],
					per_page: argv["per-page"],
					page: argv["page"],
					hide_user_logs: argv["hide-user-logs"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf audit-logs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/audit_logs`,
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
					client.auditLogs.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
