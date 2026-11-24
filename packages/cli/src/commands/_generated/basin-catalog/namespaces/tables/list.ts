import operation from "../../../_operations/basin-catalog/namespaces/tables/list.js";
/**
 * list command
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
	command: "list",
	describe: "List tables in namespace",
	usage:
		"$0 basin-catalog namespaces tables list\n\nReturns a list of tables in the specified namespace within a Basin Catalog. Supports pagination for efficient traversal of large table collections.",
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
		"page-token": {
			kind: "parsed",
			brief:
				"Opaque pagination token from a previous response.\nUse this to fetch the next page of results.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief:
				"Maximum number of tables to return per page.\nDefaults to 100, maximum 1000.",
			optional: true,
			parse: Number,
		},
		"return-uuids": {
			kind: "boolean",
			brief:
				"Whether to include table UUIDs in the response.\nSet to true to receive the table_uuids array.",
			optional: true,
		},
		"return-details": {
			kind: "boolean",
			brief:
				"Whether to include additional metadata (timestamps, locations).\nWhen true, response includes created_at, updated_at, metadata_locations, and locations arrays.",
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
				command: "basin-catalog namespaces tables list",
				classification: {
					safeFlags: ["return-uuids", "return-details", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page_token: argv["page-token"],
					page_size: argv["page-size"],
					return_uuids: argv["return-uuids"],
					return_details: argv["return-details"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf basin-catalog namespaces tables list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/tables`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
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
						bucket_name: argv["bucket-name"],
						namespace: argv["namespace"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
