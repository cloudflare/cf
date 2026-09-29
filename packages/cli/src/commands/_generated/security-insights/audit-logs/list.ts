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
 * list command
 * @generated from apis/overlays/security-insights.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 security-insights audit-logs list\n\nLists audit log entries for all Security Center insights in the account or zone, showing changes to insight status and classification."
		)
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("cursor", {
			type: "string",
			description:
				"Opaque cursor for pagination. Use the cursor value from result_info of the previous response.",
		})
		.option("field-changed", {
			type: "string",
			description: "Filter by the field that was changed.",
			choices: ["status", "user_classification"],
		})
		.option("changed-by", {
			type: "string",
			description: "Filter by the actor that made the change.",
		})
		.option("since", {
			type: "string",
			description:
				"Filter entries changed at or after this timestamp (RFC 3339).",
		})
		.option("before", {
			type: "string",
			description: "Filter entries changed before this timestamp (RFC 3339).",
		})
		.option("order", {
			type: "string",
			description:
				"Sort order for results. Use 'asc' for oldest first or 'desc' for newest first.",
			choices: ["asc", "desc"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"generated:get:/{account_or_zone}/{account_or_zone_id}/security-center/insights/audit-log">;
type Query =
	SdkQuery<"generated:get:/{account_or_zone}/{account_or_zone_id}/security-center/insights/audit-log">;

const typedBuilder = withArgTypes<
	{
		"field-changed": Query["field_changed"];
		order: Query["order"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Retrieves account or zone Audit Log",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-insights audit-logs list",
				classification: {
					safeFlags: ["field-changed", "order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					field_changed: argv["field-changed"],
					changed_by: argv["changed-by"],
					since: argv["since"],
					before: argv["before"],
					order: argv["order"],
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
						command: "cf security-insights audit-logs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/security-center/insights/audit-log`,
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
					client.securityInsights.auditLogs.list({
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
