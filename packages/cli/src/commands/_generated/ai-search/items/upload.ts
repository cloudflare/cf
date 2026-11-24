/**
 * upload command
 * @generated from apis/overlays/ai-search.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "upload <instance-id>",
	describe: "Upload Item.",
	usage:
		"$0 ai-search items upload <instance-id>\n\nUploads a file to a managed AI Search instance via multipart/form-data.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Namespace to use for this operation.",
			default: "default",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief: "JSON string of custom metadata key-value pairs.",
			optional: true,
			parse: String,
		},
		"wait-for-completion": {
			kind: "boolean",
			brief:
				"Wait for indexing before responding. After processing, vector-indexed instances use any time remaining in a 25s wait budget to confirm Vectorize ingestion. Processing itself continues uninterrupted and can exceed that budget. If confirmation times out, the response returns the current item state and background indexing continues. Defaults to false.",
			optional: true,
		},
	},
	operands: [
		{
			placeholder: "instance-id",
			brief: "AI Search instance ID.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-search items upload",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (
					argv.body === undefined &&
					argv.file === undefined &&
					argv["metadata"] === undefined &&
					argv["wait-for-completion"] === undefined
				) {
					throw new Error(
						"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
					);
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-search items upload",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-search/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/instances/${argv["instance-id"] == null ? "<instance-id>" : encodeURIComponent(String(argv["instance-id"]))}/items`,
						pathParams: {
							namespace: String(argv["namespace"] ?? ""),
							"instance-id": String(argv["instance-id"] ?? ""),
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
					if (argv.file !== undefined) {
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
							`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/items`,
							{ body: formData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body !== undefined) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/ai-search/namespaces/${encodeURIComponent(String(argv["namespace"]))}/instances/${encodeURIComponent(String(argv["instance-id"]))}/items`,
							{
								body: bodyData,
								headers: { "Content-Type": "multipart/form-data" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
			}
		),
});

export default command;
