import operation from "../_operations/agent-memory/delete-memory.js";
/**
 * delete-memory command
 * @generated from apis/overlays/agent-memory.ts
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
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete-memory <memory-id>",
	describe: "Delete a memory",
	usage:
		"$0 agent-memory delete-memory <memory-id>\n\nDeletes a memory by ID. Removes the memory and any source messages linked to it. Returns the deleted memory.",
	flags: {
		"namespace-name": {
			kind: "parsed",
			brief: "Namespace name.",
			parse: String,
		},
		"profile-name": { kind: "parsed", brief: "Profile name.", parse: String },
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
		{ placeholder: "memory-id", brief: "Memory Identifier.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "agent-memory delete-memory",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf agent-memory delete-memory",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/agent-memory/namespaces/${argv["namespace-name"] == null ? "<namespace-name>" : encodeURIComponent(String(argv["namespace-name"]))}/profiles/${argv["profile-name"] == null ? "<profile-name>" : encodeURIComponent(String(argv["profile-name"]))}/memories/${argv["memory-id"] == null ? "<memory-id>" : encodeURIComponent(String(argv["memory-id"]))}`,
						pathParams: {
							"namespace-name": String(argv["namespace-name"] ?? ""),
							"profile-name": String(argv["profile-name"] ?? ""),
							"memory-id": String(argv["memory-id"] ?? ""),
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
						message: `This operation deletes the memory and any source messages linked to it.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						namespace_name: argv["namespace-name"],
						profile_name: argv["profile-name"],
						memory_id: argv["memory-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
