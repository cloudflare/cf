import operation from "../../../../_operations/cloudforce-one/threat-intel/tags/relationships/delete.js";
/**
 * delete command
 * @generated from apis/overlays/cloudforce-one.ts
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
	command: "delete <rel-uuid>",
	describe: "Delete a tag relationship",
	usage:
		"$0 cloudforce-one threat-intel tags relationships delete <rel-uuid>\n\nDeletes a tag relationship by its UUID. `datasetId` is required. Returns `deleted: false` if the relationship doesn't exist.",
	flags: {
		"tag-uuid": { kind: "parsed", brief: "Tag UUID.", parse: String },
		"dataset-id": {
			kind: "parsed",
			brief: "Dataset UUID containing the relationship.",
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
	operands: [
		{ placeholder: "rel-uuid", brief: "Relationship UUID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel tags relationships delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					datasetId: argv["dataset-id"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel tags relationships delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}/relationships/${argv["rel-uuid"] == null ? "<rel-uuid>" : encodeURIComponent(String(argv["rel-uuid"]))}`,
						pathParams: {
							"tag-uuid": String(argv["tag-uuid"] ?? ""),
							"rel-uuid": String(argv["rel-uuid"] ?? ""),
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
						tag_uuid: argv["tag-uuid"],
						rel_uuid: argv["rel-uuid"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
