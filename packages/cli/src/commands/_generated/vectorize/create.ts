import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 vectorize create\n\nCreates and returns a new Vectorize Index.")
		.option("config-dimensions", {
			type: "number",
			description: "Specifies the number of dimensions for the index",
		})
		.option("config-metric", {
			type: "string",
			description: "Specifies the type of metric to use calculating distance.",
			choices: ["cosine", "euclidean", "dot-product"],
		})
		.coerce("config-metric", (value: string | undefined) =>
			resolveFileToken(value, "config-metric", "text")
		)
		.option("config-preset", {
			type: "string",
			description: "Specifies the preset to use for the index.",
			choices: [
				"@cf/baai/bge-small-en-v1.5",
				"@cf/baai/bge-base-en-v1.5",
				"@cf/baai/bge-large-en-v1.5",
				"openai/text-embedding-ada-002",
				"cohere/embed-multilingual-v2.0",
			],
		})
		.coerce("config-preset", (value: string | undefined) =>
			resolveFileToken(value, "config-preset", "text")
		)
		.option("description", {
			type: "string",
			description: "Specifies the description of the index.",
		})
		.option("name", { type: "string", description: "The name field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("config-dimensions", ["config-preset"])
		.implies("config-dimensions", ["config-metric"])
		.conflicts("config-metric", ["config-preset"])
		.implies("config-metric", ["config-dimensions"])
		.conflicts("config-preset", ["config-dimensions", "config-metric"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"vectorize-create-vectorize-index">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Vectorize Index",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "vectorize create",
				classification: {
					safeFlags: ["config-metric", "config-preset", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf vectorize create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/vectorize/v2/indexes`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											dimensions: argv["config-dimensions"],
											metric: argv["config-metric"],
											preset: argv["config-preset"],
										},
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.vectorize.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField("name", "The name field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					config: {
						dimensions: argv["config-dimensions"],
						metric: argv["config-metric"],
						preset: argv["config-preset"],
					},
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.vectorize.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
