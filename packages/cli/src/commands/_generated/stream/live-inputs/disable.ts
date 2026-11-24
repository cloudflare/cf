import operation from "../../_operations/stream/live-inputs/disable.js";
/**
 * disable command
 * @generated from apis/overlays/stream.ts
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
	command: "disable <live-input-identifier>",
	describe: "Disable a live input",
	usage:
		"$0 stream live-inputs disable <live-input-identifier>\n\nPrevents a live input from being streamed to and terminates any active broadcasts until re-enabled.",
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
		{
			placeholder: "live-input-identifier",
			brief: "A unique identifier for a live input.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream live-inputs disable",
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
						command: "cf stream live-inputs disable",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/live_inputs/${argv["live-input-identifier"] == null ? "<live-input-identifier>" : encodeURIComponent(String(argv["live-input-identifier"]))}/disable`,
						pathParams: {
							"live-input-identifier": String(
								argv["live-input-identifier"] ?? ""
							),
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
						message: `Disable this live input? Active broadcasts will be terminated and future connections will be blocked until it is re-enabled.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						account_id: accountId,
						live_input_identifier: argv["live-input-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
			}
		),
});

export default command;
