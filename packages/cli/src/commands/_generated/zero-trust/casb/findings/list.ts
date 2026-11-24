import operation from "../../../_operations/zero-trust/casb/findings/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "list",
	describe: "List posture findings",
	usage:
		"$0 zero-trust casb findings list\n\nList all security findings that have been identified as being problematic. This will return a list of findings regardless if they have been ignored or not.",
	flags: {
		cursor: {
			kind: "parsed",
			brief:
				"A cursor for pagination. Obtained from the `result_info.cursor` field of a previous response.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		ignored: {
			kind: "boolean",
			brief:
				'Filter for only the ignored findings. Set to false to only see "active" items',
			optional: true,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by an integration ID",
			optional: true,
			parse: String,
		},
		"max-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or before the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"min-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or after the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		observation: {
			kind: "enum",
			brief: "Filter by observation type of the finding",
			values: ["Activity", "Insight", "Issue"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Which field to use when ordering the findings.",
			values: [
				"finding.name",
				"instance_count",
				"integration.name",
				"latest_affliction_date",
				"severity",
			],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
		},
		product: {
			kind: "enum",
			brief: "Filter by product category of the finding",
			values: ["Cloud", "Saas"],
			optional: true,
		},
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
		},
		severity: {
			kind: "enum",
			brief: "Filter by severity",
			values: ["Critical", "High", "Medium", "Low"],
			optional: true,
		},
		type: {
			kind: "enum",
			brief: "Filter by type of the finding",
			values: ["Content", "Posture"],
			optional: true,
		},
		vendor: {
			kind: "enum",
			brief: "Filter by vendor",
			values: [
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
			optional: true,
		},
		"finding-type-ids": {
			kind: "parsed",
			brief: "A comma separated list of UUIDs identifying the finding type(s).",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
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
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
