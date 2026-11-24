import operation from "../../_operations/kv/keys/bulk-get.js";
/**
 * bulk-get command
 * @generated from apis/overlays/kv.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "bulk-get",
	describe: "Get multiple key-value pairs",
	usage:
		"$0 kv keys bulk-get\n\nRetrieves the text-based values of up to 100 keys from the specified Workers KV namespace. The result maps each requested key to its value. Set `type` to `json` to parse JSON values instead of returning strings, and set `withMetadata` to `true` to include metadata with each value. Binary values are not supported by this operation.",
	flags: {
		"namespace-id": {
			kind: "parsed",
			brief: "ID of the Workers KV namespace.",
			parse: String,
		},
		keys: {
			kind: "parsed",
			brief: "Array of keys to retrieve (maximum of 100).",
			variadic: true,
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief:
				"Return values as strings with `text`, or parse stored JSON values with `json`.",
			default: "text",
			choices: ["text", "json"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"with-metadata": {
			kind: "boolean",
			brief: "Whether to include metadata in the response.",
			default: false,
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
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "kv keys bulk-get",
				classification: {
					safeFlags: ["type", "with-metadata", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["keys"] === undefined) {
						throw new Error(
							"--keys is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv keys bulk-get",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/bulk/get`,
						pathParams: { "namespace-id": String(argv["namespace-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										keys: argv["keys"],
										type: argv["type"],
										withMetadata: argv["with-metadata"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Loading`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							namespace_id: argv["namespace-id"],
						})
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					keys: argv["keys"],
					type: argv["type"],
					withMetadata: argv["with-metadata"],
				});
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						namespace_id: argv["namespace-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
