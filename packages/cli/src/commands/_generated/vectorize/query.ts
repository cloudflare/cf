import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * query command
 * @generated from apis/overlays/vectorize.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 vectorize query <index-name>\n\nFinds vectors closest to a given vector in an index."
		)
		.positional("index-name", {
			type: "string",
			description: "Index name",
			demandOption: true,
		})
		.option("return-metadata", {
			type: "string",
			description:
				"Whether to return no metadata, indexed metadata or all metadata associated with the closest vectors.",
			choices: ["none", "indexed", "all"],
			default: "none",
		})
		.option("return-values", {
			type: "boolean",
			description:
				"Whether to return the values associated with the closest vectors.",
			default: false,
		})
		.option("top-k", {
			type: "number",
			description: "The number of nearest neighbors to find.",
			default: 5,
		})
		.option("vector", {
			type: "string",
			array: true,
			description:
				"The search vector that will be used to find the nearest neighbors.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"vectorize-query-vector">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "query <index-name>",
	describe: "Query Vectors",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "vectorize query",
				classification: {
					safeFlags: ["return-metadata", "return-values", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf vectorize query",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/vectorize/v2/indexes/${argv["index-name"] == null ? "<index-name>" : encodeURIComponent(String(argv["index-name"]))}/query`,
						pathParams: { "index-name": String(argv["index-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										returnMetadata: resolveFileToken(
											argv["return-metadata"] as string | undefined,
											"return-metadata",
											"text"
										),
										returnValues: argv["return-values"],
										topK: argv["top-k"],
										vector: argv["vector"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Loading`, async () =>
						client.vectorize.query({
							...bodyData,
							account_id: accountId,
							index_name: argv["index-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}
				if (argv["vector"] === undefined) {
					throw new Error(
						"--vector is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					returnMetadata: resolveFileToken(
						argv["return-metadata"] as string | undefined,
						"return-metadata",
						"text"
					),
					returnValues: argv["return-values"],
					topK: argv["top-k"],
					vector: argv["vector"],
				});
				const result = await withProgress(`Loading`, async () =>
					client.vectorize.query({
						...bodyData,
						account_id: accountId,
						index_name: argv["index-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
