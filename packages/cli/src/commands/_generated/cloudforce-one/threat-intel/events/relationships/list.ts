import operation from "../../../../_operations/cloudforce-one/threat-intel/events/relationships/list.js";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
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
	describe: "List related events",
	usage:
		"$0 cloudforce-one threat-intel events relationships list\n\nLists events related to an event by following its relationships. `datasetId` is required. Use `direction`, `maxDepth`, and `relationshipTypes` to control which relationships are followed.",
	flags: {
		"event-id": { kind: "parsed", brief: "Event UUID.", parse: String },
		direction: {
			kind: "enum",
			brief:
				"The direction to traverse the graph. Defaults to 'both' to search all.",
			values: ["ancestors", "descendants", "both"],
			optional: true,
		},
		"max-depth": {
			kind: "parsed",
			brief: "The maximum depth to traverse. Defaults to 5.",
			optional: true,
			parse: Number,
		},
		"relationship-types": {
			kind: "parsed",
			brief: "An optional array of relationship types to filter by.",
			optional: true,
			parse: String,
		},
		"indicator-type-ids": {
			kind: "parsed",
			brief:
				"An optional array of indicator type IDs to filter the results by.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dataset-id": {
			kind: "parsed",
			brief: "The dataset ID to search within.",
			parse: String,
		},
		"include-parent": {
			kind: "boolean",
			brief:
				"Whether to include the starting event in the results. Defaults to true.",
			optional: true,
		},
		page: { kind: "parsed", brief: "Page", optional: true, parse: Number },
		"page-size": {
			kind: "parsed",
			brief: "PageSize",
			optional: true,
			parse: Number,
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
				command: "cloudforce-one threat-intel events relationships list",
				classification: {
					safeFlags: ["direction", "include-parent", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					direction: argv["direction"],
					maxDepth: argv["max-depth"],
					relationshipTypes: argv["relationship-types"],
					indicatorTypeIds: argv["indicator-type-ids"],
					datasetId: argv["dataset-id"],
					includeParent: argv["include-parent"],
					page: argv["page"],
					pageSize: argv["page-size"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel events relationships list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/by-id/${argv["event-id"] == null ? "<event-id>" : encodeURIComponent(String(argv["event-id"]))}/relationships`,
						pathParams: { "event-id": String(argv["event-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						event_id: argv["event-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
