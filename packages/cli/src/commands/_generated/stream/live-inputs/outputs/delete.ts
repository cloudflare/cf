import operation from "../../../_operations/stream/live-inputs/outputs/delete.js";
/**
 * delete command
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
	command: "delete <output-identifier>",
	describe: "Delete an output",
	usage:
		"$0 stream live-inputs outputs delete <output-identifier>\n\nDeletes an output and removes it from the associated live input.",
	flags: {
		"live-input-identifier": {
			kind: "parsed",
			brief: "A unique identifier for a live input.",
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
			placeholder: "output-identifier",
			brief: "A unique identifier for the output.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream live-inputs outputs delete",
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
						command: "cf stream live-inputs outputs delete",
						method: "DELETE",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/live_inputs/${argv["live-input-identifier"] == null ? "<live-input-identifier>" : encodeURIComponent(String(argv["live-input-identifier"]))}/outputs/${argv["output-identifier"] == null ? "<output-identifier>" : encodeURIComponent(String(argv["output-identifier"]))}`,
						pathParams: {
							"live-input-identifier": String(
								argv["live-input-identifier"] ?? ""
							),
							"output-identifier": String(argv["output-identifier"] ?? ""),
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
						message: `Delete this output? Any active broadcast to this target will be terminated.`,
					}))
				) {
					return;
				}

				const result = await withProgress(`Deleting`, async () =>
					client.send(operation, {
						account_id: accountId,
						live_input_identifier: argv["live-input-identifier"],
						output_identifier: argv["output-identifier"],
					})
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
});

export default command;
