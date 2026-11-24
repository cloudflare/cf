import operation from "../../_operations/vectorize/vectors/query.js";
/**
 * query command
 * @generated from apis/overlays/vectorize.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "query <index-name>",
	describe: "Query Vectors",
	usage:
		"$0 vectorize vectors query <index-name>\n\nFinds vectors closest to a given vector in an index.",
	flags: {
		filter: {
			kind: "parsed",
			brief:
				'A metadata filter expression used to limit nearest neighbor results. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"return-metadata": {
			kind: "parsed",
			brief:
				"Whether to return no metadata, indexed metadata or all metadata associated with the closest vectors.",
			default: "none",
			choices: ["none", "indexed", "all"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "return-metadata", "text"),
		},
		"return-values": {
			kind: "boolean",
			brief:
				"Whether to return the values associated with the closest vectors.",
			default: false,
		},
		"top-k": {
			kind: "parsed",
			brief: "The number of nearest neighbors to find.",
			default: "5",
			parse: Number,
		},
		vector: {
			kind: "parsed",
			brief:
				"The search vector that will be used to find the nearest neighbors.",
			variadic: true,
			optional: true,
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
	},
	operands: [{ placeholder: "index-name", brief: "Index name", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "vectorize vectors query",
				classification: {
					safeFlags: ["return-metadata", "return-values", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["vector"] === undefined) {
						throw new Error(
							"--vector is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf vectorize vectors query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/vectorize/v2/indexes/${argv["index-name"] == null ? "<index-name>" : encodeURIComponent(String(argv["index-name"]))}/query`,
						pathParams: { "index-name": String(argv["index-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											filter: parseJsonMap(argv["filter"], "filter"),
											returnMetadata: argv["return-metadata"],
											returnValues: argv["return-values"],
											topK: argv["top-k"],
											vector: argv["vector"],
										},
										[["filter"]]
									),
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
							index_name: argv["index-name"],
						})
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						filter: parseJsonMap(argv["filter"], "filter"),
						returnMetadata: argv["return-metadata"],
						returnValues: argv["return-values"],
						topK: argv["top-k"],
						vector: argv["vector"],
					},
					[["filter"]]
				);
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						index_name: argv["index-name"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
