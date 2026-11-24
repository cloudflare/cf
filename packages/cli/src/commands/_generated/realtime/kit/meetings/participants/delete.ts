import operation from "../../../../_operations/realtime/kit/meetings/participants/delete.js";
/**
 * delete command
 * @generated from apis/overlays/realtime.ts
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
	command: "delete <participant-id>",
	describe: "Delete a participant",
	usage:
		"$0 realtime kit meetings participants delete <participant-id>\n\nDeletes a participant for the given meeting and participant ID.",
	flags: {
		"app-id": {
			kind: "parsed",
			brief: "The app identifier tag.",
			parse: String,
		},
		"meeting-id": {
			kind: "parsed",
			brief:
				"ID of the meeting. You can fetch the meeting ID using the create a meeting API.",
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
		{
			placeholder: "participant-id",
			brief:
				"ID of the participant. You can fetch the participant ID using the add a participant API.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "realtime kit meetings participants delete",
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
						command: "cf realtime kit meetings participants delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/realtime/kit/${argv["app-id"] == null ? "<app-id>" : encodeURIComponent(String(argv["app-id"]))}/meetings/${argv["meeting-id"] == null ? "<meeting-id>" : encodeURIComponent(String(argv["meeting-id"]))}/participants/${argv["participant-id"] == null ? "<participant-id>" : encodeURIComponent(String(argv["participant-id"]))}`,
						pathParams: {
							"app-id": String(argv["app-id"] ?? ""),
							"meeting-id": String(argv["meeting-id"] ?? ""),
							"participant-id": String(argv["participant-id"] ?? ""),
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
						message: `This operation removes the participant from the meeting and revokes their authentication token.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						app_id: argv["app-id"],
						meeting_id: argv["meeting-id"],
						participant_id: argv["participant-id"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
