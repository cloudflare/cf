import operation from "../../../_operations/ai/finetunes/assets/download.js";
/**
 * download command
 * @generated from apis/overlays/ai.ts
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
	command: "download <file-name>",
	describe: "Download a Finetune Asset",
	usage:
		"$0 ai finetunes assets download <file-name>\n\nReturns a pre-signed R2 URL for downloading a finetune asset file.",
	flags: {
		"finetune-id": { kind: "parsed", brief: "Finetune ID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "file-name", brief: "File name", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai finetunes assets download",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai finetunes assets download",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai/finetunes/${argv["finetune-id"] == null ? "<finetune-id>" : encodeURIComponent(String(argv["finetune-id"]))}/finetune-assets/${argv["file-name"] == null ? "<file-name>" : encodeURIComponent(String(argv["file-name"]))}`,
						pathParams: {
							"finetune-id": String(argv["finetune-id"] ?? ""),
							"file-name": String(argv["file-name"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						finetune_id: argv["finetune-id"],
						file_name: argv["file-name"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
