import operation from "../_operations/resource-sharing/get.js";
/**
 * get command
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
	command: "get <share-id>",
	describe: "Get account share by ID",
	usage: "$0 resource-sharing get <share-id>\n\nFetches share by ID.",
	flags: {
		"include-resources": {
			kind: "boolean",
			brief: "Include resources in the response.",
			optional: true,
		},
		"include-recipient-counts": {
			kind: "boolean",
			brief: "Include recipient counts in the response.",
			optional: true,
		},
		"include-tags-from": {
			kind: "enum",
			brief:
				"Include share tags in the response. `api` reads tags from the tag service; `mirror` reads a local, eventually consistent replica. If the tag lookup fails, the response omits `tags`.",
			values: ["api", "mirror"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "share-id", brief: "Share identifier tag.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing get",
				classification: {
					safeFlags: [
						"include-resources",
						"include-recipient-counts",
						"include-tags-from",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					include_resources: argv["include-resources"],
					include_recipient_counts: argv["include-recipient-counts"],
					include_tags_from: argv["include-tags-from"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}`,
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
