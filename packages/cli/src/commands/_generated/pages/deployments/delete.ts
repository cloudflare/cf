import operation from "../../_operations/pages/deployments/delete.js";
/**
 * delete command
 * @generated from apis/overlays/pages.ts
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
	command: "delete <deployment-id>",
	describe: "Delete a Pages deployment",
	usage:
		"$0 pages deployments delete <deployment-id>\n\nRemove a deployment from a Cloudflare Pages project.",
	flags: {
		"project-name": {
			kind: "parsed",
			brief:
				"Name of the Pages project. Must begin with a lowercase letter or digit and contain only lowercase letters, digits, and hyphens.",
			parse: String,
		},
		"allow-aliased": {
			kind: "boolean",
			brief:
				"Allow deletion when a non-production deployment has an active alias.",
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
			placeholder: "deployment-id",
			brief:
				"UUID of the Pages deployment, as returned by deployment list or create operations.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pages deployments delete",
				classification: {
					safeFlags: ["allow-aliased", "dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					force: argv["allow-aliased"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pages deployments delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pages/projects/${argv["project-name"] == null ? "<project-name>" : encodeURIComponent(String(argv["project-name"]))}/deployments/${argv["deployment-id"] == null ? "<deployment-id>" : encodeURIComponent(String(argv["deployment-id"]))}`,
						pathParams: {
							"project-name": String(argv["project-name"] ?? ""),
							"deployment-id": String(argv["deployment-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (!(await confirmDelete({ force: Boolean(argv.force) }))) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						project_name: argv["project-name"],
						deployment_id: argv["deployment-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
