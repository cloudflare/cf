import { createCommandClient } from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * history command
 * @generated from apis/overlays/organizations.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organizations logs audit history <id>\n\nReturns the chronological change history for the resource identified by the given organization-scoped audit log entry. The endpoint first locates the source audit log entry by `id` (using `action_time` to narrow the lookup window), derives identifying filters from that entry, and then returns matching audit logs within the `since`/`before` window. The `result_info.history_status` field indicates the quality of the resource identification used: - `exact`: Resource was identified by the resource URI. - `approximate`: Resource was identified without the resource URI. - `unavailable`: The source audit log entry did not contain enough information to identify the resource; an empty result is returned."
		)
		.positional("id", {
			type: "string",
			description: "The ID of the audit log to fetch resource history for.",
			demandOption: true,
		})
		.option("organization-id", {
			type: "string",
			description: "The unique ID that identifies the organization.",
			demandOption: true,
		})
		.option("action-time", {
			type: "string",
			description:
				"RFC3339 timestamp of the source audit log entry's action time. Used to narrow the source-entry lookup window. Provide the `action.time` value from the audit log identified by `id`.",
			demandOption: true,
		})
		.option("since", {
			type: "string",
			description:
				"Limits the returned results to logs newer than the specified date. This can be a date string 2019-04-30 (interpreted in UTC) or an absolute timestamp that conforms to RFC3339.",
			demandOption: true,
		})
		.option("before", {
			type: "string",
			description:
				"Limits the returned results to logs older than the specified date. This can be a date string 2019-04-30 (interpreted in UTC) or an absolute timestamp that conforms to RFC3339.",
			demandOption: true,
		})
		.option("direction", {
			type: "string",
			description: "Sets sorting order.",
			choices: ["desc", "asc"],
		})
		.option("limit", {
			type: "number",
			description:
				"The number limits the objects to return. The cursor attribute may be used to iterate over the next batch of objects if there are more than the limit.",
		})
		.option("cursor", {
			type: "string",
			description:
				"The cursor is an opaque token used to paginate through large sets of records. It indicates the position from which to continue when requesting the next set of records. A valid cursor value can be obtained from the cursor object in the result_info structure of a previous response.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"audit-logs-v2-get-organization-audit-log-history">;
type Query = SdkQuery<"audit-logs-v2-get-organization-audit-log-history">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "history <id>",
	describe:
		"Get resource change history from an organization audit log entry (Version 2)",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organizations logs audit history",
				classification: {
					safeFlags: ["direction", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					action_time: argv["action-time"],
					since: argv["since"],
					before: argv["before"],
					direction: argv["direction"],
					limit: argv["limit"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organizations logs audit history",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/logs/audit/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/history`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
							id: String(argv["id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.organizations.logs.audit.history({
						organization_id: argv["organization-id"],
						id: argv["id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
