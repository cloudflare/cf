/**
 * get command
 * @generated from apis/overlays/artifacts.ts
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
import { fetchRawBytes, writeRawOutput } from "#lib/raw-fetch.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <path>",
	describe: "Read a raw file with content type",
	usage:
		"$0 artifacts namespaces repos raw get <path>\n\nReturns file bytes resolved by ref and path, with a sniffed content type and browser-safe response headers.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Artifacts namespace name.",
			parse: String,
		},
		name: { kind: "parsed", brief: "Repository name.", parse: String },
		ref: {
			kind: "parsed",
			brief: "Git ref, branch, tag, or 40-character commit hash.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "path",
			brief: "File path. May contain slashes.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "artifacts namespaces repos raw get",
				classification: {
					safeFlags: ["dry-run", "text"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf artifacts namespaces repos raw get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/artifacts/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/repos/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/raw/${argv["ref"] == null ? "<ref>" : encodeURIComponent(String(argv["ref"]))}/${argv["path"] == null ? "<path>" : encodeURIComponent(String(argv["path"]))}`,
						pathParams: {
							namespace: String(argv["namespace"] ?? ""),
							name: String(argv["name"] ?? ""),
							ref: String(argv["ref"] ?? ""),
							path: String(argv["path"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const __cfRawBytes = await withProgress(`Loading`, async () =>
					fetchRawBytes(
						`/accounts/${accountId}/artifacts/namespaces/${encodeURIComponent(String(argv["namespace"]))}/repos/${encodeURIComponent(String(argv["name"]))}/raw/${encodeURIComponent(String(argv["ref"]))}/${encodeURIComponent(String(argv["path"]))}`,
						{
							method: "GET",
							local: argv.local === true,
							persistTo: argv.persistTo as string | undefined,
						}
					)
				);
				writeRawOutput(
					argv.text === true ? __cfRawBytes.toString("utf-8") : __cfRawBytes
				);
				return;
			}
		),
});

export default command;
