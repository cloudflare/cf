import operation from "../../_operations/stream/live-inputs/rotate-keys.js";
/**
 * rotate-keys command
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
	command: "rotate-keys <live-input-identifier>",
	describe: "Rotate keys for a live input",
	usage:
		"$0 stream live-inputs rotate-keys <live-input-identifier>\n\nRotates the credentials for a live input without changing its identifier. Old credentials are revoked, broadcasts using stale credentials are automatically disconnected shortly after rotation, and the response returns refreshed credentials.",
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
				command: "stream live-inputs rotate-keys",
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
						command: "cf stream live-inputs rotate-keys",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/live_inputs/${argv["live-input-identifier"] == null ? "<live-input-identifier>" : encodeURIComponent(String(argv["live-input-identifier"]))}/rotate_keys`,
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
						message: `Rotate keys for this live input? Active broadcasts will be terminated. New broadcasts cannot start with outdated credentials.`,
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
