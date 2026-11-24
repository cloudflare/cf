import operation from "../_operations/pipelines/update-tables.js";
/**
 * update-tables command
 * @generated from apis/overlays/pipelines.ts
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
	command: "update-tables <pipeline-id>",
	describe: "Update Pipeline Tables",
	usage:
		"$0 pipelines update-tables <pipeline-id>\n\nMove a Pipeline to the latest version of every stream and sink it uses, such as after updating a Sink. A running Pipeline restarts on the latest versions from a final checkpoint; a paused or stopped Pipeline uses them once it starts.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "pipeline-id",
			brief: "Specifies the public ID of the pipeline.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pipelines update-tables",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pipelines update-tables",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/v1/pipelines/${argv["pipeline-id"] == null ? "<pipeline-id>" : encodeURIComponent(String(argv["pipeline-id"]))}/update_tables`,
						pathParams: { "pipeline-id": String(argv["pipeline-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						account_id: accountId,
						pipeline_id: argv["pipeline-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
