/**
 * delete command
 * @generated from apis/overlays/previews.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <name>",
	describe: "Delete Preview",
	usage: "$0 previews delete <name>\n\nDelete a Preview.",
	flags: {
		worker: {
			kind: "parsed",
			brief: "Identifier for the Worker, which can be ID or name.",
			parse: String,
		},
		"delete-with-references": {
			kind: "boolean",
			brief:
				"If true, delete the Preview even when other Workers still reference it. Service bindings in those Workers may be left broken. Durable Object namespaces implemented by the deleted Preview are deleted even if other Workers reference them.",
			optional: true,
		},
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
	},
	operands: [
		{
			placeholder: "name",
			brief:
				"Identifier for the Preview, which can be ID, slug, or URL-encoded name.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "previews delete",
				classification: {
					safeFlags: ["delete-with-references", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					force: argv["delete-with-references"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf previews delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/workers/${argv["worker"] == null ? "<worker>" : encodeURIComponent(String(argv["worker"]))}/previews/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}`,
						pathParams: {
							worker: String(argv["worker"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation permanently deletes the Preview.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"DELETE",
						`/accounts/${accountId}/workers/workers/${encodeURIComponent(String(argv["worker"]))}/previews/${encodeURIComponent(String(argv["name"]))}`,
						{ query: queryParams }
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
