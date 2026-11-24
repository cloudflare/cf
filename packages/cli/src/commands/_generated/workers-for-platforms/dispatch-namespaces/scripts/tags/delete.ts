/**
 * delete command
 * @generated from apis/overlays/workers-for-platforms.ts
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
	command: "delete <tag>",
	describe: "Delete Workers for Platforms Script Tag",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts tags delete <tag>\n\nDelete a tag from a script uploaded to a Workers for Platforms dispatch namespace. On `api-version` dates on or after `2026-10-01`, `tag` identifies a key and the operation returns the complete updated tag map. Deleting a missing key succeeds. Earlier versions retain the legacy string-tag behavior and return a null result.",
	flags: {
		"dispatch-namespace": {
			kind: "parsed",
			brief: "Name of the Workers for Platforms dispatch namespace.",
			parse: String,
		},
		"script-name": {
			kind: "parsed",
			brief: "Name of the script.",
			parse: String,
		},
		"api-version": {
			kind: "parsed",
			brief:
				"Requested API compatibility date in `YYYY-MM-DD[.release]` format (UTC). The optional release suffix contains lowercase letters; for example, `2026-10-01.epoch`.\n\nTyped Worker tag operations require a date on or after `2026-10-01`.",
			optional: true,
			parse: String,
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
	operands: [{ placeholder: "tag", brief: "Tag", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"workers-for-platforms dispatch-namespaces scripts tags delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["api-version"] !== undefined)
					headers["api-version"] = String(argv["api-version"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf workers-for-platforms dispatch-namespaces scripts tags delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/tags/${argv["tag"] == null ? "<tag>" : encodeURIComponent(String(argv["tag"]))}`,
						pathParams: {
							"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
							"script-name": String(argv["script-name"] ?? ""),
							tag: String(argv["tag"] ?? ""),
						},
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
						message: `This will delete the tag from the Workers for Platforms script.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					requestApi<unknown>(
						client,
						"DELETE",
						`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}/tags/${encodeURIComponent(String(argv["tag"]))}`,
						{ headers: Object.keys(headers).length > 0 ? headers : undefined }
					)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
