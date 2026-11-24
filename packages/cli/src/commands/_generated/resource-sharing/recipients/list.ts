import operation from "../../_operations/resource-sharing/recipients/list.js";
/**
 * list command
 * @generated from apis/overlays/resource-sharing.ts
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
	describe: "List share recipients by share ID",
	usage:
		'$0 resource-sharing recipients list\n\nList share recipients by share ID. Returns **all** recipients regardless of their `association_status` (associating, associated, disassociating, disassociated). Callers that want only "active" recipients must filter client-side on the `association_status` field.',
	flags: {
		"share-id": {
			kind: "parsed",
			brief: "Share identifier tag.",
			parse: String,
		},
		"include-resources": {
			kind: "boolean",
			brief: "Include resources in the response.",
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number. Defaults to `1` when omitted.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of objects to return per page. Defaults to `20` when omitted.",
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
				command: "resource-sharing recipients list",
				classification: {
					safeFlags: ["include-resources", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					include_resources: argv["include-resources"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing recipients list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/recipients`,
						pathParams: { "share-id": String(argv["share-id"] ?? "") },
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
						share_id: argv["share-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
