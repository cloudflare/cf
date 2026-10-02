import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
			"$0 zero-trust casb findings instances list\n\nLists all security finding instances for a given security finding."
		)
		.option("finding-id", {
			type: "string",
			description:
				"The `id` of a finding, as returned in each item of the List posture findings response.\nIt is a base64-encoded identifier.",
			demandOption: true,
		})
		.option("archived", { type: "boolean", description: "Archived" })
		.option("cursor", {
			type: "string",
			description:
				"A cursor for pagination. Obtained from the `result_info.cursor` field of a previous response.",
		})
		.option("direction", {
			type: "string",
			description: "Direction to order results.",
			choices: ["asc", "desc"],
		})
		.option("max-affliction-date", {
			type: "string",
			description:
				"Filter to view findings that occurred on or before the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
		})
		.option("min-affliction-date", {
			type: "string",
			description:
				"Filter to view findings that occurred on or after the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
		})
		.option("order", {
			type: "string",
			description:
				"Which field to use when ordering the Finding's instances.\nWhen ordering by 'remediation.status', only the most recent non-stale remediation job is considered. Stale jobs (created before the instance's affliction_date) are treated as having no status for ordering purposes.",
			choices: ["affliction_date", "asset.name", "remediation.status"],
		})
		.option("page", {
			type: "number",
			description: "A page number within the paginated result set.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of results to return per page.",
		})
		.option("search", { type: "string", description: "A search term." })
		.option("remediation-statuses", {
			type: "string",
			description:
				"Filter finding instances by most recent remediation job status. Supports multiple comma-separated values.\nUse 'none' to filter instances with no remediation jobs or instances where the most recent job is stale.\nNote: Stale jobs (created before the instance's affliction_date) are ignored for filtering purposes, but are still included in the 'remediations' array with stale=true.",
		})
		.option("finding-instance-ids", {
			type: "string",
			description:
				"Filter finding instances by an array of finding instance IDs. Supports multiple comma-separated values.",
		})
		.option("asset-ids", {
			type: "string",
			description:
				"Filter finding instances by an array of asset IDs. Supports multiple comma-separated values.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"ListFindingInstances">;
type Query = SdkQuery<"ListFindingInstances">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		order: Query["order"];
		"remediation-statuses": Query["remediation_statuses"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List instances of a finding",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb findings instances list",
				classification: {
					safeFlags: ["archived", "direction", "order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					archived: argv["archived"],
					cursor: argv["cursor"],
					direction: argv["direction"],
					max_affliction_date: argv["max-affliction-date"],
					min_affliction_date: argv["min-affliction-date"],
					order: argv["order"],
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					remediation_statuses: argv["remediation-statuses"],
					finding_instance_ids: argv["finding-instance-ids"],
					asset_ids: argv["asset-ids"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb findings instances list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/findings/${argv["finding-id"] == null ? "<finding-id>" : encodeURIComponent(String(argv["finding-id"]))}/instances`,
						pathParams: { "finding-id": String(argv["finding-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.casb.findings.instances.list({
						account_id: accountId,
						finding_id: argv["finding-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
