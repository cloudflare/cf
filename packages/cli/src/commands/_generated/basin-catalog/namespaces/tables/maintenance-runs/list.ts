import operation from "../../../../_operations/basin-catalog/namespaces/tables/maintenance-runs/list.js";
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
	describe: "List table maintenance runs",
	usage:
		"$0 basin-catalog namespaces tables maintenance-runs list\n\nRetrieves recent table maintenance runs for the current table.",
	flags: {
		"bucket-name": {
			kind: "parsed",
			brief: "Specifies the R2 bucket name.",
			parse: String,
		},
		namespace: { kind: "parsed", brief: "Namespace", parse: String },
		"table-name": { kind: "parsed", brief: "Table name", parse: String },
		"page-size": {
			kind: "parsed",
			brief: "Page size",
			optional: true,
			parse: Number,
		},
		"page-token": {
			kind: "parsed",
			brief: "Page token",
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
				command: "basin-catalog namespaces tables maintenance-runs list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page_size: argv["page-size"],
					page_token: argv["page-token"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf basin-catalog namespaces tables maintenance-runs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/tables/${argv["table-name"] == null ? "<table-name>" : encodeURIComponent(String(argv["table-name"]))}/maintenance-runs`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							namespace: String(argv["namespace"] ?? ""),
							"table-name": String(argv["table-name"] ?? ""),
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
						table_name: argv["table-name"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
