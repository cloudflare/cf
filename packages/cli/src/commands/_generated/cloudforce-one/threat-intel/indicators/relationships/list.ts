import operation from "../../../../_operations/cloudforce-one/threat-intel/indicators/relationships/list.js";
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
	describe: "List indicator relationships",
	usage:
		"$0 cloudforce-one threat-intel indicators relationships list\n\nLists the relationships that start at an indicator. Use `search` to filter them and `expand` to include the related entities in the response.",
	flags: {
		"dataset-id": { kind: "parsed", brief: "Dataset UUID.", parse: String },
		"indicator-id": { kind: "parsed", brief: "Indicator UUID.", parse: String },
		search: {
			kind: "parsed",
			brief:
				'JSON array of {field, op, value} filters, AND-combined. Fields: entityType (other-end type), type (relationship type), confidence (0–100), metadata.<key>. Example: [{"field":"type","op":"equals","value":"appears_in"},{"field":"confidence","op":"gte","value":50}]',
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
			brief: "Keyset cursor from a previous page.",
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
				command: "cloudforce-one threat-intel indicators relationships list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					search: argv["search"],
					expand: argv["expand"],
					cursor: argv["cursor"],
					pageSize: argv["page-size"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one threat-intel indicators relationships list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/indicators/${argv["indicator-id"] == null ? "<indicator-id>" : encodeURIComponent(String(argv["indicator-id"]))}/relationships`,
						pathParams: {
							"dataset-id": String(argv["dataset-id"] ?? ""),
							"indicator-id": String(argv["indicator-id"] ?? ""),
						},
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
						dataset_id: argv["dataset-id"],
						indicator_id: argv["indicator-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
