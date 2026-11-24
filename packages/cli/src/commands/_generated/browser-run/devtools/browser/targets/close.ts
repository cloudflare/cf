import operation from "../../../../_operations/browser-run/devtools/browser/targets/close.js";
/**
 * close command
 * @generated from apis/overlays/browser-run.ts
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
	command: "close <target-id>",
	describe: "Close a browser target.",
	usage:
		"$0 browser-run devtools browser targets close <target-id>\n\nCloses a specific browser target (tab, page, etc.) by its ID. Returns 'Target is closing' on success or an error if the target is not found.",
	flags: {
		"session-id": {
			kind: "parsed",
			brief: "Browser session ID.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "target-id", brief: "Target ID to close.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "browser-run devtools browser targets close",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf browser-run devtools browser targets close",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/browser-rendering/devtools/browser/${argv["session-id"] == null ? "<session-id>" : encodeURIComponent(String(argv["session-id"]))}/json/close/${argv["target-id"] == null ? "<target-id>" : encodeURIComponent(String(argv["target-id"]))}`,
						pathParams: {
							"session-id": String(argv["session-id"] ?? ""),
							"target-id": String(argv["target-id"] ?? ""),
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
						session_id: argv["session-id"],
						target_id: argv["target-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
