import operation from "../../../_operations/basin-catalog/namespaces/tables/get.js";
/**
 * get command
 * @generated from apis/overlays/basin-catalog.ts
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
	command: "get <table-name>",
	describe: "Get table details",
	usage:
		"$0 basin-catalog namespaces tables get <table-name>\n\nReturns full Apache Iceberg metadata for a single table: schema, partition specs, sort orders, properties, and recent snapshot history. Designed for catalog introspection UIs that need per-table details without holding R2 credentials. The `metadata.snapshots`, `metadata.snapshot-log`, and `metadata.metadata-log` arrays are pruned to the most recent 10 entries by `timestamp-ms`. Use `total_snapshots` and `returned_snapshots` to surface the truncation to end users.",
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Specifies the R2 bucket name.",
			parse: String,
		},
		namespace: {
			kind: "parsed",
			brief:
				'The namespace identifier.\nFor nested namespaces, use %1F as separator (e.g., "bronze%1Fanalytics").',
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "table-name",
			brief: "The table name within the given namespace.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog namespaces tables get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf basin-catalog namespaces tables get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/tables/${argv["table-name"] == null ? "<table-name>" : encodeURIComponent(String(argv["table-name"]))}`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
							"table-name": String(argv["table-name"] ?? ""),
						},
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
						bucket_name: argv["bucket-name"],
						namespace: argv["namespace"],
						table_name: argv["table-name"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
