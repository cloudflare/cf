import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * getRequestList command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one requests getRequestList <project-type>\n\nRetrieves a paginated list of RFIs with filtering and sorting options."
		)
		.positional("project-type", {
			type: "string",
			description: "RFI project type",
			demandOption: true,
		})
		.option("page", { type: "number", description: "Page" })
		.option("page-size", { type: "number", description: "PageSize" })
		.option("status", {
			type: "string",
			description:
				"Status filter. Projects with a narrowed dashboard vocabulary accept only their customer-facing values.",
		})
		.option("search", { type: "string", description: "Search" })
		.option("created-by", {
			type: "string",
			description:
				"Filter by creator email. NOTE: For the `legal-response` project type this query parameter is **rejected with HTTP 400** — the server derives the filter from the authenticated user's JWT automatically and does not accept a client-supplied value. Requests to `legal-response` with no valid JWT identity are rejected with HTTP 401.",
		})
		.option("assignee", { type: "string", description: "Assignee" })
		.option("request-type", { type: "string", description: "RequestType" })
		.option("priority", { type: "string", description: "Priority" })
		.option("tlp", { type: "string", description: "Tlp" })
		.option("id", { type: "string", description: "ID" })
		.option("readable-id", { type: "string", description: "ReadableId" })
		.option("summary", { type: "string", description: "Summary" })
		.option("filter-account-id", { type: "string", description: "AccountId" })
		.option("metadata", {
			type: "string",
			description:
				'JSON string object of metadata filters. Supports two formats: 1) Simple values for exact match (backward compatible): {"status": "open"} 2) Operator objects for advanced filtering: {"identifiers": {"operator": "contains_line", "value": "blah.com"}}. Available operators: \'eq\' (exact match, default), \'contains\' (substring match), \'contains_line\' (match complete line in newline-separated text). Date fields are automatically normalized to YYYY-MM-DD format.',
		})
		.option("order-by", {
			type: "string",
			description:
				"Sort field. SOC Communications support customer-safe latest_activity ordering.",
		})
		.option("order", { type: "string", description: "Order" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_RequestList">;
type Query = SdkQuery<"get_RequestList">;

const typedBuilder = withArgTypes<
	{
		"project-type": Request["project_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "getRequestList <project-type>",
	describe: "List RFIs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one requests getRequestList",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					pageSize: argv["page-size"],
					status: argv["status"],
					search: argv["search"],
					createdBy: argv["created-by"],
					assignee: argv["assignee"],
					requestType: argv["request-type"],
					priority: argv["priority"],
					tlp: argv["tlp"],
					id: argv["id"],
					readableId: argv["readable-id"],
					summary: argv["summary"],
					accountId: argv["filter-account-id"],
					metadata: argv["metadata"],
					orderBy: argv["order-by"],
					order: argv["order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one requests getRequestList",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/requests/${argv["project-type"] == null ? "<project-type>" : encodeURIComponent(String(argv["project-type"]))}`,
						pathParams: { "project-type": String(argv["project-type"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.cloudforceOne.requests.getRequestList({
						account_id: accountId,
						project_type: argv["project-type"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
