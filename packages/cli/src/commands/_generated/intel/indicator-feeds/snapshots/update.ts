import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel indicator-feeds snapshots update <feed-id>\n\nRevises the raw data entries in a custom threat indicator feed. Accepts both plain and gzipped STIX2/CRDF bodies. Gzip is detected by RFC 1952 magic bytes (`0x1f 0x8b`) and/or a `.gz` filename suffix (case-insensitive) — either signal alone is sufficient to trigger the gzip path; if the body is not valid gzip, the upload fails fast. Customers are encouraged to gzip larger uploads — the api-gateway 500 MB body cap applies to the on-the-wire (compressed) size, so gzip lets a single upload carry several GiB of decompressed STIX."
		)
		.positional("feed-id", {
			type: "string",
			description: "Indicator feed ID",
			demandOption: true,
		})
		.option("cf-async-upload", {
			type: "string",
			description:
				"Set to the literal value `1` to enqueue the upload and receive a\n`202` response with a polling URL. Any other value uses the legacy\nsynchronous response.",
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
		.option("source", {
			type: "string",
			description:
				"The file to upload. Either a plain STIX2/CRDF body or a gzipped one (recognised by \`0x1f 0x8b\` magic bytes or a \`.gz\` filename suffix). ",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <feed-id>",
	describe: "Update indicator feed data",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel indicator-feeds snapshots update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cf-async-upload"] !== undefined)
					headers["Cf-Async-Upload"] = String(argv["cf-async-upload"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf intel indicator-feeds snapshots update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/intel/indicator-feeds/${argv["feed-id"] == null ? "<feed-id>" : encodeURIComponent(String(argv["feed-id"]))}/snapshot`,
						pathParams: { "feed-id": String(argv["feed-id"] ?? "") },
						bodyKind: "multipart",
						body: {
							body: argv["body"],
							file: argv["file"],
							source: argv["source"],
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
					argv["source"] !== undefined
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
					if (argv["source"] !== undefined)
						formData.append(
							"source",
							String(
								resolveFileToken(
									argv["source"] as string | undefined,
									"source",
									"text"
								) ?? ""
							)
						);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/intel/indicator-feeds/${encodeURIComponent(String(argv["feed-id"]))}/snapshot`,
							{
								body: formData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/intel/indicator-feeds/${encodeURIComponent(String(argv["feed-id"]))}/snapshot`,
							{
								body: bodyData,
								headers: { "Content-Type": "multipart/form-data", ...headers },
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
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
