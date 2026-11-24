import operation from "../../_operations/user/tokens/delete.js";
/**
 * delete command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { confirmDelete } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <token-id>",
	describe: "Delete Token",
	usage: "$0 user tokens delete <token-id>\n\nDestroy a token.",
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
	},
	operands: [
		{ placeholder: "token-id", brief: "Token identifier tag.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user tokens delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user tokens delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/user/tokens/${argv["token-id"] == null ? "<token-id>" : encodeURIComponent(String(argv["token-id"]))}`,
						pathParams: { "token-id": String(argv["token-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `Are you sure? This action cannot be undone.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, { token_id: argv["token-id"] })
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
