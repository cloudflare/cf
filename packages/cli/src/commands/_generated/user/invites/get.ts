import operation from "../../_operations/user/invites/get.js";
/**
 * get command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <invite-id>",
	describe: "Invitation Details",
	usage:
		"$0 user invites get <invite-id>\n\nGets the details of an invitation.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "invite-id",
			brief: "Invite identifier tag.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user invites get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user invites get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/invites/${argv["invite-id"] == null ? "<invite-id>" : encodeURIComponent(String(argv["invite-id"]))}`,
						pathParams: { "invite-id": String(argv["invite-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { invite_id: argv["invite-id"] })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
