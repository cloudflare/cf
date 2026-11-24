import operation from "../../_operations/resource-sharing/recipients/replace.js";
/**
 * replace command
 * @generated from apis/overlays/resource-sharing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "replace <share-id>",
	describe: "Trigger recipient reconciliation on a share",
	usage:
		"$0 resource-sharing recipients replace <share-id>\n\nReplaces the full recipient list for an account-targeted share. The server computes the diff between the current and desired recipients: new accounts are added, accounts no longer in the list are marked for disassociation, and unchanged accounts are left as-is. Returns an error if the share targets an organization (`target_type=organization`) and the list is non-empty; org-targeted shares derive their recipients dynamically from org membership and cannot be modified through this endpoint.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "share-id", brief: "Share identifier tag.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing recipients replace",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing recipients replace",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/recipients`,
						pathParams: { "share-id": String(argv["share-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [], 100)
								: undefined,
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body, [], 100) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Accounts omitted from the list are disassociated from the share.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							share_id: argv["share-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
			}
		),
});

export default command;
