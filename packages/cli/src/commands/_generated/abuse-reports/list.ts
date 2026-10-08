import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/abuse-reports.ts
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
			"$0 abuse-reports list\n\nList abuse reports made against domains or other content associated with the account. To list reports that the account submitted, use the submitted abuse reports endpoint instead."
		)
		.option("page", {
			type: "number",
			description: "Where in pagination to start listing abuse reports",
		})
		.option("per-page", {
			type: "number",
			description: "How many abuse reports per page to list",
		})
		.option("sort", {
			type: "string",
			description:
				"A property to sort by, followed by the order (id, cdate, domain, type, status)",
		})
		.option("search", {
			type: "string",
			description:
				"Free-text search. Returns reports whose report ID starts with the term or whose domain contains the term, both case-insensitively. Surrounding whitespace is ignored, and an empty value is treated as absent. Combined with the other filters using AND.",
		})
		.option("domain", {
			type: "string",
			description: "Filter by domain name related to the abuse report",
		})
		.option("created-before", {
			type: "string",
			description: "Returns reports created before the specified date",
		})
		.option("created-after", {
			type: "string",
			description: "Returns reports created after the specified date",
		})
		.option("status", {
			type: "string",
			description: "Filter by the status of the report.",
			choices: ["accepted", "in_review"],
		})
		.option("type", {
			type: "string",
			description: "Filter by the type of the report.",
			choices: [
				"PHISH",
				"GEN",
				"THREAT",
				"DMCA",
				"EMER",
				"TM",
				"REG_WHO",
				"NCSEI",
				"NETWORK",
			],
		})
		.option("mitigation-status", {
			type: "string",
			description:
				"Filter reports that have any mitigations in the given status.",
			choices: ["pending", "active", "in_review", "cancelled", "removed"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"ListAbuseReports">;
type Query = SdkQuery<"ListAbuseReports">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
		type: Query["type"];
		"mitigation-status": Query["mitigation_status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List abuse reports against the account",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "abuse-reports list",
				classification: {
					safeFlags: ["status", "type", "mitigation-status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					sort: argv["sort"],
					search: argv["search"],
					domain: argv["domain"],
					created_before: argv["created-before"],
					created_after: argv["created-after"],
					status: argv["status"],
					type: argv["type"],
					mitigation_status: argv["mitigation-status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports`,
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
					client.abuseReports.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
