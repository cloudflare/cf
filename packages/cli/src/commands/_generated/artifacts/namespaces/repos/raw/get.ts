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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/artifacts.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 artifacts namespaces repos raw get <path>\n\nReturns file bytes resolved by ref and path, with a sniffed content type and browser-safe response headers."
		)
		.positional("path", {
			type: "string",
			description: "File path. May contain slashes.",
			demandOption: true,
		})
		.option("namespace", {
			type: "string",
			description: "Artifacts namespace name.",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description: "Repository name.",
			demandOption: true,
		})
		.option("ref", {
			type: "string",
			description: "Git ref, branch, tag, or 40-character commit hash.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("text", {
			type: "boolean",
			description:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <path>",
	describe: "Read a raw file with content type",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "artifacts namespaces repos raw get",
				classification: {
					safeFlags: ["dry-run", "text"],
				} satisfies ArgClassification<Args>,
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
};

export default command;
