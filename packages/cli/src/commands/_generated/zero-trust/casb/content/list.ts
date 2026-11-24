import operation from "../../../_operations/zero-trust/casb/content/list.js";
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
	describe: "List DLP content findings",
	usage: "$0 zero-trust casb content list\n\nList DLP content findings",
	flags: {
		direction: {
			kind: "enum",
			brief: "Direction to order results.",
			values: ["asc", "desc"],
			optional: true,
		},
		"dlp-profile-id": {
			kind: "parsed",
			brief: "Filter by an DLP profile ID",
			optional: true,
			parse: String,
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
		order: {
			kind: "enum",
			brief: "Which field to use when ordering content assets.",
			values: [
				"asset_name",
				"dlp_profile_count",
				"integration_name",
				"latest_affliction_date",
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
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
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
				command: "zero-trust casb content list",
				classification: {
					safeFlags: ["direction", "order", "vendor", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
