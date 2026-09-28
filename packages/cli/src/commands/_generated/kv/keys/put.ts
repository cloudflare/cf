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
 * put command
 * @generated from apis/overlays/kv.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 kv keys put <key-name>\n\nWrites a value under the specified key in the Workers KV namespace, creating the key-value pair or replacing its existing value, expiration, and metadata. Send the value as an `application/octet-stream` request body, or use `multipart/form-data` with a `value` part and an optional JSON `metadata` part. Use URL-encoding for special characters (for example, `:`, `!`, `%`) in the key name when constructing the request URL. If neither `expiration` nor `expiration_ttl` is specified, the key-value pair will not expire. If both are set, `expiration_ttl` takes precedence."
		)
		.positional("key-name", {
			type: "string",
			description:
				"A key's name. The name may be at most 512 bytes. All printable, non-whitespace characters are valid. Use percent-encoding to define key names as part of a URL.",
			demandOption: true,
		})
		.option("namespace-id", {
			type: "string",
			description: "ID of the Workers KV namespace.",
			demandOption: true,
		})
		.option("expiration", {
			type: "number",
			description:
				"Expires the key at a certain time, measured in number of seconds since the UNIX epoch.",
		})
		.option("expiration-ttl", {
			type: "number",
			description:
				"Number of seconds until the key expires. Must be at least 60. Takes precedence over `expiration` when both are specified.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "A byte sequence to be stored, up to 25 MiB in length.",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		})
		.option("metadata", {
			type: "string",
			description: "The metadata",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "put <key-name>",
	describe: "Write a key-value pair with optional metadata",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "kv keys put",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					expiration: argv["expiration"],
					expiration_ttl: argv["expiration-ttl"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv keys put",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/values/${argv["key-name"] == null ? "<key-name>" : encodeURIComponent(String(argv["key-name"]))}`,
						pathParams: {
							"key-name": String(argv["key-name"] ?? ""),
							"namespace-id": String(argv["namespace-id"] ?? ""),
						},
						query: queryParams,
						bodyKind:
							argv["metadata"] !== undefined ? "multipart" : "octet-stream",
						body:
							argv["metadata"] !== undefined
								? {
										body: argv["body"],
										file: argv["file"],
										metadata: argv["metadata"],
									}
								: argv.body,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv["metadata"] !== undefined) {
					const formData = new FormData();
					if (argv.file) {
						const fileContent = readFileForFlag(argv.file);
						formData.append(
							"value",
							new Blob([fileContent]),
							argv.file.split(/[\\/]/).filter(Boolean).pop()
						);
					} else if (argv.body !== undefined) {
						formData.append("value", argv.body);
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
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/values/${encodeURIComponent(String(argv["key-name"]))}`,
							{ body: formData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.file) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/values/${encodeURIComponent(String(argv["key-name"]))}`,
							{
								body: fileContent,
								headers: { "Content-Type": "application/octet-stream" },
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
					const qs = new URLSearchParams(
						Object.entries(queryParams)
							.filter(([, v]) => v !== undefined)
							.map(([k, v]) => [k, String(v)])
					).toString();
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/values/${encodeURIComponent(String(argv["key-name"]))}${qs ? "?" + qs : ""}`,
							{
								body: bodyData,
								headers: { "Content-Type": "application/octet-stream" },
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
