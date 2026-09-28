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
 * applications command
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts applications get applications\n\nList the applications available to an account, both the applications Cloudflare curates and the custom applications the account has defined. Results are paginated. Use `filter` and `search` to narrow the list, `order_by` to sort it, and `fields` to reduce each result to only the properties you need. The authenticated principal must have access to the account identified by `account_id`."
		)
		.option("filter", {
			type: "string",
			description:
				"Filter applications using key:value format. Supported filter keys:\n- name: Filter by application name (e.g., name:HR)\n- id: Filter by application ID (e.g., id:498)\n- human_id: Filter by human-readable ID (e.g., human_id:HR)\n- hostname: Filter by hostname or support domain (e.g., hostname:portal.example.com)\n- source: Filter by application source name (e.g., source:cloudflare)\n- ip_subnet: Filter by IP subnet using CIDR containment — returns applications where any stored subnet contains the search value (e.g., ip_subnet:10.0.1.5/32 matches apps with 10.0.0.0/16)\n- category_id: Filter by category ID (e.g., category_id:12).\n- category_name: Filter by category name (e.g., category_name:HR).\n- supported: Filter by supported Cloudflare product (e.g., supported:ACCESS). Values: GATEWAY, ACCESS, CASB.\n- review_status: Filter by the account's Gateway review status. Values: approved, unapproved, in_review, unreviewed.\n.",
		})
		.option("limit", {
			type: "number",
			description: "Limit of number of results to return (max 250).",
		})
		.option("offset", {
			type: "number",
			description: "Offset of results to return.",
		})
		.option("order-by", {
			type: "string",
			description:
				"Order results using field:direction format. Supported fields are name, id, human_id,\ncategory_id, application_type, application_confidence_score, and gen_ai_score.\nSupported directions are asc and desc. Ignored when search is provided; results are\nranked by relevance instead.",
		})
		.option("search", {
			type: "string",
			description:
				"Fuzzy search across application name and hostnames. Results are ranked by relevance. Must be between 2 and 200 characters. Can be combined with filter parameters.",
		})
		.option("fields", {
			type: "string",
			description:
				"Return only the listed properties on each application, as a comma-separated list.\nUse this to keep responses small when you only need part of each application — for\nexample populating a picker with `fields=id,name` instead of downloading every\nhostname and IP subnet.\n\nOmit this parameter to receive the full application object.\n\n`id` is always returned.\n\nSelectable properties: `id`, `name`, `human_id`, `version`, `hostnames`,\n`support_domains`, `ip_subnets`, `port_protocols`, `supported`, `gen_ai_score`,\n`application_confidence_score`, `created_at`, `updated_at`, `review_status`.\n\nUnknown or empty property names return `400`.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"getResourceLibraryApplications">;
type Query = SdkQuery<"getResourceLibraryApplications">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "applications",
	describe: "List applications",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts applications get applications",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					filter: argv["filter"],
					limit: argv["limit"],
					offset: argv["offset"],
					order_by: argv["order-by"],
					search: argv["search"],
					fields: argv["fields"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts applications get applications",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/resource-library/applications`,
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
					client.accounts.applications.get.applications({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
