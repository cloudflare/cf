import operation from "../../../_operations/stream/videos/downloads/create.js";
/**
 * create command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <download-type>",
	describe: "Create download",
	usage:
		"$0 stream videos downloads create <download-type>\n\nCreates a download for a video of specified type. For backwards-compatibility, POST requests to /downloads will enable the default download.",
	flags: {
		identifier: {
			kind: "parsed",
			brief: "A Cloudflare-generated unique identifier for a media item.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "download-type",
			brief: "The type of downloads available are: \`default\`, \`audio\`.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "stream videos downloads create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf stream videos downloads create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/stream/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/downloads/${argv["download-type"] == null ? "<download-type>" : encodeURIComponent(String(argv["download-type"]))}`,
						pathParams: {
							identifier: String(argv["identifier"] ?? ""),
							"download-type": String(argv["download-type"] ?? ""),
						},
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
						identifier: argv["identifier"],
						download_type: argv["download-type"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
