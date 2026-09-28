import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * upload command
 * @generated from apis/overlays/ai-search.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ai-search items upload <id>\n\nUploads a file to a managed AI Search instance via multipart/form-data."
		)
		.positional("id", {
			type: "string",
			description: "AI Search instance ID.",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description: "Namespace to use for this operation.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		})
		.option("metadata", {
			type: "string",
			description: "JSON string of custom metadata key-value pairs.",
		})
		.option("wait-for-completion", {
			type: "boolean",
			description:
				"Wait for indexing to fully complete before responding. On RAGs with vector indexing enabled, this additionally waits for Vectorize ingestion confirmation (up to 40s) so the returned item reflects a queryable state. On timeout the item is returned in \`running\` state and the background alarm continues polling. Defaults to false.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "upload <id>",
	describe: "Upload Item.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search items upload",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search items upload",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/instances/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/items`,
						pathParams: {
							id: String(argv["id"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						bodyKind: "multipart",
						body: {
							body: argv["body"],
							file: argv["file"],
							metadata: argv["metadata"],
							"wait-for-completion": argv["wait-for-completion"],
						},
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					argv.file !== undefined ||
					argv.body !== undefined ||
					argv["metadata"] !== undefined ||
					argv["wait-for-completion"] !== undefined
				) {
					const formData = new FormData();
					if (argv.file) {
						const fileContent = readFileForFlag(argv.file);
						formData.append(
							"file",
							new Blob([fileContent]),
							argv.file.split(/[\\/]/).filter(Boolean).pop()
						);
					} else if (argv.body !== undefined) {
						formData.append("file", argv.body);
					}
					if (argv["metadata"] !== undefined)
						formData.append(
							"metadata",
							String(
								resolveFileToken(
									argv["metadata"] as string | undefined,
									"metadata",
									"text"
								) ?? ""
							)
						);
					if (argv["wait-for-completion"] !== undefined)
						formData.append(
							"wait_for_completion",
							String(argv["wait-for-completion"])
						);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["name"]))}/instances/${encodeURIComponent(String(argv["id"]))}/items`,
							{ body: formData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["name"]))}/instances/${encodeURIComponent(String(argv["id"]))}/items`,
							{
								body: bodyData,
								headers: { "Content-Type": "multipart/form-data" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
