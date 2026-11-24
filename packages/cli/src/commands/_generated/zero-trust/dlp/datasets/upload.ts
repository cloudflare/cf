/**
 * upload command
 * @generated from apis/overlays/zero-trust.ts
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
	command: "upload <dataset-version>",
	describe: "Upload a new version of a dataset",
	usage:
		"$0 zero-trust dlp datasets upload <dataset-version>\n\nThis is used for single-column EDMv1 and Custom Word Lists. The EDM format can only be created in the Cloudflare dashboard. For other clients, this operation can only be used for non-secret Custom Word Lists. The body must be a UTF-8 encoded, newline (NL or CRNL) separated list of words to be matched.",
	flags: {
		"dataset-id": { kind: "parsed", brief: "Dataset ID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Dataset. For custom wordlists this contains UTF-8 patterns separated by newline characters.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "dataset-version", brief: "Version", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp datasets upload",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.body === undefined && argv.file === undefined) {
					throw new Error(
						"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
					);
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp datasets upload",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/datasets/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/upload/${argv["dataset-version"] == null ? "<dataset-version>" : encodeURIComponent(String(argv["dataset-version"]))}`,
						pathParams: {
							"dataset-id": String(argv["dataset-id"] ?? ""),
							"dataset-version": String(argv["dataset-version"] ?? ""),
						},
						bodyKind: "octet-stream",
						body: argv.file !== undefined ? { file: argv.file } : argv.body,
					});
					return;
				}
				const parsedBody =
					argv.file !== undefined
						? undefined
						: resolveFileToken(argv.body, "body", "binary");
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/dlp/datasets/${encodeURIComponent(String(argv["dataset-id"]))}/upload/${encodeURIComponent(String(argv["dataset-version"]))}`,
							{
								body: fileContent,
								headers: { "Content-Type": "application/octet-stream" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/dlp/datasets/${encodeURIComponent(String(argv["dataset-id"]))}/upload/${encodeURIComponent(String(argv["dataset-version"]))}`,
							{
								body: bodyData,
								headers: { "Content-Type": "application/octet-stream" },
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
