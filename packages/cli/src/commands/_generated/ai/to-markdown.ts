/**
 * to-markdown command
 * @generated from apis/overlays/ai.ts
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
	command: "to-markdown",
	describe: "Convert uploaded files to Markdown",
	usage:
		"$0 ai to-markdown\n\nConverts files uploaded as multipart form data into Markdown using Workers AI. Returns a conversion result for each file. Use the supported-formats endpoint to check accepted file types.",
	flags: {
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
		files: {
			kind: "parsed",
			brief:
				"Literal content or @path/to/file for the `files` form field. Repeat for multiple files. Files to convert, supplied as multipart file uploads.",
			variadic: true,
			optional: true,
			requiresArg: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai to-markdown",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (
					argv.body === undefined &&
					argv.file === undefined &&
					argv["files"] === undefined
				) {
					throw new Error(
						"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
					);
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai to-markdown",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai/tomarkdown`,
						pathParams: {},
						bodyKind: "multipart",
						body: {
							body: argv["body"],
							file: argv["file"],
							files: argv["files"],
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
					argv["files"] !== undefined
				) {
					const formData = new FormData();
					if (argv.file !== undefined) {
						const fileContent = readFileForFlag(argv.file);
						formData.append(
							"files",
							new Blob([fileContent]),
							argv.file.split(/[\\/]/).filter(Boolean).pop()
						);
					} else if (argv.body !== undefined) {
						formData.append("files", argv.body);
					}
					if (argv["files"] !== undefined) {
						for (const value of argv["files"]) {
							if (value.startsWith("@")) {
								const filePath = value.slice(1);
								const fileContent = resolveFileToken(
									value,
									"files",
									"binary"
								) as Buffer<ArrayBuffer>;
								formData.append(
									"files",
									new Blob([fileContent]),
									filePath.split(/[\\/]/).filter(Boolean).pop()
								);
							} else {
								formData.append("files", new Blob([value]), "files");
							}
						}
					}
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/ai/tomarkdown`,
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
							`/accounts/${accountId}/ai/tomarkdown`,
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
