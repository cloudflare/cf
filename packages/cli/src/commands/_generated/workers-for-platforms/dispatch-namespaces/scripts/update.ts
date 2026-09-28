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
 * update command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers-for-platforms dispatch-namespaces scripts update <script-name>\n\nUpload a Workers for Platforms script module to a dispatch namespace. You can find more about the multipart metadata on our docs: https://developers.cloudflare.com/workers/configuration/multipart-upload-metadata/."
		)
		.positional("script-name", {
			type: "string",
			description: "Name of the script, used in URLs and route configuration.",
			demandOption: true,
		})
		.option("dispatch-namespace", {
			type: "string",
			description: "Name of the Workers for Platforms dispatch namespace.",
			demandOption: true,
		})
		.option("bindings-inherit", {
			type: "string",
			description:
				'When set to "strict", the upload will fail if any `inherit` type bindings cannot be resolved against the previous version of the script. Without this, unresolvable inherit bindings are silently dropped.',
			choices: ["strict"],
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
		.option("files", {
			type: "string",
			description:
				"An array of modules (often JavaScript files) comprising a Worker script. At least one module must be present and referenced in the metadata as \`main_module\` or \`body_part\` by filename.<br/>Possible Content-Type(s) are: \`application/javascript+module\`, \`text/javascript+module\`, \`application/javascript\`, \`text/javascript\`, \`text/x-python\`, \`text/x-python-requirement\`, \`application/wasm\`, \`text/plain\`, \`application/octet-stream\`, \`application/source-map\`.",
		})
		.option("metadata", {
			type: "string",
			description:
				"JSON-encoded metadata about the uploaded parts and Worker configuration.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <script-name>",
	describe: "Upload Workers for Platforms Script Module",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workers-for-platforms dispatch-namespaces scripts update",
				classification: {
					safeFlags: ["bindings-inherit", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					bindings_inherit: argv["bindings-inherit"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf workers-for-platforms dispatch-namespaces scripts update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}`,
						pathParams: {
							"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
							"script-name": String(argv["script-name"] ?? ""),
						},
						query: queryParams,
						bodyKind: "multipart",
						body: {
							body: argv["body"],
							file: argv["file"],
							files: argv["files"],
							metadata: argv["metadata"],
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
					argv["files"] !== undefined ||
					argv["metadata"] !== undefined
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
					if (argv["files"] !== undefined) {
						const v =
							typeof argv["files"] === "string"
								? resolveFileToken(argv["files"], "files", "text")
								: argv["files"];
						formData.append(
							"files",
							typeof v === "string" ? v : JSON.stringify(v)
						);
					}
					if (argv["metadata"] !== undefined) {
						const v =
							typeof argv["metadata"] === "string"
								? resolveFileToken(argv["metadata"], "metadata", "text")
								: argv["metadata"];
						formData.append(
							"metadata",
							typeof v === "string" ? v : JSON.stringify(v)
						);
					}
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}`,
							{ body: formData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}${qs ? "?" + qs : ""}`,
							{
								body: bodyData,
								headers: { "Content-Type": "application/javascript" },
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
