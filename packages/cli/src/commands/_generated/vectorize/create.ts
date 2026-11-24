import operation from "../_operations/vectorize/create.js";
/**
 * create command
 * @generated from apis/overlays/vectorize.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Vectorize Index",
	usage: "$0 vectorize create\n\nCreates and returns a new Vectorize Index.",
	flags: {
		"index-config-dimensions": {
			kind: "parsed",
			brief: "Specifies the number of dimensions for the index",
			optional: true,
			parse: Number,
		},
		"index-config-metric": {
			kind: "parsed",
			brief: "Specifies the type of metric to use calculating distance.",
			optional: true,
			choices: ["cosine", "euclidean", "dot-product"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "index-config-metric", "text"),
		},
		"index-config-preset": {
			kind: "parsed",
			brief: "Specifies the preset to use for the index.",
			optional: true,
			choices: [
				"@cf/baai/bge-small-en-v1.5",
				"@cf/baai/bge-base-en-v1.5",
				"@cf/baai/bge-large-en-v1.5",
				"openai/text-embedding-ada-002",
				"cohere/embed-multilingual-v2.0",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "index-config-preset", "text"),
		},
		description: {
			kind: "parsed",
			brief: "Specifies the description of the index.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name field",
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
	operands: [],
	rules(rules) {
		rules.conflicts("index-config-dimensions", ["index-config-preset"]);
		rules.implies("index-config-dimensions", ["index-config-metric"]);
		rules.conflicts("index-config-metric", ["index-config-preset"]);
		rules.implies("index-config-metric", ["index-config-dimensions"]);
		rules.conflicts("index-config-preset", [
			"index-config-dimensions",
			"index-config-metric",
		]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "vectorize create",
				classification: {
					safeFlags: ["index-config-metric", "index-config-preset", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
											dimensions: argv["index-config-dimensions"],
											metric: argv["index-config-metric"],
											preset: argv["index-config-preset"],
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					config: {
						dimensions: argv["index-config-dimensions"],
						metric: argv["index-config-metric"],
						preset: argv["index-config-preset"],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
