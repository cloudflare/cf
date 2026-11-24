import operation from "../../../../_operations/cloudforce-one/threat-intel/tags/relationships/list.js";
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
	describe: "List tag relationships",
	usage:
		"$0 cloudforce-one threat-intel tags relationships list\n\nLists the relationships that start at a tag, across the intelligence datasets you can read. Use `datasets` to limit the datasets (`all` and `operational` are equivalent here) and `expand` to include the related entities. Analytics datasets don't store tag associations, so the `analytics` scope returns no results.",
	flags: {
		"tag-uuid": { kind: "parsed", brief: "Tag UUID.", parse: String },
		datasets: {
			kind: "parsed",
			brief:
				"Comma-separated dataset UUIDs to scope to, or one standalone scope value: 'all'/'*' or 'operational' for readable intelligence datasets (isAnalytics=false), or 'analytics' for readable analytics datasets (isAnalytics=true). Analytics datasets do not expose tag associations, so 'analytics' returns an empty result. Omit for 'all'.",
			variadic: true,
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief:
				"JSON array of {field, op, value} filters (same as indicator list search).",
			variadic: true,
			optional: true,
			parse: String,
		},
		expand: {
			kind: "parsed",
			brief: "Comma-separated entity types to hydrate (event, indicator, tag).",
			variadic: true,
			optional: true,
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque cursor from a previous page. Results are ordered by createdAt ascending. Cursors in an older format are rejected; restart without a cursor.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief: "Page size (1–100, default 25).",
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
				command: "cloudforce-one threat-intel tags relationships list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					datasets: argv["datasets"],
					search: argv["search"],
					expand: argv["expand"],
					cursor: argv["cursor"],
					pageSize: argv["page-size"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel tags relationships list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}/relationships`,
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
