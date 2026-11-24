import operation from "../../../../_operations/cloudforce-one/threat-intel/tags/indicators/list.js";
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
	describe: "List a tag's indicators",
	usage:
		"$0 cloudforce-one threat-intel tags indicators list\n\nLists the indicators that carry a tag, with pagination. By default, every intelligence dataset you can read is searched; use `datasetIds` to limit the search to specific datasets or a scope value. Analytics datasets don't store tag associations, so the `analytics` scope returns no results.",
	flags: {
		"tag-uuid": { kind: "parsed", brief: "Tag UUID.", parse: String },
		"dataset-ids": {
			kind: "parsed",
			brief:
				"Dataset UUIDs to scope to (repeat the param for multiple), or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Analytics datasets do not expose tag associations, so 'analytics' returns an empty result. Omit for 'all'.",
			variadic: true,
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number (default 1). page × pageSize may not exceed 10000.",
			optional: true,
			parse: Number,
		},
		"page-size": {
			kind: "parsed",
			brief:
				"Results per page (default 100, maximum 1000; larger values are clamped).",
			optional: true,
			parse: Number,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "IndicatorType",
			optional: true,
			parse: String,
		},
		"related-event": {
			kind: "parsed",
			brief:
				"Filter indicators by related event UUID(s). Multiple UUIDs can be provided by repeating the parameter.",
			variadic: true,
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"Structured search as a JSON array of {field, op, value} objects. Searchable fields: value, indicatorType. Multiple conditions are AND'd together. Max 10 conditions per request.",
			variadic: true,
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
				command: "cloudforce-one threat-intel tags indicators list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					datasetIds: argv["dataset-ids"],
					page: argv["page"],
					pageSize: argv["page-size"],
					indicatorType: argv["indicator-type"],
					relatedEvent: argv["related-event"],
					search: argv["search"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel tags indicators list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}/indicators`,
						pathParams: { "tag-uuid": String(argv["tag-uuid"] ?? "") },
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
						tag_uuid: argv["tag-uuid"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
