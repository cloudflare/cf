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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/abuse-reports.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 abuse-reports mitigations list\n\nList mitigations done to remediate the abuse report."
		)
		.option("report-id", {
			type: "string",
			description: "Abuse Report ID",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "Where in pagination to start listing abuse reports",
		})
		.option("per-page", {
			type: "number",
			description: "How many abuse reports per page to list",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("sort", {
			type: "string",
			description: "A property to sort by, followed by the order",
			choices: [
				"type,asc",
				"type,desc",
				"effective_date,asc",
				"effective_date,desc",
				"status,asc",
				"status,desc",
				"entity_type,asc",
				"entity_type,desc",
			],
		})
		.option("type", {
			type: "string",
			description:
				"Filter by the type of mitigation. This filter parameter can be specified multiple times to include multiple types of mitigations in the result set.",
		})
		.option("effective-before", {
			type: "string",
			description:
				"Returns mitigations that were dispatched before the given date",
		})
		.option("effective-after", {
			type: "string",
			description:
				"Returns mitigation that were dispatched after the given date",
		})
		.option("status", {
			type: "string",
			description: "Filter by the status of the mitigation.",
			choices: ["pending", "active", "in_review", "cancelled", "removed"],
		})
		.option("entity-type", {
			type: "string",
			description: "Filter by the type of entity the mitigation impacts.",
			choices: ["url_pattern", "account", "zone", "custom_expression"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"ListMitigations">;
type Query = SdkQuery<"ListMitigations">;

const typedBuilder = withArgTypes<
	{
		sort: Query["sort"];
		status: Query["status"];
		"entity-type": Query["entity_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List abuse report mitigations",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "abuse-reports mitigations list",
				classification: {
					safeFlags: ["sort", "status", "entity-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					sort: argv["sort"],
					type: argv["type"],
					effective_before: argv["effective-before"],
					effective_after: argv["effective-after"],
					status: argv["status"],
					entity_type: argv["entity-type"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports mitigations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/${argv["report-id"] == null ? "<report-id>" : encodeURIComponent(String(argv["report-id"]))}/mitigations`,
						pathParams: { "report-id": String(argv["report-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.abuseReports.mitigations.list({
						account_id: accountId,
						report_id: argv["report-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
