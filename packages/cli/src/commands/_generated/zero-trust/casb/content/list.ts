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
		.usage("$0 zero-trust casb content list\n\nList DLP content findings")
		.option("direction", {
			type: "string",
			description: "Direction to order results.",
			choices: ["asc", "desc"],
		})
		.option("dlp-profile-id", {
			type: "string",
			description: "Filter by an DLP profile ID",
		})
		.option("integration-id", {
			type: "string",
			description: "Filter by an integration ID",
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
			description: "Which field to use when ordering content assets.",
			choices: [
				"asset_name",
				"dlp_profile_count",
				"integration_name",
				"latest_affliction_date",
			],
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
		.option("vendor", {
			type: "string",
			description: "Filter by vendor",
			choices: [
				"ANTHROPIC",
				"AWS",
				"BITBUCKET",
				"BOX",
				"CONFLUENCE",
				"DROPBOX",
				"GITHUB",
				"GOOGLE_CLOUD_PLATFORM",
				"GOOGLE_WORKSPACE",
				"JIRA",
				"MICROSOFT",
				"MICROSOFT_INTERNAL",
				"OPENAI",
				"SALESFORCE",
				"SERVICENOW",
				"SLACK",
				"ZOOM",
			],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"ListContentAssets">;
type Query = SdkQuery<"ListContentAssets">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		order: Query["order"];
		vendor: Query["vendor"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List DLP content findings",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb content list",
				classification: {
					safeFlags: ["direction", "order", "vendor", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					direction: argv["direction"],
					dlp_profile_id: argv["dlp-profile-id"],
					integration_id: argv["integration-id"],
					max_affliction_date: argv["max-affliction-date"],
					min_affliction_date: argv["min-affliction-date"],
					order: argv["order"],
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					vendor: argv["vendor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb content list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/content`,
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
					client.zeroTrust.casb.content.list({
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
