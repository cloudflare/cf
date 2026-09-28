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
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb findings list\n\nList all security findings that have been identified as being problematic. This will return a list of findings regardless if they have been ignored or not."
		)
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
		.option("ignored", {
			type: "boolean",
			description:
				'Filter for only the ignored findings. Set to false to only see "active" items',
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
		.option("observation", {
			type: "string",
			description: "Filter by observation type of the finding",
			choices: ["Activity", "Insight", "Issue"],
		})
		.option("order", {
			type: "string",
			description: "Which field to use when ordering the findings.",
			choices: [
				"finding.name",
				"instance_count",
				"integration.name",
				"latest_affliction_date",
				"severity",
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
		.option("product", {
			type: "string",
			description: "Filter by product category of the finding",
			choices: ["Cloud", "Saas"],
		})
		.option("search", { type: "string", description: "A search term." })
		.option("severity", {
			type: "string",
			description: "Filter by severity",
			choices: ["Critical", "High", "Medium", "Low"],
		})
		.option("type", {
			type: "string",
			description: "Filter by type of the finding",
			choices: ["Content", "Posture"],
		})
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
		.option("finding-type-ids", {
			type: "string",
			description:
				"A comma separated list of UUIDs identifying the finding type(s).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"ListFindings">;
type Query = SdkQuery<"ListFindings">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		observation: Query["observation"];
		order: Query["order"];
		product: Query["product"];
		severity: Query["severity"];
		type: Query["type"];
		vendor: Query["vendor"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List posture findings",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb findings list",
				classification: {
					safeFlags: [
						"direction",
						"ignored",
						"observation",
						"order",
						"product",
						"severity",
						"type",
						"vendor",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					cursor: argv["cursor"],
					direction: argv["direction"],
					ignored: argv["ignored"],
					integration_id: argv["integration-id"],
					max_affliction_date: argv["max-affliction-date"],
					min_affliction_date: argv["min-affliction-date"],
					observation: argv["observation"],
					order: argv["order"],
					page: argv["page"],
					per_page: argv["per-page"],
					product: argv["product"],
					search: argv["search"],
					severity: argv["severity"],
					type: argv["type"],
					vendor: argv["vendor"],
					finding_type_ids: argv["finding-type-ids"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb findings list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/findings`,
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
					client.zeroTrust.casb.findings.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
